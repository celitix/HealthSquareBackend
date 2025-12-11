const Inquiry = require("../models/Inquiry");
const { verify, hash } = require("../plugins/bcrypt");

async function inquiry(request, reply) {
  try {
    const { data } = request.body;
    const { name, email, mobile, department, message, appointment_date } = data;

    const newInquiry = await Inquiry.query().insert({
      name,
      email,
      mobile,
      department_type: department || null,
      message: message || null,
      appointment_date: appointment_date || null,
    });

    if (newInquiry) {
      return reply.send({
        status: true,
        message: "Inquiry saved successfully",
      });
    } else {
      return reply.send({
        status: false,
        message: "Inquiry not found",
      });
    }
  } catch (error) {
    console.error("Error saving inquiry:", error);
    return reply.status(500).send({
      status: false,
      error: error.message,
    });
  }
}

module.exports = {
  inquiry,
};
