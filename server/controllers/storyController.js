const storyModel = require('../models/storyModel');
const boxModel = require('../models/boxModel');
const healthModel = require('../models/healthModel');
const StoriesCache = require('../cache/cache');
const CACHE_LIMIT = 100; // number of stories the cache can hold at a time
const cache = new StoriesCache(CACHE_LIMIT);

const getStoriesInBox = (req, res) => {
    let newBox = new boxModel(req.body);
    let check = cache.isCached(newBox.latlng1[0], newBox.latlng1[1], newBox.latlng2[0], newBox.latlng2[1]);
    if (check) {
        let cached_response = cache.getView(newBox.latlng1[0], newBox.latlng1[1], newBox.latlng2[0], newBox.latlng2[1], newBox.pagelimit);
        res.status(200).json({"entries": cached_response, "id": newBox.id}) 
    }
    else {
        boxModel.getStoriesInBox(newBox, function (err, record) {
            if (err) {
                res.status(404).json(err.toString());
                throw err;
            } else {
                cache.addView(newBox.latlng1[0], newBox.latlng1[1], newBox.latlng2[0], newBox.latlng2[1], record.rows);
                res.status(200).json({"entries": record.rows, "id": newBox.id});
            }
        });
    }
};

// TODO: this can also benefit from the cache
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

const createStory = (req, res) => {
    let newStory = new storyModel(req.body);
    if (req.file) { newStory.updateImageUrl(req.file.location); }
    storyModel.createStory(newStory, function (err, record) {
        if (err) {
            res.status(404).json(err.toString());
            throw err;
        } else {
            let story = {
                storyid: newStory.storyid,
                timestamp: newStory.timestamp,
                lat: newStory.lat,
                long: newStory.lng,
                text: newStory.text,
                image_url: newStory.imageUrl
            }
            cache.insert(story.lat, story.long, story);
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
