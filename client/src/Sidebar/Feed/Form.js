import React from 'react';
import Form from 'react-bootstrap/Form';

import RequestHelper from '../../RequestHelper';


import Button from 'react-bootstrap/Button';


export default class CustomForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            description: ''
        }
    }
    handleSubmit(e) {
        RequestHelper.submitPlace(this.state.description, this.props.curLatLng)
            .then(res => console.log(res))
            .catch(err => console.log(err));

        this.setState({ description: '' })
        // reset lat and lng
        this.props.updateLatLngFunc({ lat: null, lng: null });
    }
    updateDescription(e) {
        this.setState({ description: e.target.value });
    }

    //  used to disable button until a point is selected on the map
    curLatLngSelected() {
        return this.props.curLatLng[0] !== null && this.props.curLatLng[1] != null;
    }

    render() {
        return (
            <div>
                <div>Current Location: {this.props.curLatLng[0]} {this.props.curLatLng[1]}</div>
                <Form>
                    <Form.Group >
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            value={this.state.description}
                            onChange={this.updateDescription.bind(this)}
                            type="text"
                            placeholder="Enter a description" />
                    </Form.Group>
                    <Button
                        disabled={!this.curLatLngSelected()}
                        variant="primary"
                        onClick={this.handleSubmit.bind(this)}
                        title="Select a point on the map first.">
                        Submit
                    </Button>
                </Form>
            </div>
        );
    }
}