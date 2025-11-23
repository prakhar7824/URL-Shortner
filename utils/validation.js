const validator = require('validator');

function isValidUrl(url) {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true
  });
}

function isValidShortCode(code) {
  const regex = /^[A-Za-z0-9]{6,8}$/;
  return regex.test(code);
}

function generateShortCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = {
  isValidUrl,
  isValidShortCode,
  generateShortCode
};

