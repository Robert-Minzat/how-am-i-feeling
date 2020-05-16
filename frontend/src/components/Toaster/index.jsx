import React, { Component } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Toast from 'react-bootstrap/Toast'

export default class Toaster extends Component {
  render() {
    return (
      <Toast
        onClose={() => this.props.handleClose()}
        show={this.props.show} delay={3000}
        autohide
        className={this.props.variant}
        style={{
          position: 'fixed',
          right: 5,
          top: 10,
          zIndex: 100,
          minWidth: 200
        }}>
        <Toast.Header>
          <strong className="mr-auto pb-auto pt-auto">ED</strong>
        </Toast.Header>
        <Toast.Body>{this.props.message}</Toast.Body>
      </Toast>
    )
  }
}