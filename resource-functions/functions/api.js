const axios = require('axios')
const { match } = require('ffp-js')

const spinURL = match(process.env.STAGE)
  .case(stage => stage === 'prod')(_ => 'https://api.spinprotocol.com')
  .case(stage => stage === 'staging')(_ => 'https://api.staging.spin-protocol.com')
  .else(_ => 'https://api.dev.spin-protocol.com')

const coinoneURL = 'https://api.coinone.co.kr'
const wtURL = 'https://api.womanstalk.co.kr/celeb/'

const spinRequest = axios.create({ baseURL: spinURL, timeout: 20000 });
const coinoneRequest = axios.create({ baseURL: coinoneURL, timeout: 20000 });
const wtRequest = axios.create({ baseURL: wtURL, timeout: 30000 });

spinRequest.interceptors.request.use(config => {
  config.headers.Authorization = AUTH.token
  return config
})

const AUTH = {}
AUTH.token = null
AUTH.setHeadersAuthorization = authorizationToken => { AUTH.token = authorizationToken }

const COINONE = {}
/** @description: 코인원 토큰 조회 */
COINONE.getToken = params => coinoneRequest.get(`/ticker?&format=json`, { params })

const BAPP = {};
BAPP.revenueShare = body => spinRequest.post('/bApp/klaytn_revenueShare', body)
BAPP.referralShare = body => spinRequest.post('/bApp/klaytn_referral_share', body)

const TX = {};
TX.payment = body => spinRequest.post('/transaction/tx_payment', body)
TX.referralPayment= body => spinRequest.post('/transaction/tx_referral_payment', body)

const RL = {};
RL.getRevenueLedgerByMonthly = params => spinRequest.get('revenueLedger/get_revenue_ledger_by_monthly', { params })
RL.updateRevenueLedger = body => spinRequest.post('revenueLedger/update_revenueLedger', body)
RL.getReferralLedgerByMonthly = params => spinRequest.get('revenueLedger/get_referral_ledger_by_monthly', { params })
RL.updateReferralLedger = body => spinRequest.post('revenueLedger/update_referralLedger', body)

const WT = {}
/** @description: wt 정산 정보 조회 */
WT.getRevenueLedger = param => wtRequest.get('get_revenue_ledger.php', { params: param })
/** @description wt 판매 정보 조회 */
WT.getEstimatedTotalAccountAll = param => wtRequest.get('get_estimated_total_account_all', { params: param })


module.exports = {
  AUTH,
  COINONE,
  BAPP,
  TX,
  RL,
  WT
}
