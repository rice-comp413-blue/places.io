import URLS from './urls';
import RequestHelper from './RequestHelper';
import MockEndpoints from './MockEndpoints';
const RequestDispatcher = URLS.type === 'mock' ? MockEndpoints : RequestHelper;
const RequestController = {
    getCount: (upperLeft, bottomRight) => {
        return RequestDispatcher.getCount(upperLeft, bottomRight);
    },
    view: (upperLeft, bottomRight, skip, pagelimit) => {
        return RequestDispatcher.view(upperLeft, bottomRight, skip, pagelimit);
    },
    submit: (text, coordinate, file) => {
        return RequestDispatcher.submit(text, coordinate, file);
    }
};

export default RequestController;