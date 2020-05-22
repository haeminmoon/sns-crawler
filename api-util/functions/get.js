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

exports.getProxyIpList = async (event, context) => {
  if (event.source === 'api-utils-warmer') return

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
    await page.goto('http://spys.one/free-proxy-list/KR/')
    
    const proxies = await page.evaluate(() => {
      const ips = Array.from(document.querySelectorAll('tr > td:first-of-type > .spy14')).map((v) => v.textContent.replace(/document\.write\(.+\)/, ''));
      const types = Array.from(document.querySelectorAll('tr > td:nth-of-type(2)')).slice(5).map((v) => v.textContent);
      const latencies = Array.from(document.querySelectorAll('tr > td:nth-of-type(6) .spy1')).map((v) => v.textContent);
      return ips.map((v, i) => {
        return {
          ip: v,
          type: types[i],
          latency: latencies[i],
        }
      });
    });
    const filtered = proxies.filter((v) => v.type.startsWith('HTTP')).sort((p, c) => p.latency - c.latency);
    
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