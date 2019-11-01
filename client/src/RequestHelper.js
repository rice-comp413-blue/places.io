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
        // console.log(coordinate);
        // const form = new FormData();
        // form.append('text', text);
        // form.append('lat', coordinate[0])
        // form.append('long', coordinate[1]);
        // form.append('timestamp', new Date());

        // TODO: update to multipart form data
        if (file === null) {
            return axios.post('http://localhost:1330/submit',
                {
                    text,
                    coordinate,
                    timestamp: new Date()
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
        } else {
            return axios.post('http://localhost:1330/submit',
                {
                    text,
                    coordinate,
                    image: file,
                    timestamp: new Date()
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
        }

    }
}
export default RequestHelper;