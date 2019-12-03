import React from 'react';
import logo from './Assets/logo.svg';
import Navbar from 'react-bootstrap/Navbar';
import './App.css';
import MainApp from './MainApp/MainApp';
function App() {
  return (
    <div className="App">
      <Navbar bg="light">
        <img style={{ height: '100%', width: '2em', marginRight: '0.5em' }} alt="logo" src={logo} />
        <Navbar.Brand>places.io</Navbar.Brand>
      </Navbar>
      <MainApp />
    </div>
  );
}

export default App;
