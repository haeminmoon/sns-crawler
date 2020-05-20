Object.assign(global, require('ffp-js'))

const { success, failure } = require('/opt/libs/response-lib')
const dynamoDB = require('/opt/libs/dynamodb-lib')
const { SSM } = require('/opt/libs/ssm-lib')
const { AUTH, RL, COINONE } = require('../../apis')
const { MOMENT } = require('../../utils')

exports.paymentScheduler = async (event, context) => {
  try {
    AUTH.setHeadersAuthorization(await SSM.getParameter(`/${process.env.STAGE}/accessKey/spinMasterKey`))
    return await go(
      COINONE.getToken({ currency: 'spin' }),
      ({ data:{ last: spinPrice }}) => go(
        RL.getRevenueLedgerByMonthly({
          startDate: MOMENT.previousMonth(new Date(), 'YYYY-MM'),
          endDate: MOMENT.previousMonth(new Date(), 'YYYY-MM')
        }),
        ({ data: revenueLedgerList }) => revenueLedgerList,
        mapC(data => go(
          {
            TableName: process.env.PAYMENT_TABLE,
            Item: {
              id: data.id,
              campaign_id: data.campaign_id,
              influencer_id: data.influencer_id,
              sales_amount: data.sales_amount,
              sales_price: data.sales_price,
              profit: data.profit_total,
              revenue_ratio: data.revenue_ratio,
              spin_ratio: data.spin_ratio,
              fiat_ratio: data.fiat_ratio,
              address: data.influencer_wallet_address,
              campaign_name: data.campaign_name,
              nickname: data.influencer_nickname,
              phone: data.influencer_phone,
              spin_price: spinPrice
            }
          },
          dynamoDB.createItem,
        )),
        _ => go({ status: true, message: 'Item create was successful' }, success(event.headers))
      )
    )
  } catch (e) {
    log(e)
    return go({ status: false, message: e.message }, failure(event.headers))
  }
}

exports.referralPaymentScheduler = async (event, context) => {
  try {
    AUTH.setHeadersAuthorization(await SSM.getParameter(`/${process.env.STAGE}/accessKey/spinMasterKey`))
    const { data:{ last: spinPrice }} = await COINONE.getToken({ currency: 'spin' })
    const now = MOMENT.getCurrentTime()
    return await go(
      RL.getReferralLedgerByMonthly({
        startDate: MOMENT.previousMonth(now, 'YYYY-MM'),
        endDate: MOMENT.previousMonth(now, 'YYYY-MM')
      }),
      tap(log),
      ({ data: referralLedgerList }) => referralLedgerList,
      filter(a => !a.is_accounted),
      mapC(data => go(
        {
          TableName: process.env.REFERRAL_PAYMENT_TABLE,
          Item: {
            id: data.id,
            revenue_ledger_id: data.revenue_ledger_id,
            parents_id: data.parents_id,
            parents_wallet_address: data.parents_wallet_address,
            influencer_id: data.influencer_id,
            profit: data.profit,
            spin_price: spinPrice,
            created_at: now
          }
        },
        dynamoDB.createItem
      )),
      _ => go(
        {
          status: true,
          message: 'Item create was successful'
        },
        success(event.headers)
      )
    )
  } catch (e) {
    log(e)
    return go({ status: false, message: e.message }, failure(event.headers))
  }
}
