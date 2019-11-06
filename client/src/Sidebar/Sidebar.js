import React from 'react';
import Feed from './Feed/Feed';
import Form from './Feed/Form';
import { SegmentedControl } from 'segmented-control';
import ReactPaginate from 'react-paginate';

const handlePageClick = (data) => {
    // TODO: Implement
    console.log(data);
}
const Sidebar = (props) => {
    const updateMode = (newMode) => props.updateModeFunc(newMode);
    return (
        <div className="sidebar">
            <SegmentedControl
                name="modeToggle"
                options={[
                    { label: "View", value: "view", default: true },
                    { label: "Submit", value: "submit" },
                ]}
                setValue={newMode => updateMode(newMode)}
                style={{ width: '100%', color: '#2980b9' }} // purple400
            />
            {props.mode === 'view' ?
                <Feed elements={props.feed} />
                : <Form updateLatLngFunc={props.updateLatLngFunc.bind(this)} curLatLng={props.curLatLng}></Form>}
            {props.mode === 'view' && props.feed ?
                <ReactPaginate
                    previousLabel={'previous'}
                    nextLabel={'next'}
                    breakLabel={'...'}
                    breakClassName={'break-me'}
                    pageCount={10 /*TODO: Make query.*/}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={handlePageClick}
                    containerClassName={'pagination'}
                    subContainerClassName={'pages pagination'}
                    activeClassName={'active'}
                /> : undefined}
        </div>
    )

};

export default Sidebar;