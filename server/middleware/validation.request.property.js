const validLatLng = require("./validation.latlng");

const validViewRequestBody = (req, res, next) => {
    if (req.body.hasOwnProperty("latlng1") && req.body.hasOwnProperty("latlng2")
        && validLatLng.validLatLng(req.body.latlng1) && validLatLng.validLatLng(req.body.latlng2)) {
        return next();
    } else {
        return res.status(400).send("Invalid request body.");
    }
};

const validSubmitRequestBody = (req, res, next) => {
    req.body = JSON.parse(JSON.stringify(req.body));
    if (req.body.hasOwnProperty("lat")
        && req.body.hasOwnProperty("lng")
        && req.body.hasOwnProperty("timestamp")
        && (req.body.hasOwnProperty("text") || req.body.hasOwnProperty("file"))
        && validLatLng.validLatLng([req.body.lat, req.body.lng])) {
        return next();
    } else {
        return res.status(400).send("Invalid request body.");
    }
};

module.exports = {
    validSubmitRequestProperties: validSubmitRequestBody, 
    validViewRequestProperties: validViewRequestBody
};