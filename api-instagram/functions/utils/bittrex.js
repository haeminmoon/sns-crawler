Object.assign(global, require('ffp-js'));
const axios = require('axios');
const crypto = require('crypto');

const { queryStr } = require('./api-util');


/***********************
 *     Config area     *
 ***********************/
const CONFIG = {};

CONFIG.NONCE = Date.now();


/***********************
 *  Bittrex main area  *
 ***********************/
const BITTREX = {};

BITTREX.BASE = axios.create({
  baseURL: 'https://api.bittrex.com/api/v1.1',
  timeout: 40000
});

BITTREX.generateSignature = (secret, path, params) => go(
  queryStr(params),
  qs => `${BITTREX.BASE.defaults.baseURL}${path}?${qs}`,
  url => crypto.createHmac('sha512', secret)
    .update(url)
    .digest('hex')
);

BITTREX.request = ({ key, secret }, method, url, { headers = {}, params = {} } = {}) => {
  params.nonce = ++CONFIG.NONCE;
  params.apikey = key;
  headers.apisign = BITTREX.generateSignature(secret, url, params);

  return go(
    BITTREX.BASE.request({ method, url, headers, params }),
    ({ data }) => data
  ); 
}

/**
 * @method getMarkets
 * @param {Object} credential
 * @return {Promise}
 */
BITTREX.getMarkets = (credential) => BITTREX.request(credential, 'get', '/public/getmarkets');

/**
 * @method getCurrencies
 * @param {Object} credential
 * @return {Promise}
 */
BITTREX.getCurrencies = (credential) => BITTREX.request(credential, 'get', '/public/getcurrencies');

/**
 * @method getTicker
 * @param {Object} credential
 * @param {String} currency
 * @return {Promise}
 */
BITTREX.getTicker = (credential, currency) => BITTREX.request(credential, 'get', '/public/getticker', { params: currency });

/**
 * @method getBalances
 * @param {Object} credential
 * @return {Promise}
 */
BITTREX.getBalances = (credential) => BITTREX.request(credential, 'get', '/account/getbalances');

/**
 * @method getBalance
 * @param {Object} credential
 * @param {String} currency
 * @return {Promise}
 */
BITTREX.getBalance = (credential, currency) => {
  if (!currency) throw new Error('currency is required');
  return go(
    { currency },
    params => BITTREX.request(credential, 'get', '/account/getbalance', { params })
  );
}

/**
 * @method buyLimit
 * @param {Object} credential
 * @param {String} market
 * @param {String|Number} options.quantity
 * @param {String|Number} options.price
 * @return {Promise}
 */
BITTREX.buyLimit = (credential, market, { quantity, rate } = {}) => {
  if (!market) throw new Error('market is required');
  if (!quantity) throw new Error('options.quantity is required');
  if (!rate) throw new Error('options.rate is required');

  return go(
    {
      market,
      quantity: parseFloat(quantity).toFixed(8),
      rate : parseFloat(rate).toFixed(8)
    },
    params => BITTREX.request(credential, 'get', '/market/buylimit', { params })
  );
}

/**
 * @method sellLimit
 * @param {Object} credential
 * @param {String} market
 * @param {String|Number} options.quantity
 * @param {String|Number} options.price
 * @return {Promise}
 */
BITTREX.sellLimit = (credential, market, { quantity, rate } = {}) => {
  if (!market) throw new Error('market is required');
  if (!quantity) throw new Error('options.quantity is required');
  if (!rate) throw new Error('options.rate is required');

  return go(
    {
      market,
      quantity: parseFloat(quantity).toFixed(8),
      rate : parseFloat(rate).toFixed(8)
    },
    params => BITTREX.request(credential, 'get', '/market/selllimit', { params })
  );
}

/**
 * @method cancelOrder
 * @param {Object} credential
 * @param {String} uuid
 * @return {Promise}
 */
BITTREX.cancelOrder = (credential, uuid) => {
  if (!uuid) throw new Error('uuid is required');
  
  return go(
    { uuid },
    params => BITTREX.request(credential, 'get', '/market/cancel', { params })
  );
}

/**
 * @method getOpenOrders
 * @param {Object} credential
 * @param {String} market
 * @return {Promise}
 */
BITTREX.getOpenOrders = (credential, market) => go(
  { market },
  params => BITTREX.request(credential, 'get', '/market/getopenorders', { params })
);

module.exports = {
  BITTREX
}
