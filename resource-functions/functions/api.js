Object.assign(global, require('/opt/libs/node_modules/fff-js'))
const axios = require('/opt/libs/node_modules/axios')

const utilURL = 'https://5nzuzvjqo5.execute-api.ap-northeast-2.amazonaws.com/dev/util/'

const request = axios.create({ baseURL: utilURL, timeout: 20000 });

const SPYS = {}
/** @description: Free proxy site */
SPYS.getProxyIpList = (param) => request.get('getProxyIpList', { params: param })

module.exports = {
  SPYS
}
