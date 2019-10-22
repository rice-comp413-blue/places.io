import axios from 'axios';
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
    submitPlace: (text, coordinate) => {

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
    }
}
export default RequestHelper;