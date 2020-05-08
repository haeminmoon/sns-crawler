Object.assign(global, require('fff-js'))

const AWS = require('aws-sdk')
AWS.config.update({ region: 'us-west-2' })

const call = (method, params) => {
  const ses = new AWS.SES()
  return ses[method](params).promise()
}

const SES = {}

SES.sendEmail = (sender, recipientEmail, subject, bodyHtml) => {
  const charset = 'UTF-8'
  const recipient = recipientEmail
  const params = {
    Destination: {
      ToAddresses: [ recipient ],
    },
    Message: {
      Subject: {
        Charset: charset,
        Data: subject
      },
      Body: {
        Html: {
          Charset: charset,
          Data: bodyHtml
        }
      }
    },
    Source: sender
  };
  return call('sendEmail', params)
}

exports.SES = SES