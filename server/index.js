const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

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
app.get('/test', db.getTest)
app.post('/test', db.postTest)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
