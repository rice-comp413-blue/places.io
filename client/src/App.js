import React from 'react';
// import logo from './logo.svg';
import Navbar from 'react-bootstrap/Navbar';
import './App.css';
import MainApp from './MainApp/MainApp';
function App() {
  return (
    <div className="App">
      <Navbar bg="light">
        <Navbar.Brand>places.io</Navbar.Brand>
      </Navbar>
      <MainApp />
    </div>
  );
}

export default App;
