const Pool = require('pg').Pool
const pool = new Pool({
  user: 'tianyi',
  host: 'localhost',
  database: 'tianyi',
  password: 'password',
  port: 5432,
})

const getTest = (request, response) => {
  pool.query('SELECT * FROM test', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

module.exports = {
	getTest
}
