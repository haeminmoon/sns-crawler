Object.assign(global, require('fff-js'));

const { success, failure, convertEvent2inputData } = require('./utils/api-util');
const { BITTREX } = require('./utils/bittrex');

exports.getBalances = async (event, context) => {
  if (event.source === 'trading-warmer') return ;
  
  try {
    const { credential } = convertEvent2inputData(event);
    return go(
      JSON.parse(credential),
      BITTREX.getBalances,
      ({ result }) => result,
      success
    );
  } catch (e) {
    return go({ status: false, message: e.message }, failure);
  }
}

exports.orderCrossTrading = async (event, context) => {
  if (event.source === 'trading-warmer') return ;
  const orders = [];

  try {
    const { 
      sellCredential, 
      buyCredential, 
      quantity, 
      rate 
    } = convertEvent2inputData(event);

    const macro = pipe(
      _=> BITTREX.sellLimit(
        JSON.parse(sellCredential), 
        'BTC-SPIN', 
        { quantity: quantity, rate: rate }
      ),
      res => {
        if(res.success) 
          orders.push({ credential: JSON.parse(sellCredential), uuid: res.result.uuid });
        else 
          throw new Error(res.message);
      },
      _=> BITTREX.buyLimit(
        JSON.parse(buyCredential), 
        'BTC-SPIN', 
        { quantity: quantity, rate: rate }
      ),
      res => {
        if(res.success) 
          orders.push({ credential: JSON.parse(buyCredential), uuid: res.result.uuid });
        else 
          throw new Error(res.message);
      }
    );

    return await go(
      macro(),
      _=> success({ status: true, message: 'Cross trade ordering succeeded' })
    );
  } catch (e) {
    return await go(
      orders,
      mapC(({ credential, uuid }) => BITTREX.cancelOrder(credential, uuid)),
      _=> success({ status: false, message: e.message })
    );
  }
}

exports.sellLimit = async (event, context) => {
  if (event.source === 'trading-warmer') return ;

  try {
    const { 
      credential,
      quantity, 
      rate 
    } = convertEvent2inputData(event);

    return await go(
      BITTREX.sellLimit(
        JSON.parse(credential), 
        'BTC-SPIN', 
        { quantity: quantity, rate: rate }
      ),
      uuid => success({ status: true, result: uuid, message: 'Sell ordering succeeded' })
    );
  } catch (e) {
    return go({ status: false, message: e.message }, failure);
  }
}


exports.buyLimit = async (event, context) => {
  if (event.source === 'trading-warmer') return ;

  try {
    const { 
      credential,
      quantity, 
      rate 
    } = convertEvent2inputData(event);

    return await go(
      BITTREX.buyLimit(
        JSON.parse(credential), 
        'BTC-SPIN', 
        { quantity: quantity, rate: rate }
      ),
      uuid => success({ status: true, result: uuid, message: 'Buy ordering succeeded' })
    );
  } catch (e) {
    return go({ status: false, message: e.message }, failure);
  }
}


exports.cancelOrders = async (event, context) => {
  if (event.source === 'trading-warmer') return ;

  try {
    const { credential } = convertEvent2inputData(event);
    
    return await go(
      BITTREX.getOpenOrders(JSON.parse(credential), 'BTC-SPIN'),
      ({ result }) => result,
      mapL(({ OrderUuid }) => OrderUuid),
      mapC(uuid => BITTREX.cancelOrder(JSON.parse(credential), uuid)),
      _=> success({ status: true, message: 'Cancle orders succeeded' })
    );
  } catch (e) {
    return go({ status: false, message: e.message }, failure);
  }
}