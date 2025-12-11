const { default: fastify } = require("fastify");
const usercontroller = require("../controllers/user/UserController.js");
const admincontroller = require("../controllers/admin/AdminController.js");
const inquirycontroller = require("../controllers/InquiryController");
const blogcontroller = require("../controllers/BlogController");
async function userRoute(fastify) {

 fastify.get("/hello", async (req, reply) => {
  reply.send("Hello, Fastify is running!");
});

  fastify.post("/inquiry", inquirycontroller.inquiry);

  fastify.post("/sendotp", usercontroller.sendOtp);
  fastify.post("/verifyotp", usercontroller.verifyOTP);

  fastify.all("/blog", blogcontroller.blogs);
  fastify.all("/blog-show", blogcontroller.edit);
  fastify.all("/delete", blogcontroller.deleteBlog);
  fastify.all("/trash", blogcontroller.trashBlog);
  fastify.all("/recycle", blogcontroller.recycleBlog);
  
}
module.exports = userRoute;
