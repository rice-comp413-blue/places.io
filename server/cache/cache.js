const PointsRBush = require("./rbush.js")
const LRU = require("lru-cache")

// lat is vertical, lon is horizontal O_O

/**
 * what is cached is based on view requests
 * view requests are maintained by submits
 * assumes:
 * - no deletes/modifications to the stories
 * - some other things
 * 
 * cap is based on the total number of stories
 *  in the cache but may be modified to include
 *  other things in the future like number of intervals
 * 
 * ... <insert more documentation here>
 */
class StoriesCache {
    constructor(storyLimit, intervalLimit = 0) {
        let options = { 
            max: storyLimit,
            dispose: (key, value) => { this.evict(key, value) },
            length: (value, key) => { return value.length; }
        }
        this.cache = new LRU(options); // a cache 
        this.intervals = new Set(); // maintain a set of intervals for ease of access
        this.rbush = new PointsRBush(); // the r tree based data store
    }

    coordsToString (lat1, lon1, lat2, lon2) {
        return lat1 + "-" + lon1 + "-" + lat2 + "-" + lon2;
    }

    stringToCoords (key) {
        return key.split("-").map(x => parseFloat(x));
    }

    isCached (lat1, lon1, lat2, lon2) {
        let flag = false;
        this.intervals.forEach(interval => {
            // check if this search box is within the bounds of an existing cached box
            if (lat1 <= interval[0] && lon1 >= interval[1] && lat2 >= interval[2] && lon2 <= interval[3]) {
                flag = true;
            }
        })
        return flag;
    }

    isNonOverlapping (lat1, lon1, lat2, lon2) {
        let flag = true;
        this.intervals.forEach(interval => {
            // check if this search box is within the bounds of an existing cached box
            if (lat1 <= interval[0] || lon1 >= interval[1] || lat2 >= interval[2] || lon2 <= interval[3]) {
                flag = false;
            }
        })
        return flag;
    }

    evict (key, stories) {
        this.intervals.remove(this.stringToCoords(key));
        // this is potentially expensive
        stories.forEach(story => {
            this.rbush.remove(story, (a, b) => {
                return a.id === b.id;
            });
        })
    }

    addView (lat1, lon1, lat2, lon2, stories) {
        if (!this.isNonOverlapping(lat1, lon1, lat2, lon2)) { return false; }
        let range_key = this.coordsToString(lat1, lon1, lat2, lon2);
        this.intervals.add([lat1, lon1, lat2, lon2]);
        this.cache.set(range_key, new Set(stories));
        stories.forEach(story => {this.rbush.insert(story)});
    }

    getView (lat1, lon1, lat2, lon2, max, skip) {
        const box = this.rbush.search({
            minX: lon1,
            minY: lat2,
            maxX: lon2,
            maxY: lat1
        });
        var final = [];
        for (var i = skip; i < skip + max; i++) {
            if (box[i] == null) { break; }
            final.push(box[i]);
        }
        return final;
    }

    /**
     * returns true if inserted into cache
     */
    insert (lat, lng, story) {
        var inserted = false;
        this.intervals.forEach(interval => {
            // extra insurance because i dont want for us to redploy again
            let notNull = interval && interval !== "null" && interval !== "undefined";
            // if the story is in the interval we can insert it, otherwise we do nothing
            if (notNull && interval[0] >= lat >= interval[2] && interval[1] <= lng <= interval[3]) {
                let range_key = this.coordsToString(
                    interval[0], interval[1], interval[2], interval[3]
                );
                this.cache.get(range_key).add(story);
                this.rbush.insert(story);
                inserted = true;
            }
        })
        return inserted;
    }

    size () {
        return this.cache.length;
    }
    
    all () {
        return this.rbush.all();
    }

}

module.exports = StoriesCache;
