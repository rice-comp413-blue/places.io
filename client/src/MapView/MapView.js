import React from 'react';
import '../App.css';
import { Map, TileLayer } from 'react-leaflet';
import RequestHelper from '../RequestHelper';
class MapView extends React.Component {
    constructor(props) {
        super(props);
        this.map = undefined;
    }
    componentDidMount() {

        this.map.leafletElement.on('moveend', () => {
            if (this.props.mode === 'view') {
                // console.log(this.map)
                const southWestBounds = this.map.leafletElement.getBounds().getSouthWest().wrap();
                const northEastBounds = this.map.leafletElement.getBounds().getNorthEast().wrap();
                const upperLeft = [northEastBounds.lat, southWestBounds.lng].map(x => Number(x));
                const bottomRight = [southWestBounds.lat, northEastBounds.lng].map(x => Number(x));

                // console.log(upperLeft, bottomRight);
                //  query view
                RequestHelper.queryViewBoundingBox(upperLeft, bottomRight)
                    .then(res => {
                        console.log(res);
                        //  TODO: update shared state so that Sidebar can display results
                        //  TODO: update markers for display on map
                    })
                    .catch(err => console.log(err));
            }
        });
    }
    handleClick(e) {
        this.props.updateLatLngFunc({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
    render() {
        return (
            <Map ref={(ref) => { this.map = ref; }} onClick={this.handleClick.bind(this)} center={[29.749907, -95.358421]} zoom={10}
                style={{ height: '100vh', width: '100%' }}>
                <TileLayer
                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
            </Map>
        );
    }
}

export default MapView;