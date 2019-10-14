var validLatLng = (coordinate) => {
    let lat = coordinate[0];
    let lng = coordinate[1];
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    validLatLng: validLatLng
}