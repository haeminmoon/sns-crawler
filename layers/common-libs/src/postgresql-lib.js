const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
}

const { PostgreSQL } = require('fxsql');
const { CONNECT } = PostgreSQL;

const POOL = CONNECT(config);

exports.POOL = POOL;

const UTILS = {};

/**
 * @name getArrayToStringForQuery
 * @param { Array }
 * @description String 배열을 받아 배열의 String 값을 반환 해주는 함수.
 * @example
 *  ['a','b','c'] -> '["a","b","c"]'
 */
UTILS.getArrayToStringForQuery = array => `["${array.join('","')}"]`;

exports.UTILS = UTILS