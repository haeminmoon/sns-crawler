Object.assign(global, require('fff-js'));

exports.getAuthorization = (event) => {
  try{
    let data = event.headers.Authorization;
    (!data) ? data = false : data;
    return data;
  } catch (e) {
    return false;
  }
}

exports.convertEvent2inputData = (event) => {
  if (event.pathParameters) return event.pathParameters;
  else if (event.queryStringParameters) return event.queryStringParameters;
  else if (event.body) return JSON.parse(event.body);
  else return false;
}

exports.queryStr = pipe(
  entriesL,
  mapL(([k, v])=> `${k}=${v}`),
  join('&')
);

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