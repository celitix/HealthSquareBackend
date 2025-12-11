const jwt = require("jsonwebtoken");
const env = require("../../env");

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

    const payload = {
      sub: admin.id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 10,
    };

    const token = jwt.sign(payload, env.TOKEN_SECRET, { algorithm: "HS256" });
    return reply.code(200).send({
      status: true,
      token,
    });
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
