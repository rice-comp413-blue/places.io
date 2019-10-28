const pool = require('./db');
const uuid = require('uuid');
// coordinate (required) [lat, lng]
// timestamp (required, in UTC) string
// text (optional) string
// image(optional) image

class Story {
    // Story object constructor
    constructor(story) {
        this.storyid = uuid.v1();
        this.lat = story.lat;
        this.lng = story.lng;
        this.timestamp = story.timestamp;
        this.text = story.text;
        // TODO: this is prob not the right way to handle this, discuss a fix for this
        this.image_url = story.image_url;
    }


    updateImageUrl(url) {
        this.image_url = url;
    }

    static createStory(story, result) {

        pool.query("INSERT INTO story " +
            "(storyid, lat, long, timestamp, text, image_url) values " +
            "($1, $2, $3, $4, $5, $6)",
            [story.storyid, story.lat, story.lng,
                story.timestamp, story.text, story.image_url],
            function (err, record) {
                if (err) {
                    console.log("error: ", err);
                    result(err, null);
                } else {
                    result(null, record.insertId);
                }
            });
    }
}

module.exports = Story;
