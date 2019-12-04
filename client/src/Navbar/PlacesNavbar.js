import React from 'react';
import '../App.css';
import Navbar from 'react-bootstrap/Navbar';
import logo from '../Assets/logo.svg';
import DropdownMenu from './DropdownMenu';

const PlacesNavbar = () => {

    return (
        <div>
            <Navbar bg="light">
                {/* Align left */}
                <ul class="navbar-nav mr-auto">
                    <img style={{ height: '100%', width: '2em', marginRight: '0.5em' }} alt="logo" src={logo} />
                    <Navbar.Brand>places.io</Navbar.Brand>
                </ul>

                {/* Align right */}
                <ul class="navbar-nav">
                    <DropdownMenu />
                </ul>
            </Navbar>
        </div>
    );
}

export default PlacesNavbar;