import React from 'react';
import '../App.css';
import Navbar from 'react-bootstrap/Navbar';
import logo from '../Assets/logo.svg';
import DropdownMenu from './DropdownMenu';

const PlacesNavbar = (props) => {

    const home = () => {
        props.updatePageIdFunc(0);
    }

    return (
        <div>
            <Navbar bg="light">
                {/* Align left */}
                <ul className="navbar-nav mr-auto">
                    <img style={{ height: '100%', width: '2em', marginRight: '0.5em' }} alt="logo" src={logo} />
                    <Navbar.Brand href="#home" onClick={()=>home()}>places.io</Navbar.Brand>
                </ul>

                {/* Align right */}
                <ul className="navbar-nav">
                    <DropdownMenu {...props} />
                </ul>
            </Navbar>
        </div>
    );
}

export default PlacesNavbar;