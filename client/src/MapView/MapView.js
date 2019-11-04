import React from 'react';
import '../App.css';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
// import RequestHelper from '../RequestHelper';
import Control from 'react-leaflet-control';
import Button from 'react-bootstrap/Button';
import MockEndpoints from '../MockEndpoints/MockEndpoints';
class MapView extends React.Component {
    constructor(props) {
        super(props);
        this.map = undefined;
        this.state = {
            currentZoom: 10,
            markers: []
        };
    }
    componentDidMount() {

        this.map.leafletElement.on('zoomend', () => {
            this.setState({ currentZoom: this.map.leafletElement.getZoom() });
        });
    }
    handleClick(e) {
        this.props.updateLatLngFunc({ lat: e.latlng.wrap().lat, lng: e.latlng.wrap().lng });
    }
    handleViewClick() {
        const southWestBounds = this.map.leafletElement.getBounds().getSouthWest().wrap();
        const northEastBounds = this.map.leafletElement.getBounds().getNorthEast().wrap();
        const upperLeft = [northEastBounds.lat, southWestBounds.lng].map(x => Number(x));
        const bottomRight = [southWestBounds.lat, northEastBounds.lng].map(x => Number(x));

        //  query view
        // RequestHelper.queryViewBoundingBox(upperLeft, bottomRight)
        //     .then(res => {
        //         this.setState({ markers: res.data });
        //         //  TODO: update shared state so that Sidebar can display results
        //         //  TODO: update markers for display on map
        //     })
        //     .catch(err => console.log(err));

        MockEndpoints.view(upperLeft, bottomRight)
            .then(res => {
                console.log(res)
                this.setState({ markers: res });
                this.props.updateFeedFunc(res)
                //  TODO: update shared state so that Sidebar can display results
                //  TODO: update markers for display on map
            })
            .catch(err => console.log(err));
    }
    render() {

        return (
            <Map ref={(ref) => { this.map = ref; }} onClick={(this.handleClick.bind(this))} center={[29.749907, -95.358421]} zoom={10}
                style={{ height: '90vh', width: '100%' }}>
                <TileLayer
                    attribution='&amp;copy <a href="https://github.com/rice-comp413-blue/places.io">BlueTeam</a> | places.io'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {this.state.markers.map(marker => {
                    return (
                        <Marker
                            key={marker.storyid}
                            position={[marker.lat, marker.long]}>
                            <Popup>
                                <h5>Description</h5><br /> {marker.text}
                            </Popup>
                        </Marker>)
                })}
                {this.props.mode === 'view' && this.state.currentZoom > 6 ?
                    <Control position="topright" >
                        <Button onClick={this.handleViewClick.bind(this)}>
                            Query
                        </Button>
                    </Control>
                    : null}
            </Map>
        );
    }
}

export default MapView;