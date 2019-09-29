const Pool = require('pg').Pool
const pool = new Pool({
  user: 'blueteam',
  host: process.env['HOST'],
  database: 'app',
  password: 'password',
  port: 5432,
})

const psqlTest = (request, response) => {
  pool.query('SELECT 5 * 5', (error, results) => {
    if (error) {
      response.status(404).json(error.toString())
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getTest = (request, response) => {
  pool.query('SELECT * FROM test', (error, results) => {
    if (error) {
      response.status(404).json(error.toString())
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const postTest = (request, response) => {
  const name = request.body.name
  pool.query('INSERT INTO test (name) values ($1)', [name], (error, results) => {
    if (error) {
      throw error
    }
    response.status(201).send(`Success!\n`)
  })
}

module.exports = {
	getTest,
    postTest,
    psqlTest
}
