const jwt = require("jsonwebtoken");
const env = require("../../env");
const User = require("../../models/User");
const generateOtp = require("../../plugins/generateOtp");
const { sendOtptoSMS } = require("../../utils/sendOtp");
const OTP = require("../../models/Otp");
const { hash } = require("../../plugins/bcrypt");

async function login(request, reply) {
  try {
    const { data } = request.body;
    const mobile = data?.mobile ? data.mobile.toString() : null;

    if (!mobile || mobile.trim() === "") {
      return reply.code(400).send({
        status: false,
        message: "Mobile number is required.",
      });
    }

    const admin = await User.query().findOne({
      mobile,
      role: "admin",
    });

    if (!admin) {
      return reply.code(401).send({
        status: false,
        message: "Admin not registered or not authorized.",
      });
    }

    const generatedOtp = await generateOtp();
    const otp = await hash(String(generatedOtp));

    await sendOtptoSMS(generatedOtp, 10, mobile);

    console.log("generatedOtp", generatedOtp);

    const otps = await OTP.query().insert({
      mobile,
      otp,
      expiry_at: new Date(Date.now() + 5 * 60 * 1000),
    });

    const payload = {
      sub: admin.id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 10,
    };

    const token = jwt.sign(payload, env.TOKEN_SECRET, { algorithm: "HS256" });
    return reply.code(200).send({
      status: true,
      message: "OTP sent successfully.",
      otpId: otps.id,
    });
    // return reply.code(200).send({
    //   status: true,
    //   token,
    // });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return reply.code(500).send({
      status: false,
      error: error.message,
    });
  }
}

module.exports = {
  login,
};
