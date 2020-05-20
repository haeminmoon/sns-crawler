Object.assign(global, require('ffp-js'));

const { success, failure } = require('/opt/libs/response-lib');
const { SSM } = require('/opt/libs/ssm-lib');
const { MOMENT } = require('../../utils');
const { WT } = require('../../apis');
const { POOL } = require('/opt/libs/postgresql-lib');
const { QUERY, VALUES } = POOL;

/**
 * @description insert payment data to revenueLedger
 * @scheduling 매월 1일
 */
exports.createSalePaymentScheduler = async (event, context) => {
  try {
    const referralProfitRatio = Number(await SSM.getParameter(`/${process.env.STAGE}/referral/settlementRate`))
    const startDate = MOMENT.previousMonth(MOMENT.getCurrentTime(), `YYYY-MM-01T00:00:00`)
    const endDate = MOMENT.getEndOfMonth(startDate, `YYYY-MM-DDT23:59:59`)
    const { data: paymentData } = await WT.getRevenueLedger({
      startDate,
      endDate
    })
    const [{ referral }] = await QUERY`
      SELECT 
        COALESCE(
          jsonb_agg(
            json_build_object(
              'parents_id', id, 
              'influencer_id', ref
            )
          ),
          '[]'
        ) AS referral
      FROM 
        users, 
        jsonb_array_elements(user_info -> 'referral') AS ref 
      WHERE 
        user_info -> 'referral' != '[]'
    `
    const getParentsId = influencer_id => go(
      referral,
      tap(ref => {
        if (!ref) throw Error('cannot find parents id. plz check your child')
      }),
      filter(ref => ref.influencer_id === influencer_id),
      first,
      ref => ref.parents_id
    )
    await go(
      paymentData,
      // spin 정산 테이블에 wt 정산 정보 생성
      b => QUERY`
        INSERT INTO revenue_ledger ${VALUES(b)} RETURNING *
      `,
      // referral id가 있는 정산 정보는 referral_ledger tabel 에 정보 추가
      filter(c => referral.some(ref => ref.influencer_id === c.influencer_id)),
      mapC(ref => QUERY`
        INSERT INTO referral_ledger ${VALUES({
          parents_id: getParentsId(ref.influencer_id),
          influencer_id: ref.influencer_id,
          profit: {
            total: Math.round(ref.profit.total * (referralProfitRatio / 100)),
            spin: 0
          },
          revenue_ledger_id: ref.id,
          settlement_date: ref.settlement_date
        })} RETURNING *
      `),
      _ => ({ status: true, message: 'Item create was successful' }),
      success(event.headers)
    )
  } catch (e) {
    log(e)
    return go({ status: false, message: e.message }, failure(event.headers));
  }
}


/**
 * @description insert payment data to rewardLedger
 * @scheduling 일마다
 */
exports.createRewardPaymentScheduler = async (event, context) => {
  try {
    return go(
      QUERY`
      SELECT
        posting.campaign_id,
        posting.influencer_id,
        (campaign.campaign_info ->> 'sales_price')::INT AS sales_price,
        (campaign.campaign_info ->> 'reward_price')::INT AS reward_price,
        campaign.campaign_info->>'posting_limit' posting_limit,
        posting.posting_url,
        (campaign_info->>'posting_limit')::INT = jsonb_array_length(posting.posting_url) AS is_condition
      FROM
        posting AS posting
      LEFT JOIN
        campaign AS campaign
      ON
        posting.campaign_id = campaign.id
      WHERE
        (campaign.campaign_info ->> 'sale_end_date')::date = now()::date
        AND NOT campaign.type = 'regular'
      `,
      map(data => go(
        data,
        match
          .case(a => !a.posting_limit)(_ => true)
          .case(a => every(post => post.permalink.includes('https://www.instagram.com/p/') >= 0, a.posting_url))(a => a.is_condition || false)
          .else(_ => false),
        is_condition => Object.assign(
          data,
          { is_condition },
          { profit: { fiat: 0, spin: 0, total: data.reward_price - data.sales_price }},
          { payment_date: MOMENT.getCurrentTime('YYYY-MM')}
          ),
        pick(['campaign_id', 'influencer_id', 'sales_price', 'reward_price', 'is_condition', 'profit', 'payment_date']),
        reward_obj => QUERY`INSERT INTO reward_ledger ${VALUES(reward_obj)} RETURNING *`
      )),
      success(event.headers)
    )
  } catch (e) {
    return go({ status: false, message: e.message }, failure(event.headers));
  }

}
