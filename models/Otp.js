const { Model } = require("objection");
class OTP extends Model {
  static get tableName() {
    return "otps";
  }
}

module.exports = OTP;
