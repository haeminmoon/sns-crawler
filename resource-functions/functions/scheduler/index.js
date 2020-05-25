Object.assign(global, require('/opt/libs/node_modules/fff-js'))

const { success, failure } = require('/opt/libs/response-lib');
const { POOL } = require('/opt/libs/postgresql-lib');
const { QUERY, VALUES, TRANSACTION } = POOL;
const { SPYS } = require('../api');

exports.syncProxyIpListScheduler = async (event, context) => {
  const TR = await TRANSACTION();
  try {
    return go(
      TR.QUERY`DELETE FROM proxies`,
      _ => SPYS.getProxyIpList(),
      a => a.data.result,
      tap(log),
      mapC(a => go(TR.QUERY`INSERT INTO proxies ${ VALUES(a) } RETURNING *`), identity),
      tap(_ => TR.COMMIT()),
      success(event.headers)
    )
  } catch (e) {
    await TR.ROLLBACK()
    return failure(event.headers, e.message);
  }
}

