Object.assign(global, require('fff-js'))

exports.getBrowser = async (fastProxy=undefined) => {
  if (process.env.LOCAL == 'true') {
    const puppeteer = require('puppeteer-extra')
 
    const StealthPlugin = require('puppeteer-extra-plugin-stealth')
    // puppeteer.use(StealthPlugin())

    return await puppeteer.launch({ 
      headless: false,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
        (isUndefined(fastProxy)) ? '' : `--proxy-server=${fastProxy.ip}`
      ],
      ignoreHTTPSErrors: true
    })
  } else {
    const chromium = require('chrome-aws-lambda')
    const puppeteer = require('puppeteer-extra');

    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
    // puppeteer.use(StealthPlugin());

    return await puppeteer.launch({
      executablePath: await chromium.executablePath,
      args: [
        ...chromium.args,
        (isUndefined(fastProxy)) ? '' : `--proxy-server=${fastProxy.ip}`
      ],
      defaultViewport: chromium.defaultViewport,
      headless: chromium.headless,
    })
  }
}

exports.getChromium = () => require('chrome-aws-lambda')