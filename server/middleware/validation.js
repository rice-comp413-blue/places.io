exports.isValidCoordinate = (req, res, next) => {
    if (req.body.hasOwnProperty("coord")) {
        let user_coord = req.body.coord;
        if (user_coord["lat"] <= 90 && user_coord["lat"] >= -90 && user_coord["lng"] <= 180 && user_coord["lng"] >= -180) {
            return next();
        } else {
            return res.status(403).send("Invalid coordinate received.");
        }
    } else {
        return res.status(403).send("Coordinate data required.")
    }
    
}
