const { log, go } = require('ffp-js');

const login = (...config) => { 
  const id = config[0];
  const pw = config[1];
  
  document.querySelector('#email').value = id;
  document.querySelector('#pass').value = pw;
  document.querySelector('#loginbutton').click();
}

module.exports = {
  login
}