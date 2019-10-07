const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./queries');
const story = require('./controllers/storyController');
const validationMiddleware = require('./middleware/validation');
const upload = require('./models/s3')

const app = express();
const port = 3000;

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
app.post('/submit', story.createStory);
app.post('/view', story.getStoriesInBox);

// example payload: {coord: {lat: 5, lng: 50}}
app.post('/test-middleware', validationMiddleware.isValidCoordinate, db.getTest);

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});

app.post('/submit-story-image', upload.single('file'), function(req, res, next) {
  let url = res.req.file.location;
  res.send('Successfully uploaded files! File in s3 bucket at ' + url);
});