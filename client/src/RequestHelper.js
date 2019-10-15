import axios from 'axios';
const RequestHelper = {
    queryViewBoundingBox: (upperLeft, bottomRight) => {
        return axios.post('', { latlng1: upperLeft, latlng2: bottomRight });
    },
    submitPlace: (text, coordinate) => {
        // {
        //     "text": "helloworld6",
        //     "coordinate": [-20, -20],
        //     "timestamp": "2019-10-05T11:22:52.000Z"
        // }
        return axios.post('', { text, coordinate, timestamp: new Date() });
    }
}
export default RequestHelper;