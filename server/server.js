const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./queries');
const story = require('./controllers/storyController');
const validationMiddleware = require('./middleware/validation.request.property');
const upload = require('./models/s3')

const app = express();
//const port = 3000;
const port = 1332;

app.use(cors());

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
});

app.get('/test', db.getTest);
app.post('/test', db.postTest);

// actual routes TBD
app.post('/submit', upload.single('file'), story.createStory);

app.post('/view',(req, res, next) => {
	console.log("View request received");
	console.log(req);
	next();
}, story.getStoriesInBox);

// test middleware
app.post('/test-middleware', validationMiddleware.validSubmitRequestProperties, story.createStory);

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});

module.exports = app;
