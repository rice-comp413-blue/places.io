import React from 'react';
import Form from 'react-bootstrap/Form';
import RequestController from '../../RequestController/RequestController';
import Button from 'react-bootstrap/Button';
import Toast from 'react-bootstrap/Toast';
import toastLogo from '../../Assets/cloud-computing.svg'

export default class CustomForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            description: '',
            file: null,
            showToast: false
        }
        this.fileUpload = null;     //  need a handle to the file upload DOM node to reset it after submission
    }

    handleFileSelection(e) {
        this.setState({
            file: e.target.files[0]
        });
    }

    handleSubmit(e) {
        RequestController.submit(this.state.description, this.props.curLatLng, this.state.file)
            .then(res => console.log(res))
            .catch(err => console.log(err));

        this.setState({ description: '', file: null })
        // reset lat and lng
        this.props.updateLatLngFunc({ lat: 0, lng: 0 });
        this.fileUpload.value = '';
        this.setShowToast(true);
    }

    updateDescription(e) {
        this.setState({ description: e.target.value });
    }

    setShowToast = showToast => {
        this.setState({ showToast })
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
                <Toast style={{ position: 'absolute', top: '20em', left: '3em', zIndex: 999 }} onClose={() => this.setShowToast(false)} show={this.state.showToast} delay={4000} autohide>
                    <Toast.Header>
                        <img
                            src="holder.js/20x20?text=%20"
                            className="rounded mr-2"
                            alt=""
                        />
                        <strong className="mr-auto">
                            <img style={{ height: '2em', width: '2em' }} src={toastLogo} alt="logo"></img> Thank you for your submission. </strong>
                        <small>0s ago</small>
                    </Toast.Header>
                    <Toast.Body>We've added your post to our database of places :)</Toast.Body>
                </Toast>
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
                            accept="image/*"
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