import axios from 'axios';
const RequestHelper = {
    queryViewBoundingBox: (upperLeft, bottomRight) => {
        return axios.post('', { latlng1: upperLeft, latlng2: bottomRight });
    }
}
export default RequestHelper;