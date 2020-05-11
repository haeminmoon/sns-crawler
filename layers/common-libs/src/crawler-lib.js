exports.getBrowser = async (env) => {
  if (env == 'mac') {
    const chromium = require('puppeteer')

    return await chromium.launch({
      executablePath: await chromium.executablePath,
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      headless: chromium.headless,
    })
  } else {
    const chromium = require('chrome-aws-lambda')

    return await chromium.puppeteer.launch({
      executablePath: await chromium.executablePath,
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      headless: chromium.headless,
    })
  }
}

// const page = await browser.newPage();

// await page.goto('https://instagram.com');

// await page.close();
// await browser.close();

// await page.waitFor(3000);
// const test = await page.evaluate(() => { 
//   document.querySelector('.sqdOP.L3NKy.y3zKF').type
// });
// console.log(test)

// await page.waitForSelector("h2");
// const message = await page.$$eval("h2", data => {
//   return data.map(element => element.textContent);
// });

// (async () => {
//   try {
//     /**
//      * Credential & Configuration
//      */
//     // const config = [
//     //   process.env.FACEBOOK_EMAIL, 
//     //   process.env.FACEBOOK_PASSWORD
//     // ];
    
//     /**
//      * Initialize puppeteer
//      */
//     const page = await go(
//       puppeteer.launch({ 
//         headless: false, 
//         args: ['--window-size=1920, 1080', '--disable-notifications'] 
//       }),
//       browser => browser.newPage()
//     );

    // await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36');
    // await page.setViewport({ width: 1080, height: 1080 });
    // await page.goto('https://instagram.com');

//     /**
//      * Main & Work
//      */
//     await page.waitFor(3000);
//     await page.evaluate(() => { 
//       console.log(document.querySelector('.sqdOP.L3NKy.y3zKF').click());
//     });
//     // await page.waitFor(3000);
//     // await page.evaluate((config) => { 
//     //   const id = config[0];
//     //   const pw = config[1];

//     //   document.querySelector('#email').value = id;
//     //   document.querySelector('#pass').value = pw;
//     //   document.querySelector('#loginbutton').click();
//     // }, config)
    
//     /**
//      * clear
//      */
//     await page.close();
//     await browser.close();
    
//   } catch (e) {
//     log(e);
//   }
// })();

// module.exports = {
//   login
// }