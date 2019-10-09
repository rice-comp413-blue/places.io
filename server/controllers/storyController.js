const storyModel = require('../models/storyModel');
const boxModel = require('../models/boxModel');

const getStoriesInBox = (req, res) => {
    let newBox = new boxModel(req.body);
    boxModel.getStoriesInBox(newBox, function (err, record) {
        if (err) {
            res.status(404).json(err.toString());
            throw err;
        } else {
            res.status(200).json(record.rows);
        }
    });
};

const createStory = (req, res) => {

    let newStory = new storyModel(req.body);

    storyModel.createStory(newStory, function (err, record) {
        if (err) {
            res.status(404).json(err.toString());
            throw err;
        } else {
            // if (req.file) {
            //     let url = req.file.location;
            //     res.status(200).send('Successfully posted a story with image. Image in s3 bucket at ' + url);
            // } else {
            //     res.status(200).send('Successfully posted a story without image.');
            // }
            res.status(200).send('Successfully posted a story without image.');
        }
    });
};

module.exports = {
    createStory,
    getStoriesInBox
};
