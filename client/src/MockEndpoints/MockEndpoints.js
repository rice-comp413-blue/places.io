const _ = require("lodash")

const MockEndpoints = {
    view: (upperLeft, bottomRight, skip, pageLimit) => {
        const results = [];
        const textInputs = ["Hey, I'm at Rice!", "What's up guys?", "Check out my story"];
        const imageUrls = ["https://cdn.shopify.com/s/files/1/3004/1474/products/orange-tabby_1800x1800.png?v=1544042837", "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?cs=srgb&dl=adorable-animal-breed-1108099.jpg&fm=jpg", "https://avatars1.githubusercontent.com/u/23466848?s=400&v=4"]
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
            resolve(results.slice(skip * pageLimit, Math.min(results.length, skip * pageLimit + pageLimit + 1)));
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