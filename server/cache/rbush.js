const RBush = require('RBush');

class PointsRBush extends RBush {
    toBBox(item) { return {minX: item.long, minY: item.lat, maxX: item.long, maxY: item.lat}; }
    compareMinX(a, b) { return a.x - b.x; }
    compareMinY(a, b) { return a.y - b.y; }
}

module.exports = PointsRBush;