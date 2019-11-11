const _ = require("lodash")

const MockEndpoints = {
    getPageCount: (upperLeft, bottomRight, skip, pageLimit) => {
        return new Promise((resolve, reject) => {
            resolve(100 / pageLimit)
        });
    },
    view: (upperLeft, bottomRight, skip, pageLimit) => {
        const results = [];
        const textInputs = ["Hey, I'm at Rice! Please look at my story.", "What's up guys?  Places.io is so cool!  Good job COMP 413 Blue Team.", "Check out my story guys please be careful !!", "Rice University is a comprehensive research university located on a 300-acre tree-lined campus in Houston, Texas. Rice produces the next generation of leaders and advances tomorrow’s thinking."];
        const imageUrls = [
            "https://cdn.shopify.com/s/files/1/3004/1474/products/orange-tabby_1800x1800.png?v=1544042837",
            "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?cs=srgb&dl=adorable-animal-breed-1108099.jpg&fm=jpg", "https://avatars1.githubusercontent.com/u/23466848?s=400&v=4",
            "https://tribkswb.files.wordpress.com/2018/09/s098916860.jpg?quality=85&strip=all&w=1540",
            "",     //  to test how stories without images might look
            "",
            ""
        ];
        for (let i = 0; i < 100; i++) {
            const text = textInputs[_.random(0, textInputs.length - 1)];
            const imageURL = imageUrls[_.random(0, imageUrls.length - 1)]
            results.push({
                storyid: i,
                lat: _.random(upperLeft[0], bottomRight[0], true),
                long: _.random(upperLeft[1], bottomRight[1], true),
                imageURL,
                text,
                timestamp: new Date()
            });
        }
        return new Promise((resolve, reject) => {
            resolve(results.slice(skip * pageLimit, Math.min(results.length, skip * pageLimit + pageLimit)));
        });
    }
    // view: (upperLeft, bottomRight) => {
    //     const results = [];
    //     const textInputs = ["Hey, I'm at Rice!", "What's up guys?", "Check out my story"];
    //     const imageUrls = ["https://cdn.shopify.com/s/files/1/3004/1474/products/orange-tabby_1800x1800.png?v=1544042837","https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?cs=srgb&dl=adorable-animal-breed-1108099.jpg&fm=jpg", "https://avatars1.githubusercontent.com/u/23466848?s=400&v=4"]
    //     for (let i = 0; i < 10; i++) {
    //         const text = textInputs[_.random(0, textInputs.length - 1)];
    //         const imageURL = imageUrls[_.random(0, imageUrls.length - 1)]
    //         results.push({
    //             storyid: i,
    //             lat: _.random(upperLeft[0], bottomRight[0], true),
    //             long: _.random(upperLeft[1], bottomRight[1], true),
    //             imageURL, 
    //             text,
    //             timestamp: new Date()
    //         });
    //     }
    //     return new Promise((resolve, reject) => {
    //         resolve(results);
    //     });
    // }
}
export default MockEndpoints;