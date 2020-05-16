import React, { Component } from 'react'
import Navbar from 'react-bootstrap/Navbar'
import ListGroup from 'react-bootstrap/ListGroup'
import { LinkContainer } from 'react-router-bootstrap';

export default class Sidebar extends Component {
  render() {
    return (
      <Navbar id="sidebar" variant="dark" bg="dark"
        className={`bg-dark border-right border-secondary ${this.props.active ? "active" : ""}`}
        style={{minHeight: "100%"}}>
        <div className="sidebar-header">
          <h3>Emotion Detection</h3>
          <strong>ED</strong>
        </div>

        <ListGroup variant="flush">
          <LinkContainer exact to="/">
            <ListGroup.Item action className="border-bottom border-secondary" onClick={() => document.getElementById("content").focus()}>
              <i className="fas fa-home"></i> Live webcam
            </ListGroup.Item>
          </LinkContainer>
          <LinkContainer to="/upload-video">
            <ListGroup.Item action className="border-bottom border-secondary">
              <i className="fas fa-briefcase"></i> Video upload
            </ListGroup.Item>
          </LinkContainer>
          <LinkContainer to="/image-upload">
            <ListGroup.Item action className="border-bottom border-secondary">
              <i className="fas fa-copy"></i> Image upload
            </ListGroup.Item>
          </LinkContainer>
        </ListGroup>
      </Navbar>
    )
  }
}