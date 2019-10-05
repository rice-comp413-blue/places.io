const pool = require('./db');
// latlng1 (required) [lat, lng]
// latlng2 (required) [lat, lng]


class Box {
    // Box object constructor
    constructor(box) {
        this.latlng1 = box.latlng1;
        this.latlng2 = box.latlng2;
    }

    static getStoriesInBox(box, result) {
        pool.query("SELECT * FROM stories where " +
            "lat <= $1 and lat >= $2 and lng <= $3 and lng >= $4 " +
            "ORDER BY timestamp DESC LIMIT 10",
            [box.latlng1[0], box.latlng2[0], box.latlng2[1], box.latlng1[1]],
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

module.exports = Box;
