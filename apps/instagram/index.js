const { log, go } = require('ffp-js');

const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
// const { login } = require('./login.js');

dotenv.config();

(async () => {
  try {
    /**
     * Credential & Configuration
     */
    const config = [
      process.env.FACEBOOK_EMAIL, 
      process.env.FACEBOOK_PASSWORD
    ];
    
    /**
     * Initialize puppeteer
     */
    const page = await go(
      puppeteer.launch({ 
        headless: false, 
        args: ['--window-size=1920, 1080', '--disable-notifications'] 
      }),
      browser => browser.newPage()
    );
    
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36');
    await page.setViewport({ width: 1080, height: 1080 });
    await page.goto('https://instagram.com');

    /**
     * Main & Work
     */
    await page.waitFor(3000);
    await page.evaluate(() => { 
      document.querySelector('.sqdOP.L3NKy.y3zKF').click();    
    });
    await page.waitFor(3000);
    await page.evaluate((config) => { 
      const id = config[0];
      const pw = config[1];

      document.querySelector('#email').value = id;
      document.querySelector('#pass').value = pw;
      document.querySelector('#loginbutton').click();
    }, config)
    
    /**
     * clear
     */
    // await page.close();
    // await browser.close();
    
  } catch (e) {
    log(e);
  }
})();