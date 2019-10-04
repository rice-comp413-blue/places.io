import React from 'react';
import '../App.css';
import { Map, TileLayer } from 'react-leaflet';
const MapView = (props) => {
    console.log("MODE: ", props.mode);
    return (
        <Map center={[29.749907, -95.358421]} zoom={10}
            style={{ height: '100vh', width: '100vw' }}>
            <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
        </Map>
    )
};

export default MapView;