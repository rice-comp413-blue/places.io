const validLatLng = require("./validation.latlng");

var validViewRequestBody = (req, res, next) => {
    if (req.body.hasOwnProperty("latlng1") && req.body.hasOwnProperty("latlng2") 
        && validLatLng(req.body.latlng1) && validLatLng(req.body.latlng2)) {
        return next();
    } else {
        return res.status(400).send("Invalid request body.");
    }
}

var validSubmitRequestBody = (req, res, next) => {
    if (req.body.image) {
        req.body.hasImage = true;
    }
    if (req.body.hasOwnProperty("coordinate") 
        && req.body.hasOwnProperty("timestamp") 
        && (req.body.hasOwnProperty("text") || req.body.hasOwnProperty("image"))
        && validLatLng.validLatLng(req.body.coordinate)) {
        return next();
    } else {
        return res.status(400).send("Invalid request body.")
    }
}

module.exports = {
    validSubmitRequestProperties: validSubmitRequestBody, 
    validViewRequestProperties: validViewRequestBody
}