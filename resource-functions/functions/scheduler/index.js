Object.assign(global, require('/opt/libs/node_modules/fff-js'))

const { success, failure } = require('/opt/libs/response-lib');

exports.getIpListScheduler = async (event, context) => {
  try {
    return go(
      [1,2,3],
      log
    )
  } catch (e) {
    return failure(event.headers, e.message);
  }
}
