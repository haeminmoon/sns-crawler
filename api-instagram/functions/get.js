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
 * @description: Get instagram profile from instagram user's ID
 * @access { All }
 */
exports.getProfile = async (event, context) => {
  if (event.source === 'api-instagram-warmer') return

  const { id } = convertEvent2inputData(event)

  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    /** Setting */
    const profileDataKeys = [
      'posts',
      'followers',
      'following',
      'imgUrl'
    ]

    /** Start crawling */
    await page.goto(`https://instagram.com/${id}`)
    await page.waitForSelector('main.SCxLW.o64aR')
    const targetEls = await page.$$eval('.g47SY', els => els.map(el => el.textContent))
    // mac
    // const profileImgUrl = await page.$eval('._6q-tv', el => el.src)
    // linux
    const profileImgUrl = await page.$eval('img._6q-tv', el => el.src)
    

    await page.close()
    await browser.close()

    /** Result processing */
    const profile = go(
      [...targetEls, profileImgUrl],
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

  // await page.waitFor('3000')
  // await page.waitForNavigation(); // facebook 로그인으로 넘어가는 것을 기다려요
  // await page.waitForSelector('#email');