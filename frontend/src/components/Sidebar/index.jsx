import React, { Component } from 'react'
import Navbar from 'react-bootstrap/Navbar'
import ListGroup from 'react-bootstrap/ListGroup'
import { LinkContainer } from 'react-router-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

export default class Sidebar extends Component {
  render() {
    return (
      <Navbar id="sidebar" variant="dark" bg="dark"
        className={`bg-dark border-right border-secondary ${this.props.active ? "active" : ""}`}
        style={{minHeight: "100%"}}>
        <div className="sidebar-header">
          <Row>
            <Col md={3} className="d-flex align-items-center">
              <i className="fas fa-theater-masks fa-3x"></i>
            </Col>
            <Col md={9} className="text-left">
              <h3>Emotion Detection</h3>
            </Col>
          </Row>
        </div>

        <ListGroup variant="flush">
          <LinkContainer exact to="/">
            <ListGroup.Item action className="border-bottom border-secondary" onClick={() => document.getElementById("content").focus()}>
              <i className="fas fa-video"></i> Live webcam
            </ListGroup.Item>
          </LinkContainer>
          <LinkContainer to="/upload-video">
            <ListGroup.Item action className="border-bottom border-secondary">
              <i className="fas fa-film"></i> Video upload
            </ListGroup.Item>
          </LinkContainer>
          <LinkContainer to="/image-upload">
            <ListGroup.Item action className="border-bottom border-secondary">
              <i className="fas fa-images"></i> Image upload
            </ListGroup.Item>
          </LinkContainer>
        </ListGroup>
      </Navbar>
    )
  }
}