Object.assign(global, require('ffp-js'));

const { success, failure } = require('/opt/libs/response-lib');
const { POOL } = require('/opt/libs/postgresql-lib');
const { QUERY } = POOL;
const { WT } = require('../../apis');
const { moment, MOMENT, SOLAPI } = require('../../utils');

exports.notifyDailySalesScheduler = async (event, context) => {
  try {
    if (process.env.STAGE !== 'prod') return;
    await SOLAPI.callInit();
    return go(
      WT.getEstimatedTotalAccountAll({
        startDate: MOMENT.subtractDay(new Date(), 1, 'YYYY-MM-DD'),
        endDate: moment(new Date()).format('YYYY-MM-DD')
      }),
      ({ data }) => !data
        ? success(event.headers, { status: true, message: "No Content" })
        : go(
          data,
          map(data => pick(['celebId', 'goodsCnt', 'goodsPrice'], data)),
          groupBy(a => a.celebId),
          entries,
          map(([celebId, data]) => go(
            data,
            reduce((a, b) => ({celebId, goodsCnt: Number(a.goodsCnt) + Number(b.goodsCnt), goodsPrice: Number(a.goodsPrice) + Number(b.goodsPrice)}))
          )),
          mapC(({celebId, ...salesData}) => go(
            QUERY`
            SELECT
              user_info ->> 'nickname' AS nickname,
              user_info ->> 'phone' AS phone
            FROM
              users
            WHERE
              id = ${celebId}
            `,
            ([user]) => SOLAPI.callNotification({
              text: `${user.nickname}님~
어제 ${salesData.goodsCnt}건, ${Number(salesData.goodsPrice)}원 판매하셨어요!!
판매금액 묻고 더블로 가~!!
오늘은 더 많이 팔수 있게 힘냅시다!!`,
              to: go(user.phone, split('-'), join('')),
              templateId: 'dailySalesId'
            }),
          )),
          success(event.headers)
        )
    )
  } catch (e) {
    return failure(event.headers, e.message);
  }
}

exports.notifySalesDayScheduler = async (event, context) => {
  try {
    if (process.env.STAGE !== 'prod') return;
    await SOLAPI.callInit();
    return go(
      QUERY`
      SELECT
        name AS campaign_name,
        jsonb_array_elements(applied_influencers) ->> 'nickname' AS nickname,
        jsonb_array_elements(applied_influencers) ->> 'phone' AS phone
      FROM 
        campaign
      WHERE
        (campaign_info ->> 'sale_start_date')::TIMESTAMPTZ
        BETWEEN ${new Date()}
        AND ${MOMENT.addDay(new Date(), 1)}
      `,
      list => !list.length
        ? success(event.headers, { status: true, message: "No Content" })
        : go(
          list,
          mapC(data => SOLAPI.callNotification({
            text: `${data.nickname}님, 
${data.campaign_name}건의 판매가 내일부터 시작됩니다.
  
이번에도 질 좋은 콘텐츠로 많은 판매 있으시길 바래요:)`,
            to: go(data.phone, split('-'), join('')),
            templateId: 'salesDayId'
            })
          ),
          success(event.headers)
        )
    )
  } catch (e) {
    return failure(event.headers, e.message);
  }
}

exports.notifyPaymentScheduler = async (event, context) => {
  try {
    if (process.env.STAGE !== 'prod') return;
    await SOLAPI.callInit();
    return go(
      QUERY`
        SELECT
          userTable.user_info->>'nickname' AS nickname,
          userTable.user_info->>'phone' AS phone,
          profit->>'spin' AS spin,
          profit->> 'fiat' AS fiat
        FROM
          revenue_ledger AS revenueLedgerTable
        LEFT JOIN
          users AS userTable ON revenueLedgerTable.influencer_id = userTable.id
        WHERE
          revenueLedgerTable.settlement_date = ${MOMENT.previousMonth(MOMENT.getCurrentTime(), 'YYYY-MM')}
          AND is_accounted = true
      `,
      list => !list.length
        ? success(event.headers, { status: true, message: "No Content" })
        : go(
          list,
          groupBy(a => a.nickname),
          entries,
          map(([nickname, data]) => go(
            data,
            reduce((a,b) => ({nickname, phone:a.phone, spin: (Number(a.spin) + Number(b.spin)).toFixed(2), fiat: Number(a.fiat) + Number(b.fiat) }))
          )),
          mapC(data => SOLAPI.callNotification({
            text: `${data.nickname}님!
이번 달 너무너무 고생하셨어요:)
마음 같아선 두세배 드리고 싶지만,

${data.fiat}원 / ${data.spin}SPIN 입금해드렸습니다....
다음 달은 두세배를 향해 화이팅!!`,
            to: go(data.phone, split('-'), join('')),
            templateId: 'settlementId'
          })),
          success(event.headers)
        )
      )
  } catch (e) {
    return go({ status: false, message: e.message }, failure(event.headers));
  }
}
