import React from 'react';
// import logo from './logo.svg';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import './App.css';
import MapView from './MapView/MapView';
import Sidebar from './Sidebar/Sidebar';
function App() {
  return (
    <div className="App">
      <Navbar bg="light">
        <Navbar.Brand>places.io</Navbar.Brand>
      </Navbar>
      <Row>
        <Col md={3}>
          <Sidebar />
        </Col>
        <Col md={9}>
          <MapView />
        </Col>
      </Row>
    </div>
  );
}

export default App;
