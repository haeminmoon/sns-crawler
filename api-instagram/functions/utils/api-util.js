Object.assign(global, require('ffp-js'));

exports.convertEvent2inputData = (event) => {
  return match(event)
    .case(a => a.pathParameters != null)(a => a.pathParameters)
    .case(a => a.queryStringParameters != null)(a => a.queryStringParameters)
    .case(a => a.body)(a => JSON.parse(a.body))
    .else(_ => false);
}

exports.getAuthorization = (event) => {
  try{
    let data = event.headers.Authorization;
    (!data) ? data = false : data;
    return data;
  } catch (e) {
    return false;
  }
}

exports.queryStr = pipe(
  entriesL,
  mapL(([k, v])=> `${k}=${v}`),
  join('&'));

exports.success = body => buildResponse(200, body);
exports.failure = body => buildResponse(500, body);

function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(body)
  };
}