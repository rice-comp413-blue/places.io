const { Pool } = require("pg");
const s3config = require("./s3config.json");
const secrets = require("../../secrets.json");

const pool = new Pool({
  ...s3config,
  user: secrets.AWS.username,
  password: secrets.AWS.password
});

pool.connect(function(err) {
  if (err) throw err;
});

module.exports = pool;
