const OTP = require("../../models/Otp");
const User = require("../../models/User");
const { hash, verify } = require("../../plugins/bcrypt");
const generateOtp = require("../../plugins/generateOtp");
const jwt = require("jsonwebtoken");
const { sendOtptoSMS } = require("../../utils/sendOtp");
const env = require("../../env");

async function Hello(request, reply) {
  return reply.send({ message: "got hello" });
}

async function sendOtp(request, reply) {
  try {
    const { data } = request.body;
    const mobile = data?.mobile ? data.mobile.toString() : null;

    if (!mobile) {
      return reply.code(400).send({
        status: false,
        message: "Mobile number is required.",
      });
    }

    const generatedOtp = await generateOtp();
    const otp = await hash(String(generatedOtp));

    await sendOtptoSMS(generatedOtp, 10, mobile);

    const otps = await OTP.query().insert({
      mobile,
      otp,
      expiry_at: new Date(Date.now() + 5 * 60 * 1000),
    });

    return reply.code(200).send({
      status: true,
      message: "OTP sent successfully.",
      otpId: otps.id,
    });
  } catch (error) {
    console.error("Error saving OTP:", error);
    return reply.code(500).send({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function verifyOTP(request, reply) {
  try {
    const { data } = request.body;
    const otpId = data?.otpId;
    const otp = data?.otp?.toString();
    const mobile = data?.mobile?.toString();

    if (!otpId || !otp) {
      return reply.code(400).send({
        status: false,
        message: "Mobile number and OTP are required.",
      });
    }
    const isOtpExist = await OTP.query().findById(otpId);

    if (!isOtpExist) {
      return reply.code(200).send({
        status: true,
        message: "Invalid OTP.",
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

    const isOtpVerified = verify(otp, isOtpExist.otp);

    if (!isOtpVerified) {
      return reply.code(200).send({
        status: true,
        message: "Invalid OTP.",
      });
    }

    if (isOtpExist.expiry_at < new Date()) {
      await OTP.query().patchAndFetchById(otpId, {
        status: "EXPIRED",
      });
      return reply.code(401).send({
        status: false,
        message: "OTP Expired",
      });
    }

    await OTP.query().deleteById(otpId);

    const payload = {
      sub: admin.id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 10,
    };

    const token = jwt.sign(payload, env.TOKEN_SECRET, { algorithm: "HS256" });

    return reply.code(200).send({
      status: true,
      message: "OTP verified successfully.",
      token,
    });
  } catch (error) {
    return reply.code(500).send({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

module.exports = {
  Hello,
  sendOtp,
  verifyOTP,
};
