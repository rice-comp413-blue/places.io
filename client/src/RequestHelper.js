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
        form.append('coordinate', JSON.stringify(coordinate));
        form.append('timestamp', new Date());

        if (file === null) {
            form.append('file', null);
        }
        else {      //  file exists
            form.append('file', file);
        }
        axios.post('', form, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log(form.get('text'));
        console.log(form.get('coordinate'));
        console.log(form.get('timestamp'));
        console.log(form.get('file'));


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