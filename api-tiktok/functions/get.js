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
 * @description: Get Tiktok profile from user's ID
 * @access { All }
 */
exports.getProfile = async (event, context) => {
  if (event.source === 'api-tiktok-warmer') return

  const { id } = convertEvent2inputData(event)

  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    /** Setting */
    const profileDataKeys = [
      'following',
      'followers',
      'likes'
    ]

    /** Start crawling */
    await page.goto(`https://www.tiktok.com/@${id}`)
    await page.waitForSelector('#main')
    await page.waitForSelector('.jsx-581822467.jsx-3479153002.jsx-4025130069.avatar')
    await page.waitForSelector('h2.jsx-2971206140.count-infos')
    const profileDataValues = await page.$$eval('.jsx-2971206140.number', els => els.map(el => el.textContent))
    const profileImgUrl = await page.$eval('.jsx-581822467.jsx-3479153002.jsx-4025130069.avatar-wrapper.round', el => el.src)
    
    await page.close()
    await browser.close()

    /** Result processing */
    const profileData = go(
      merge(profileDataKeys, profileDataValues),
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