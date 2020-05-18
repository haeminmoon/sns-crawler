Object.assign(global, require('/opt/libs/node_modules/fff-js'))

const { 
  convertEvent2inputData, 
  success, failure,
  queryStr
} = require('/opt/libs/api-util-lib')

const crawlerPath = (process.env.LOCAL == 'true') 
  ? '../../layers/common-libs/src/crawler-lib' 
  : '/opt/libs/crawler-lib'

const { getBrowser } = require(crawlerPath)

/**
 * @name getProfile
 * @description: Get youtube channel profile from channel's id
 * @access { All }
 */
exports.getProfile = async (event, context) => {
  if (event.source === 'api-youtube-warmer') return

  const { id } = convertEvent2inputData(event)

  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    /** Setting */
    const profileDataKeys = [
      'name',
      'subscribers',
      'views'
    ]
    
    /** Start crawling */
    await page.goto(`https://www.youtube.com/channel/${id}/about`)
    await page.waitForSelector('.style-scope .ytd-c4-tabbed-header-renderer .no-transition')
    await page.waitForSelector('#subscriber-count')

    const targetEls1 = await page.$$eval('ytd-channel-about-metadata-renderer > #right-column > yt-formatted-string', els => els.map(el => el.innerText));
    const name = await page.$eval('#inner-header-container > #meta > ytd-channel-name > #container > div#text-container > yt-formatted-string.style-scope.ytd-channel-name', el => el.innerText);
    const subscribers = await page.$eval('#subscriber-count', el => el.textContent);
    const profileImgUrl = await page.$eval('.style-scope .ytd-c4-tabbed-header-renderer .no-transition > img', el => el.src)
    
    await page.close()
    await browser.close()

    /** Result processing */
    const profileData = go(
      /**
       * targetEls1.length = 3
       * 2 Index = n views
       */
      [name, subscribers, targetEls1[2]],
      mapL(el => el.split(' ')),
      mapL(el => first(el)),
      takeAll,
      profileDataValues => merge(profileDataKeys, profileDataValues),
      object
    )
    
    const profile = {
      profileImgUrl: profileImgUrl,
      profileData: profileData
    }

    return !(id) 
      ? go({ status: false, message: 'Error params' }, failure)
      : go({ status: true, result: profile }, success)
      
  } catch (e) {
    await page.close();
    await browser.close();
    return go({ status: false, message: e.message }, failure)
  }
}