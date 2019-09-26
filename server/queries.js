const Pool = require('pg').Pool
const pool = new Pool({
  user: 'blueteam',
  host: 'localhost',
  database: 'app',
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
    postTest
}
