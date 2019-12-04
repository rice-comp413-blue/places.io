const storyModel = require('../models/storyModel');
const boxModel = require('../models/boxModel');
const healthModel = require('../models/healthModel');
const axios = require('axios');

const getStoriesInBox = (req, res) => {
    let newBox = new boxModel(req.body);
    boxModel.getStoriesInBox(newBox, function (err, record) {
        if (err) {
            res.status(404).json(err.toString());
            throw err;
        } else {
            res.status(200).json({"entries": record.rows, "id": newBox.id});
        }
    });
};

const getTotalStoryCount = (req, res) => {
    boxModel.getTotalStoryCount(req.body, (err, count) => {
        if (err) {
            res.status(404).json(err.toString());
            throw err;
        } else {
            res.status(200).json({"count": count});
        }
    })
};

const createStory = async (req, res) => {
    let newStory = new storyModel(req.body);

    // reverse geocoding on the selected coordinates
    let nominatimQuery = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${req.body.lat}&lon=${req.body.lng}`;
    await axios.get(nominatimQuery).then((res) => { newStory.updateAddress(res.data.display_name); });

    if (req.file) { newStory.updateImageUrl(req.file.location); }

    storyModel.createStory(newStory, function (err, record) {
        if (err) {
            res.status(404).json(err.toString());
            throw err;
        } else {
            if (req.file) {
                let url = req.file.location;
                res.status(201).send('Successfully posted a story with image. Image in s3 bucket at ' + url);
            } else {
                res.status(201).send('Successfully posted a story without image.');
            }
        }
    });
};

const healthStory = (req, res) => {
    healthModel.getHealth(function (err, record) {
        if (err) {
            res.status(404).json(err.toString());
            throw err;
        } else {
            res.status(200).json(record.rows);
        }
    })
};

module.exports = {
    createStory,
    getStoriesInBox,
    getTotalStoryCount,
    healthStory,
};
