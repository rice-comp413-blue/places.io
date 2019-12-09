import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import explore from '../Assets/explore.svg';
import connected_world from '../Assets/connected_world.svg';
import around_the_world from '../Assets/around_the_world.svg';


const About = (props) => {
    return (
        <div style={{paddingTop:'2em'}}>
            <h1>About places.io</h1>
            <Container>
                <Row>
                    <Col className="section" xs={4} style={{textAlign: 'left'}}>
                        <img alt="explore world" style={{width:'20em', height:'20em'}} src={connected_world}/>
                    </Col>
                    <Col className="section" xs={8}>
                        <div style={{paddingTop:'6em'}}>
                            <p>places.io is a platform to empower cultural and societal diffusion. We believe that people should have one centralized application to share and view content about places all around the world. We want to enable people to share images about their locations and display the intricacies of their individual worlds.</p>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col className="section" xs={8} style={{textAlign: 'left'}}>
                        <div style={{paddingTop:'8em'}}>
                            <p>At your fingertips, is the ability to explore new worlds and cultures. So go ahead, laugh at the silly posts of your friends, admire the beauty of incredible new places, enjoy everything that the world has to offer. See from the perspective of another. And let them see from yours.</p>
                        </div>                        
                    </Col>
                    <Col className="section" xs={4}>
                        <img alt="explore world" style={{width:'20em', height:'20em'}} src={around_the_world}/>
                    </Col>
                </Row>
                <Row>
                    <Col className="section" xs={4} style={{textAlign: 'left'}}>
                        <img alt="explore world" style={{width:'20em', height:'20em'}} src={explore}/>
                    </Col>
                    <Col className="section" xs={8}>
                        <div style={{paddingTop:'8em'}}>
                            <p>We hope that this will encourage adventure and exploration. The world is not a small place. There is so much to see and do. Let's make the world and all its treasures, open source! </p>
                        </div>
                    </Col>
                </Row>
            </Container>

        </div>
    );
}

export default About;