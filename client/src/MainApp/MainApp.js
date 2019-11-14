import React from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MapView from '../MapView/MapView';
import Sidebar from '../Sidebar/Sidebar';

class MainApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: 'view',
            curLatLng: {
                lat: 0,
                lng: 0
            },
            currentData: [],
            boundingBox: {
                upperLeft: [],
                bottomRight: []
            },
            selectedStoryId: null
        };
    }

    updateModeFunc(mode) {
        this.setState({ mode })
    }
    updateLatLngFunc(curLatLng) {
        this.setState({ curLatLng });
    }

    updateCurrentDataPoints(currentData) {
        this.setState({ currentData });
    }

    updateBoundingBox(upperLeft, bottomRight) {
        this.setState({
            boundingBox:
            {
                upperLeft: upperLeft,
                bottomRight: bottomRight
            }
        });
    }

    onStoryClick(storyId) {
        console.log("selected story: ", storyId)
        this.setState({selectedStoryId: storyId})
    }    

    render() {

        const curLatLng = [this.state.curLatLng.lat, this.state.curLatLng.lng];
        return (
            <Row>
                <Col md={3}>
                    <Sidebar
                        curLatLng={curLatLng}
                        mode={this.state.mode}
                        updateLatLngFunc={this.updateLatLngFunc.bind(this)}
                        updateModeFunc={this.updateModeFunc.bind(this)}
                        updateCurrentDataPoints={this.updateCurrentDataPoints.bind(this)}
                        feed={this.state.currentData}
                        upperLeft={this.state.boundingBox.upperLeft}
                        bottomRight={this.state.boundingBox.bottomRight}
                        onStoryClick={this.onStoryClick.bind(this)}
                        selectedStory={this.state.selectedStoryId}
                    />
                </Col>
                <Col md={9}>
                    <MapView
                        mode={this.state.mode}
                        updateLatLngFunc={this.updateLatLngFunc.bind(this)}
                        updateCurrentDataPoints={this.updateCurrentDataPoints.bind(this)}
                        updateBoundingBox={this.updateBoundingBox.bind(this)}
                        markers={this.state.currentData} 
                        onStoryClick={this.onStoryClick.bind(this)}
                        selectedStory={this.state.selectedStoryId}
                        />
                </Col>
            </Row>
        );
    }
}
export default MainApp;
