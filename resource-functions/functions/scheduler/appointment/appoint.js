Object.assign(global, require('ffp-js'))

const { success, failure } = require('/opt/libs/response-lib')
const { POOL } = require('/opt/libs/postgresql-lib')
const { QUERY } = POOL

/**
 * @name: appointMainInfluencer
 * @description: 메인 인플루언서 지정
 */
exports.appointMainInfluencer = async (event, context) => {
  try {

    const getIntArrayToStringForQuery = array => `[${array.join(',')}]`

    return go(
      QUERY`
      SELECT
        id,
        campaign_info -> 'main_influencers' AS main_influencers
      FROM
        campaign
      WHERE
        (campaign_info ->> 'sale_start_date')::TIMESTAMPTZ <= NOW() 
        AND NOW() < (campaign_info ->> 'sale_end_date')::TIMESTAMPTZ
        AND type = 'group'
      `,
      filter(({ _, main_influencers }) => main_influencers && main_influencers.length),
      mapC(({ id, main_influencers }) => go(
        main_influencers,
        list => ({ first: list.shift(), list: list }),
        ({ first, list }) => (list.push(first), list),
        list => QUERY`
        UPDATE
          campaign
        SET
          campaign_info = campaign_info || jsonb_build_object('main_influencers', ${getIntArrayToStringForQuery(list)}::JSONB)
        WHERE        
          id = ${id}
        RETURNING
          campaign_info ->> 'main_influencers'
        `
      )),
      success(event.headers)
    )
  } catch (e) {
    return go({ status: false, message: e.message }, failure(event.headers));
  }
}
