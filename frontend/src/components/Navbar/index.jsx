import React, { Component } from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container'

export default class MainNavbar extends Component {
  render() {
    return (
      <Navbar variant="dark" bg="dark" expand="lg">
        <Container fluid>
          <Button as="a" type="button" id="sidebarCollapse" variant="primary" onClick={this.props.btnClick}>
            <i className="fas fa-list fa-lg"></i>
          </Button>
          <Navbar.Brand className="ml-1">Live webcam</Navbar.Brand>
          <Navbar.Collapse />
        </Container>
      </Navbar>
    )
  }
}