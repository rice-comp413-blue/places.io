const _ = require("lodash")

const MockEndpoints = {
    view: (upperLeft, bottomRight) => {
        const results = [];
        const textInputs = ["Hey, I'm at Rice!", "What's up guys?", "Check out my story"];
        for (let i = 0; i < 10; i++) {
            const text = textInputs[i % textInputs.length];
            results.push({
                storyid: i,
                lat: _.random(upperLeft[0], bottomRight[0], true),
                long: _.random(upperLeft[1], bottomRight[1], true),
                text,
                timestamp: new Date()
            });
        }
        return new Promise((resolve, reject) => {
            resolve(results);
        });
    }
}
export default MockEndpoints;