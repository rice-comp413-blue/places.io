const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const app = express()
const port = 3000

app.use(cors());

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})

const db = require('./queries')
app.get('/test1', db.psqlTest)
app.get('/test2', db.getTest)
app.post('/test3', db.postTest)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
