import axios from 'axios';
import URLS from './urls';
// import FormData from 'form-data';


const RequestHelper = {
    getCount: (upperLeft, bottomRight) => {
        return axios.post(URLS.count,
            {
                latlng1: upperLeft,
                latlng2: bottomRight,

            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    },
    view: (upperLeft, bottomRight, skip, pagelimit) => {
        return axios.post(URLS.view,
            {
                latlng1: upperLeft,
                latlng2: bottomRight,
                skip,
                pagelimit
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    },
    submit: (text, coordinate, file) => {
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
        return axios.post(URLS.submit, form, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
}
export default RequestHelper;