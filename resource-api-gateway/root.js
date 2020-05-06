module.exports = (event, context, callback) => {
  callback({
    statusCode: 404,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
    },
    body: "Not Found"
  });
}