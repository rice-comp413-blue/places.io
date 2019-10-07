const {Pool} = require('pg');
const auth = require('../connection').db_auth;

const pool = new Pool(auth);

pool.connect(function(err) {
    if (err) throw err;
});

module.exports = pool;
