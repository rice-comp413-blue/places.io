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
                const bounds = this.map.leafletElement.getBounds();
                const upperLeft = [bounds['_northEast'].lat, bounds['_southWest'].lng].map(x => Number(x));
                const bottomRight = [bounds['_southWest'].lat, bounds['_northEast'].lng].map(x => Number(x));

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