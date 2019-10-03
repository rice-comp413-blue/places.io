const pool = require('./db');
// storyID (primary key) varchar
// gridID (required) varchar
// timestamp (required, in UTC) TIMESTAMP
// text (optional) varchar
// bucketName (optional) varchar


class Story {
    // Story object constructor
    constructor(story) {
        this.storyID = story.storyID;
        this.gridID = story.gridID;
        this.text = story.text;
        this.ts = new Date().toUTCString();
        this.bucketName = getBucketName(this.gridID);
    }

    static createStory(story, result) {
        pool.query("INSERT INTO stories " +
            "(storyID, gridID, ts, text, bucketName) values " +
            "($1, $2, $3, $4, $5)",
            [story.storyID, story.gridID, story.ts, story.text, story.bucketName],
            function (err, record) {
                if (err) {
                    console.log("error: ", err);
                    result(err, null);
                } else {
                    console.log(record.insertId);
                    result(null, record.insertId);
                }
            });
    }

    static getStory(result) {
        pool.query("SELECT * FROM stories ORDER BY ts DESC LIMIT 10",
            (err, record) => {
                if (err) {
                    console.log("error: ", err);
                    result(err, null);
                } else {
                    result(null, record);
                }
            });
    }
}

// Bucketname is hardcoded at this point.
function getBucketName(gridID) {
    return "1";
}

module.exports = Story;
