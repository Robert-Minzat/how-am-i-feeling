import React, { Component } from 'react'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container'
import Spinner from 'react-bootstrap/Spinner'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Image from 'react-bootstrap/Image';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

export default class VideoUpload extends Component {

    state = {
      upVideoRef: React.createRef(),
      videoRef: React.createRef(),
      videoName: "",
      videoUrl: "",
      detecting: false,
      // video.captureStream().getVideoTracks()
    }

  handleChange = event => {
    const files = event.target.files;
    const videoUrl = URL.createObjectURL(files[0])
    this.setState({videoUrl, videoName: files[0].name});
    console.log(files[0])
  }

  startDetect = () => {
    console.log(this.state.upVideoRef.current.captureStream().getVideoTracks())
    this.setState({ detecting: true });
    let stream = this.state.upVideoRef.current.captureStream();
    let streamTracks = stream.getVideoTracks();
    this.props.startDetect(stream, streamTracks);
  }

  stopDetect = () => {
    this.setState({ detecting: false });
    this.props.stopDetect();
  }

  componentDidUpdate() {
    let { videoRef } = this.state;
    if (videoRef.current.srcObject !== this.props.videoStream) {
      videoRef.current.srcObject = this.props.videoStream
      this.setState({ videoRef })
    }
  }

  componentWillUnmount() {
    if (this.state.detecting) {
      this.props.stopDetect();
    }
  }

  render() {
    return (
      <Container fluid>
        <Row>
          <Col md={3}></Col>
          <Form.Group as={Col} md="6">
            <InputGroup>
              <Form.File custom>
                <Form.File.Input
                  accept="video/*"
                  onChange={event => this.handleChange(event)} />
                <Form.File.Label data-browse="Browse" className="bg-secondary">
                  {this.state.videoName.length ? this.state.videoName : 'Choose file'}
                </Form.File.Label>
              </Form.File>
              <InputGroup.Append>
                {/* <Button as="a"
                  variant="secondary"
                  className={`input-group-text ${this.state.imgFiles.length ? "" : "disabled"} `}
                  onClick={this.state.imgFiles.length ? () => this.sendImage() : () => { }}>Send</Button> */}
              </InputGroup.Append>
            </InputGroup>
          </Form.Group>
          <Col md={3}></Col>
        </Row>
        <Row>
          <Col md={4}></Col>
          <Col md={4} className="text-center">
            <Button as="a" onClick={!this.state.detecting ? this.startDetect : this.stopDetect}>
              {!this.state.detecting ? "Start" : "Stop"} detecting: {this.props.iceCon}
            </Button>
          </Col>
          <Col md={4}></Col>
        </Row>
        <Row>
          <Col md={1}></Col>
          <Col md={10}>
            <Row>
              <Col md={6} className="text-center">
                <video ref={this.state.upVideoRef} playsInline={true} controls src={this.state.videoUrl} loop autoPlay
                  style={{ width: "480px", height: "360px", margin: "10px auto" }}>
                </video>
              </Col>
              <Col md={6} className="text-center">
                <video ref={this.state.videoRef} autoPlay={true} playsInline={true}
                  style={{ width: "480px", height: "360px", margin: "10px auto" }}>
                </video>
              </Col>
            </Row>
          </Col>
          <Col md={1}></Col>
        </Row>
      </Container>
    )
  }
}