import axios from 'axios';
// import FormData from 'form-data';


const RequestHelper = {
    queryViewBoundingBox: (upperLeft, bottomRight) => {
        //  hardcoe URLS for now, will switch to use a config later
        return axios.post('http://localhost:1330/view',
            { latlng1: upperLeft, latlng2: bottomRight },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    },
    submitPlace: (text, coordinate, file) => {
        const form = new FormData();
        form.append('text', text);
        form.append('lat', coordinate[0]);
        form.append('lng', coordinate[1]);
        form.append('timestamp', new Date());

        if (file === null) {
            form.append('file', null);
        }
        else {      //  file exists
            form.append('file', file);
        }
        return axios.post('', form, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });



        // TODO: update to multipart form data
        // if (file === null) {
        //     return axios.post('http://localhost:1330/submit',
        //         {
        //             text,
        //             coordinate,
        //             timestamp: new Date()
        //         },
        //         {
        //             headers: {
        //                 'Content-Type': 'application/json'
        //             }
        //         });
        // } else {
        //     return axios.post('http://localhost:1330/submit',
        //         {
        //             text,
        //             coordinate,
        //             image: file,
        //             timestamp: new Date()
        //         },
        //         {
        //             headers: {
        //                 'Content-Type': 'application/json'
        //             }
        //         });
        // }

    }
}
export default RequestHelper;