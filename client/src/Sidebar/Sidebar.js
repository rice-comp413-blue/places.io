import React from 'react';
import Feed from './Feed/Feed';
import Form from './Feed/Form';
import { SegmentedControl } from 'segmented-control';
import ReactPaginate from 'react-paginate';
import MockEndpoints from '../MockEndpoints/MockEndpoints';
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
            MockEndpoints.getPageCount(upperLeft, bottomRight, 0, PAGE_LIMIT)
                .then(pageCount => this.setState({ pageCount }))
                .catch(err => console.log(err));
        }
    }

    handlePageClick = (data) => {
        MockEndpoints.view(this.props.upperLeft, this.props.bottomRight, data.selected, PAGE_LIMIT)
            .then(res => this.props.updateCurrentDataPoints(res))
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
                        fontSize: '0.8em',
                        textAlign: 'center',
                        color: '#2980b9'
                    }} // purple400
                />
                {this.props.mode === 'view' ?
                    <Feed elements={this.props.feed} /> :
                    <Form
                        updateLatLngFunc={this.props.updateLatLngFunc.bind(this)}
                        curLatLng={this.props.curLatLng}></Form>
                }
                {this.props.mode === 'view' && this.state.pageCount && this.props.feed.length > 0 ?
                    <ReactPaginate
                        previousLabel={'previous'}
                        nextLabel={'next'}
                        breakLabel={'...'}
                        breakClassName={'break-me'}
                        pageCount={this.state.pageCount}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={this.handlePageClick.bind(this)}
                        containerClassName={'pagination'}
                        subContainerClassName={'pages pagination'}
                        activeClassName={'active'}
                    /> : null}
            </div>
        )
    }

};

export default Sidebar;