import React from 'react';
import './App.css';
import MainApp from './MainApp/MainApp';
import PlacesNavbar from './Navbar/PlacesNavbar';

function App() {

  return (
    <div className="App">
      <PlacesNavbar/>
      <MainApp />
    </div>
  );
}

export default App;
