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
    // TODO: req.body validation should be handled by the middleware in the future.
    if (!newStory.timestamp) {
        res.status(400).send({error: true, message: 'Please provide timestamp.'});
    } else if (!newStory.text && !newStory.image) {
        res.status(400).send({error: true, message: 'Please provide text or image or both.'});
    } else {
        storyModel.createStory(newStory, function (err, record) {
            if (err) {
                res.status(404).json(err.toString());
                throw err;
            } else {
                res.status(200).send(`Success!\n`);
            }
        });
    }
};

module.exports = {
    createStory,
    getStoriesInBox
};
