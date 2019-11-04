const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./controllers/testController');
const story = require('./controllers/storyController');
const validationMiddleware = require('./middleware/validation.request.property');
const upload = require('./connection/s3');

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

app.get('/health', story.healthStory); // health check

// app.post('/submit', validationMiddleware.validSubmitRequestProperties, upload.single('file'), story.createStory);
app.post('/submit', upload.single('file'), story.createStory); // create story

app.post('/view', validationMiddleware.validViewRequestProperties, story.getStoriesInBox); // view stories

app.get('/count', story.getTotalStoryCount); // count stories

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});
