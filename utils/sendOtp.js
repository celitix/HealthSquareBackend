const axios = require("axios");
const env = require("../env");

async function sendOtptoSMS(otp, ttl = 10, mbno) {
  try {
    const message = `Your One Time Password for healthsquare.in is ${otp} valid for ${ttl} minutes. Do not share this with anyone.`;

    const paylod = {
      listsms: [
        {
          sms: message,
          mobiles: mbno,
          senderid: env.SENDERID,
          tempid: env.TEMPLATE_ID,
          entityid: env.ENTITY_ID,
          unicode: "0",
        },
      ],
    };

    const headers = {
      key: env.API_KEY,
      "Content-Type": "application/json",
    };
    const res = await axios.post(
      "https://api.celitix.com/rest/sms/sendsms",
      paylod,
      { headers }
    );

    return true;
  } catch (e) {
    throw new Error(e);
  }
}

module.exports = {
  sendOtptoSMS,
};
