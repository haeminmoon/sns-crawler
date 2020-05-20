const { SSM } = require('/opt/libs/ssm-lib')
const { config, Group } = require('solapi')
const moment = require('moment')

const MOMENT = {}
const SOLAPI = {}

const addMonth = (date, num, format) => moment(date).add(num, 'M').format(format)
const subtractDate= (date, num, unit, format) => moment(date).subtract(num, unit).format(format)

MOMENT.getCurrentTime = (format) => moment().format(format)
MOMENT.addDay = (date, num, format) => moment(date).add(num, 'd').format(format)
MOMENT.subtractDay = (date, num, format) => subtractDate(date, num, 'd', format)
MOMENT.previousMonth = (date, format) => subtractDate(date, 1, 'M', format)
MOMENT.getEndOfMonth = (date, format) => MOMENT.subtractDay(addMonth(date, 1, `YYYY-MM-01`), 1, format)

const roundDown = (number, decimals = 0) =>
  Math.floor(number * Math.pow(10, decimals)) / Math.pow(10, decimals)

const taxSpin = spin => spin - (roundDown(spin * 0.03, -1) + roundDown(spin * 0.003, -1))


SOLAPI.callInit = async _ => config.init({
  apiKey: await SSM.getSecretParameter(`/${process.env.STAGE}/solapi/apiKey`),
  apiSecret: await SSM.getSecretParameter(`/${process.env.STAGE}/solapi/apiSecret`)
});

SOLAPI.callNotification = async ({text, to, templateId}) => go(
  {
    text,
    subject: '스핀 프로토콜',
    type: 'ATA',
    from: await SSM.getParameter(`/${process.env.STAGE}/solapi/sender`),
    to,
    kakaoOptions: {
      pfId: await SSM.getSecretParameter(`/${process.env.STAGE}/solapi/pfId`),
      templateId: await SSM.getSecretParameter(`/${process.env.STAGE}/solapi/template/${templateId}`)
    }
  },
  Group.sendSimpleMessage
)

module.exports = {
  MOMENT,
  SOLAPI,
  taxSpin,
  moment
}
