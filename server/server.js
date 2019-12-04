const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const story = require('./controllers/storyController');
const validationMiddleware = require('./middleware/validation.request.property');
const upload = require('./connection/s3');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (request, response) => { response.json({ info: 'places.io server' }) });

app.post('/view', validationMiddleware.validViewRequestProperties, story.getStoriesInBox); // view stories

app.post('/submit', upload.single('file'), validationMiddleware.validSubmitRequestProperties, story.createStory);

app.get('/health', story.healthStory); // health check

app.post('/count', story.getTotalStoryCount); // count stories

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});

module.exports = app;
