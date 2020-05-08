const { log, go } = require('fff-js');

const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const { login } = require('./login.js');

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
        args: ['--window-size=1920, 1080'] 
      }),
      browser => browser.newPage()
    );
    
    await page.setViewport({ width: 1080, height: 1080 });
    await page.goto('https://facebook.com');

    /**
     * Main & Work
     */
    await page.evaluate(login, config);

    /**
     * clear
     */
    await page.close();
    await browser.close();
  } catch (e) {
    log(e);
  }
})();