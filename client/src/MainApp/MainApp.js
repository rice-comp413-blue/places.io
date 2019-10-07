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
            }
        };
    }

    updateModeFunc(mode) {
        this.setState({ mode })
    }
    updateLatLngFunc(curLatLng) {
        this.setState({ curLatLng });
    }

    render() {

        console.log('CURRENT LAT LNG: ', this.state.curLatLng);
        const curLatLng = [this.state.curLatLng.lat, this.state.curLatLng.lng];
        return (
            <Row>
                <Col md={3}>
                    <Sidebar curLatLng={curLatLng} mode={this.state.mode} updateModeFunc={this.updateModeFunc.bind(this)} />
                </Col>
                <Col md={9}>
                    <MapView mode={this.state.mode} updateLatLngFunc={this.updateLatLngFunc.bind(this)} />
                </Col>
            </Row>
        );
    }
}
export default MainApp;
