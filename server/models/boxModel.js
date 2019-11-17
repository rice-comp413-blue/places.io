const pool = require("../connection/db");
// latlng1 (required) [lat, lng]
// latlng2 (required) [lat, lng]

class Box {
  // Box object constructor
  constructor(box) {
    this.latlng1 = box.latlng1;
    this.latlng2 = box.latlng2;
    this.id = box.id;
    this.skip = box.skip;
    this.pagelimit = box.pagelimit;
  }

  static getStoriesInBox(box, result) {
    pool.query(
      "SELECT * FROM story WHERE " +
        "lat <= $1 and lat >= $2 and long <= $3 and long >= $4 " +
        "ORDER BY timestamp DESC OFFSET $5 LIMIT $6",
      [
        box.latlng1[0],
        box.latlng2[0],
        box.latlng2[1],
        box.latlng1[1],
        box.skip,
        box.pagelimit
      ],
      (err, record) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
        } else {
          result(null, record);
        }
      }
    );
  }

  static getTotalStoryCount(req, result) {
    pool.query(
      "SELECT COUNT(storyid) FROM story " +
        "WHERE lat <= $1 and lat >= $2 and long <= $3 and long >= $4",
      [req.latlng1[0], req.latlng2[0], req.latlng2[1], req.latlng1[1]],
      (err, record) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
        } else {
          result(null, record.rows[0].count);
        }
      }
    );
  }
}

module.exports = Box;
