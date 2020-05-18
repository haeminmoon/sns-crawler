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
 * @description: Get facebook page profile from page's id
 * @access { All }
 */
exports.getProfile = async (event, context) => {
  if (event.source === 'api-facebook-warmer') return

  const { id } = convertEvent2inputData(event)

  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    /** Setting */
    const profileDataKeys = [
      'like',
      'follow',
      'imgUrl'
    ]
    
    /** Start crawling */
    await page.goto(`https://www.facebook.com/${id}`)
    await page.waitForSelector('._6tb5.img')
    await page.waitForSelector('._1xnd')

    const targetEls = await page.$$eval('._4bl9', els => els.map(el => el.innerText));
    const profileImgUrl = await page.$eval('._6tb5.img', el => el.src)
    
    await page.close()
    await browser.close()


    /** Result processing */
    const profile = go(
      /**
       * targetEls.length = 7
       * 2 Index = n people like this
       * 3 Index = n people follow this
       */
      [targetEls[2], targetEls[3], profileImgUrl],
      mapL(split(' ')),
      mapL(first),
      takeAll,
      profileDataValues => merge(profileDataKeys, profileDataValues),
      object
    )

    return !(id) 
      ? go({ status: false, message: 'Error params' }, failure)
      : go({ status: true, result: profile }, success)
  } catch (e) {
    await page.close()
    await browser.close()
    return go({ status: false, message: e.message }, failure)
  }
}