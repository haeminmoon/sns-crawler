Object.assign(global, require('/opt/libs/node_modules/fff-js'))

const { success, failure } = require('/opt/libs/response-lib');
const { POOL } = require('/opt/libs/postgresql-lib');
const { VALUES, TRANSACTION } = POOL;
const { SPYS } = require('../api');

exports.syncProxyIpListScheduler = async (event, context) => {
  const TX = await TRANSACTION();
  try {
    return go(
      SPYS.getProxyIpList(),
      proxies => proxies.data.result,
      tap(_ => TX.QUERY`DELETE FROM proxies`),
      mapC(proxy => TX.QUERY`INSERT INTO proxies ${ VALUES(proxy) } RETURNING *`),
      tap(_ => TX.COMMIT()),
      success
    )
  } catch (e) {
    log(e)
    await TX.ROLLBACK()
    return go({ status: false, message: e.message }, failure);
  }
}

