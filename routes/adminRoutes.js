const { default: fastify } = require("fastify");
const admincontroller = require("../controllers/admin/AdminController.js");

async function adminRoute(fastify) {
   fastify.post("/login", admincontroller.login);
}

module.exports = adminRoute;
