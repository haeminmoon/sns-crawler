Object.assign(global, require('/opt/libs/node_modules/fff-js'))

const { POOL } = require('/opt/libs/postgresql-lib');
const { QUERY } = POOL;
const { 
  convertEvent2inputData, 
  success, failure,
  queryStr
} = require('/opt/libs/api-util-lib')

const crawlerPath = (process.env.LOCAL == 'true') 
  ? '../../layers/common-libs/src/crawler-lib' 
  : '/opt/libs/crawler-lib'

const { getBrowser } = require(crawlerPath)

exports.getProxyIpList = async (event, context) => {
  if (event.source === 'api-utils-warmer') return

  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    /** Start crawling */
    await page.goto('http://spys.one/free-proxy-list/KR/')
    
    await page.waitForSelector('#xpp')

    await page.evaluate(() => {
      const itemsCount = document.querySelector('#xpp')
      itemsCount.selectedIndex = 5
      itemsCount.onchange()
    })

    await page.waitForNavigation()
    await page.waitForSelector('#xpp')
    await page.waitForSelector('tr > td:nth-of-type(6) .spy1')
    
    const ips = await page.$$eval('tr > td:first-of-type > .spy14', ips => ips.map(v => v.textContent))
    const types = await page.$$eval('tr > td:nth-of-type(2)', types => types.map(v => v.textContent))
    const latencies = await page.$$eval('tr > td:nth-of-type(6) .spy1', latencies => latencies.map(v => v.textContent))
    
    await page.close()
    await browser.close()

    /** Result processing */
    const proxies = go(
      rangeL(ips.length),
      mapL(i => ({
        ip: ips[i].replace(/document\.write\(.+\)/, ''),
        type: types[i],
        latency: latencies[i],
      })),
      filter(a => a.type.startsWith('HTTP'))
    )

    return go({ status: true, result: proxies }, success)
  } catch (e) {
    await page.close();
    await browser.close();
    return go({ status: false, message: e.message }, failure)
  }
}