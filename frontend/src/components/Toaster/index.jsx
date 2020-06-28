import React, { Component } from 'react'
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
          <i className="fas fa-theater-masks"></i><strong className="mr-auto pb-auto pt-auto"> Emotion Detection</strong>
        </Toast.Header>
        <Toast.Body>{this.props.message}</Toast.Body>
      </Toast>
    )
  }
}