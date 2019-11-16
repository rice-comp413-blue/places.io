const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const story = require('./controllers/storyController');
const validationMiddleware = require('./middleware/validation.request.property');
const upload = require('./connection/s3');

const app = express();
const port = 1331;
//const port = 3000;

const mockResponse = {
	  "entries": [
		      {
			            "storyid": "def981c0-f059-11e9-b7b7-2917fbf11a40",
			            "timestamp": "2019-10-17T02:12:18.000Z",
			            "lat": 9,
			            "long": 9,
			            "text": "helloworld",
			            "image_url": null
			}
	  ],
	"id":"ee66bf5b-524b-4786-ba88-0e9e8026dbca"
}


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (request, response) => { response.json({ info: 'places.io server' }) });

//app.post('/view', 
//	(req,resp,next) => {
//	console.log(req);
//	next();
//}, validationMiddleware.validViewRequestProperties, story.getStoriesInBox); // view stories

app.post('/view',
	        (req,resp,next) => {
			console.log(req);
			res.send(mockResponse) // Send hard-coded response
			return ; // Stop early here. 
		}, validationMiddleware.validViewRequestProperties, story.getStoriesInBox); // view stories

// res.send({id:aaa})

app.post('/submit', upload.single('file'), validationMiddleware.validSubmitRequestProperties, story.createStory);

app.get('/health', story.healthStory); // health check

app.post('/count', story.getTotalStoryCount); // count stories

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});

module.exports = app;
