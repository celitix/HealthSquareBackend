const Domain = require("../models/Domain");
async function Nanoid(count = 5, id = "") {
  const { nanoid } = await import("nanoid");
  return nanoid(count) + id;
}



module.exports = { Nanoid};
