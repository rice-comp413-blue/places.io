const pool = require('./db');

class Health {
    static getHealth(result) {
        pool.query("SELECT * FROM story where image_url = 'https://comp413-places.s3.amazonaws.com/1572467590447health.jpg'",
            (error, record) => {
                if (error) {
                    console.log("error: ", error);
                    result(error, null);
                } else {
                    result(null, record);
                }
            })
    }
}

module.exports = Health;