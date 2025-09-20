import "dotenv/config";
const bcrypt = require("bcrypt");
bcrypt.hash(process.env.ADMIN_PWD, 10)
  .then(hash => console.log("HASH:", hash))
  .catch(err => console.error(err));