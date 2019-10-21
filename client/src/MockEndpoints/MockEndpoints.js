const _ = require("lodash")

const MockEndpoints = {
    view: (upperLeft, bottomRight) => {
        const results = [];
        const textInputs = ["Hey, I'm at Rice!", "What's up guys?", "Check out my story"]
        for (let i = 0; i < 10; i++) {
            const text = textInputs[i % textInputs.length];
            results.push({
                storyid: i,
                lat: _.random(-90, 90, true),
                lng: _.random(-90, 90, true),
                text,
                timestamp: new Date()
            });
        }
        return new Promise((resolve, reject) => {
            resolve(results);
        });
    }

    // [
    // {
    //     "storyid": 5,
    //     "lat": 0,
    //     "lng": 0,
    //     "text": "helloworld4",
    //     "timestamp": "2019-10-05T09:03:45.000Z"
    // },
    // {
    //     "storyid": 3,
    //     "lat": 20,
    //     "lng": 80,
    //     "text": "helloword3",
    //     "timestamp": "2019-10-05T08:43:52.000Z"
    // }
}
export default MockEndpoints;