const {Pool} = require('pg');
const secrets = require("../secrets.json");

const pool = new Pool(secrets.AWS.dbAuth);

pool.connect(function(err) {
    if (err) throw err;
});

module.exports = pool;
