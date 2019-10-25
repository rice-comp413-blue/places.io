const pool = require('./db');
// latlng1 (required) [lat, lng]
// latlng2 (required) [lat, lng]


class Box {
    // Box object constructor
    constructor(box) {
        this.lat1 = box.lat1;
        this.lng1 = box.lng1;
        this.lat2 = box.lat2;
        this.lng2 = box.lng2;
    }

    static getStoriesInBox(box, result) {
        pool.query("SELECT * FROM story where " +
            "lat <= $1 and lat >= $2 and long <= $3 and long >= $4 " +
            "ORDER BY timestamp DESC LIMIT 10",
            [box.lat1, box.lat2, box.lng2, box.lng1],
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
