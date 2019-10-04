import React from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MapView from '../MapView/MapView';
import Sidebar from '../Sidebar/Sidebar';

class MainApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: 'view'
        };
    }

    updateModeFunc(mode) {
        this.setState({ mode })
    }

    render() {
        return (
            <Row>
                <Col md={3}>
                    <Sidebar mode={this.state.mode} updateModeFunc={this.updateModeFunc.bind(this)} />
                </Col>
                <Col md={9}>
                    <MapView mode={this.state.mode} />
                </Col>
            </Row>
        );
    }
}
export default MainApp;
