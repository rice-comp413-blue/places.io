const validLatLng = (coordinate) => {
    let lat = coordinate[0];
    let lng = coordinate[1];
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

module.exports = {
    validLatLng: validLatLng
};