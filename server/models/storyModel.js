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
        this.coordinate = story.coordinate;
        this.timestamp = story.timestamp;
        this.text = story.text;
        this.hasimage = false;
    }

    updateImageFlag(flag) {
        this.hasimage = flag;
    }

    static createStory(story, result) {

        pool.query("INSERT INTO story " +
            "(storyid, lat, long, timestamp, text, hasimage) values " +
            "($1, $2, $3, $4, $5, $6)",
            [story.storyid, story.coordinate[0], story.coordinate[1],
                story.timestamp, story.text, story.hasimage],
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
