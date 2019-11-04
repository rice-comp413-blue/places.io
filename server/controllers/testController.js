const {Pool} = require('pg')
const Auth = require('../connection/connection.js').db_auth

const pool = new Pool(Auth)

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
  postTest
}
