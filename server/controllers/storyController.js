const storyModel = require('../models/storyModel');

const getStory = (req, res) => {
    storyModel.getStory(function (err, record) {
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
    if (!newStory.storyID) {
        res.status(400).send({ error:true, message: 'Please provide story ID.' });
    } else if (!newStory.gridID) {
        res.status(400).send({ error:true, message: 'Please provide grid ID.' });
    } else if (!newStory.ts) {
        res.status(400).send({ error:true, message: 'Please provide timestamp.' });
    } else if (!newStory.text && !newStory.bucketName) {
        res.status(400).send({ error:true, message: 'Please provide text or bucket name or both.' });
    } else {
        console.log("inserting...")
        storyModel.createStory(newStory, function(err, record) {
            if (err) {
                res.status(404).json(err.toString());
            } else {
                res.status(200).send(`Success!\n`);
            }
        });
    }
}

module.exports = {
    createStory,
    getStory
}
