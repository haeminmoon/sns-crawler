const login = (go, ...config) => { 
  const id = config[0];
  const pw = config[1];
  
  document.querySelector('.izU2O').querySelector('a').click();
  setTimeout(function() {
    console.log('Works!');
    document.querySelector('input[name=username]').value = id;
    document.querySelector('input[name=password]').value = pw;
    document.querySelector('.sqdOP.L3NKy.y3zKF').click();
  }, 3000);
  
}

module.exports = {
  login
}