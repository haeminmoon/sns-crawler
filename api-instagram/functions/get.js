Object.assign(global, require('fff-js'))

const { 
  convertEvent2inputData, 
  success, failure,
  queryStr
} = require('/opt/libs/api-util-lib')

const { getBrowser } = require('/opt/libs/crawler-lib')

/**
 * @name getProfile
 * @description: Get instagram profile from instagram user's ID
 * @access { All }
 */
exports.getProfile = async (event, context) => {
  if (event.source === 'api-instagram-warmer') return

  const { id } = convertEvent2inputData(event)

  try {
    const browser = await getBrowser('mc');
    const page = await browser.newPage();

    await page.goto('https://instagram.com');

    await page.waitFor(3000);
    const test = await page.evaluate(() => { 
      document.querySelector('.sqdOP.L3NKy.y3zKF').type
    });
    console.log(test)

    await page.close();
    await browser.close();

    return !(id) 
      ? go({ status: false, message: 'Error params' }, failure)
      : go(
        [1,2,3],
        log
      )
  } catch (e) {
    return go({ status: false, message: e.message }, failure)
  }
}