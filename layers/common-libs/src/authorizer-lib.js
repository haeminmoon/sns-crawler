Object.assign(global, require('fff-js'));

const AUTH = {};

/**
 * @name setAuthorization
 * @param { Object } event 
 * @returns { Object } authorization object { email, auth }
 * @description `event`의 권한 객체에 LOCAL 환경 변수 값을 확인해서 알맞은 권한 값을 셋팅하는 함수
 */
const setAuthorization = event => {
  if (process.env.LOCAL === 'true') {
    event.requestContext.authorizer = {
      email: event.headers.email,
      auth: event.headers.auth
    }
  }
  return event.requestContext.authorizer
}

/**
 * @name isAuthorized
 * @param { Object } event
 * @param { Array } accessAuthList 
 * @returns { Boolean } true || false
 * @description: `event` 의 auth 가 `accessAuthList`에 해당하는지 검사
 */
AUTH.isAuthorized = (event, ...accessAuthList) => go(
  accessAuthList,
  flatL,
  takeAll,
  a => a.some(auth => auth === go(event, setAuthorization, ({ auth }) => auth))
);

AUTH.USER_ROLE = {
  all: ['admin', 'user','test'],
  admin: ['admin', 'test'],
  user: ['business', 'test']
};
exports.AUTH = AUTH
