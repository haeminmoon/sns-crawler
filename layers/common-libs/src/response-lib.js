const { curry, go } = require('fff-js')

exports.success = curry((headers, body) => buildResponse(200, body, headers))
exports.failure = curry((headers, body) => buildResponse(500, body, headers))
exports.badRequest = curry((headers, body) => buildResponse(400, body, headers))

const accessOriginList =
  [
    'http://localhost:8080',
    'https://dev.xx.io',

  ]

const accessHostList =
  [
    'localhost:3000',
    'localhost:3001',
    'localhost:3002',
    'localhost:3003',
    'localhost:3004',
    'localhost:3005',
    'localhost:3006',
    'localhost:3007',
    'localhost:3008',
    'localhost:3009',
    'localhost:3010',
    'localhost:3011',
    'localhost:3012',
    'api.dev.xx.io',
  ]

function buildResponse (statusCode, body, headers){
  return go(
    accessOriginList,
    list => !headers
      ?  ({
        statusCode: 200,
        body: 'access schedule'
      })
      : go(
        list,
        list => list.some(a => a === headers.origin),
        bool => !bool && !accessHostList.some(a => a === headers.Host)
          ? ({
            statusCode: 405,
            body: 'not allowed access'
          })
          : ({
            statusCode: statusCode,
            headers: {
              'Access-Control-Allow-Origin': headers.origin,
              'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(body)
          })
      )
  )
}
