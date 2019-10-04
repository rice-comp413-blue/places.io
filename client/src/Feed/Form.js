import React from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Row';

import Button from 'react-bootstrap/Row';


export default class CustomForm extends React.Component {
    render() {
        return (
            <Form>
                <Form.Group as={Row}>
                    <Form.Label column sm={2}>
                    Text
                    </Form.Label>
                    <Col sm={10}>
                    <Form.Control type="text" placeholder="Text" />
                    </Col>
                </Form.Group>

                <Form.Group as={Row}>
                    <Col sm={10}>
                    <Button type="submit">Sign in</Button>
                    </Col>
                </Form.Group>
            </Form>
        );
    }
}