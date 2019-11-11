import React from 'react';
import Form from 'react-bootstrap/Form';
import RequestHelper from '../../RequestHelper';
import Button from 'react-bootstrap/Button';

export default class CustomForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            description: '',
            file: null
        }
        this.fileUpload = null;     //  need a handle to the file upload DOM node to reset it after submission
    }
    handleFileSelection(e) {
        this.setState({
            file: e.target.files[0]
        });
    }
    handleSubmit(e) {


        RequestHelper.submitPlace(this.state.description, this.props.curLatLng, this.state.file)
            .then(res => console.log(res))
            .catch(err => console.log(err));

        this.setState({ description: '', file: null })
        // reset lat and lng
        this.props.updateLatLngFunc({ lat: null, lng: null });
        this.fileUpload.value = '';
    }
    updateDescription(e) {
        this.setState({ description: e.target.value });
    }


    buttonEnabled() {
        const latLngSelected = this.props.curLatLng[0] !== null && this.props.curLatLng[1] != null;
        const hasDescription = this.state.description !== '';
        const hasFile = this.state.file !== null;
        return latLngSelected && (hasDescription || hasFile);
    }

    render() {
        return (
            <div>
                <div >Selected point: ({this.props.curLatLng[0].toFixed(4)} {this.props.curLatLng[1].toFixed(4)})</div>

                <Form>
                    <Form.Group >
                        {/* <Form.Label>Description:</Form.Label> */}
                        <Form.Control
                            value={this.state.description}
                            onChange={this.updateDescription.bind(this)}
                            type="text"
                            placeholder="Enter a description" />
                    </Form.Group>

                    <div>
                        <input
                            type="file"
                            id="fileinput"
                            onChange={this.handleFileSelection.bind(this)}
                            ref={(ref) => this.fileUpload = ref}

                        />
                    </div>

                    <br />

                    <Button
                        disabled={!this.buttonEnabled()}
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