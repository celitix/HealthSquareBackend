const crypto = require("crypto");

async function generateOtp() {
  return crypto.randomInt(100000, 999999);
}

module.exports = generateOtp;
