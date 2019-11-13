import React from 'react';
import Feed from './Feed/Feed';
import Form from './Feed/Form';
import { SegmentedControl } from 'segmented-control';
import ReactPaginate from 'react-paginate';
import RequestController from '../RequestController/RequestController';
const PAGE_LIMIT = 10;

class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageCount: null
        };
    }

    componentDidUpdate(prevProps) {
        const prevUpperLeft = prevProps.upperLeft;
        const upperLeft = this.props.upperLeft;

        const prevBottomRight = prevProps.bottomRight;
        const bottomRight = this.props.bottomRight;

        const lengthsAreDiff = prevUpperLeft.length !== upperLeft.length || prevBottomRight.length !== bottomRight.length;

        if (lengthsAreDiff ||
            prevUpperLeft[0] !== upperLeft[0] ||
            prevUpperLeft[1] !== upperLeft[1] ||
            prevBottomRight[0] !== bottomRight[0] ||
            prevBottomRight[1] !== bottomRight[1]) {

            RequestController.getCount(upperLeft, bottomRight)
                .then(res => { this.setState({ pageCount: Math.ceil(res.data.count / PAGE_LIMIT) }) })
                .catch(err => console.log(err));
        }
    }

    handlePageClick = (data) => {

        RequestController.view(this.props.upperLeft, this.props.bottomRight, data.selected * PAGE_LIMIT, PAGE_LIMIT)
            .then(res => { this.props.updateCurrentDataPoints(res.data.entries) })
            .catch(err => console.log(err));

    }

    updateMode = (newMode) => this.props.updateModeFunc(newMode)

    render = () => {
        return (
            <div className="sidebar">
                <SegmentedControl
                    name="modeToggle"
                    options={[
                        { label: "View", value: "view", default: true },
                        { label: "Submit", value: "submit" },
                    ]}
                    setValue={newMode => this.updateMode(newMode)}
                    style={{
                        width: '100%',
                        height: '3em',
                        fontSize: '0.9em',
                        textAlign: 'center',
                        color: '#2980b9'
                    }} // purple400
                />
                {this.props.mode === 'view' ?
                    <Feed className="feed" elements={this.props.feed} /> :
                    <Form
                        updateLatLngFunc={this.props.updateLatLngFunc.bind(this)}
                        curLatLng={this.props.curLatLng}></Form>
                }

                {this.props.mode === 'view' && this.state.pageCount && this.props.feed.length > 0 ?
                    <div className="paginate-container">
                        <ReactPaginate
                            previousLabel={'previous'}
                            nextLabel={'next'}
                            breakLabel={'...'}
                            pageCount={this.state.pageCount}
                            marginPagesDisplayed={1}
                            pageRangeDisplayed={1}
                            onPageChange={this.handlePageClick.bind(this)}
                            containerClassName={'pagination'}
                            subContainerClassName={'pages pagination'}
                            activeClassName={'active'}
                            breakClassName={'page-item'}
                            breakLinkClassName={'page-link'}
                            pageClassName={'page-item'}
                            pageLinkClassName={'page-link'}
                            previousClassName={'page-item'}
                            previousLinkClassName={'page-link'}
                            nextClassName={'page-item'}
                            nextLinkClassName={'page-link'}
                        />
                    </div> :
                    null}

            </div>
        )
    }

};

export default Sidebar;