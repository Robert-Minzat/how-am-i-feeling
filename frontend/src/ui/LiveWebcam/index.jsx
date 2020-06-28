import React, { Component } from 'react'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container'
import Spinner from 'react-bootstrap/Spinner'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Image from 'react-bootstrap/Image';

export default class LiveWebcam extends Component {
  state = {
    live: false,
    detecting: false,
    videoRef: React.createRef(),
    imgURLs: [],
  }

  startWebcam = () => {
    this.setState({ live: true });
    this.props.startWebcam();
  }

  stopWebcam = () => {
    this.setState({ live: false });
    this.props.stopWebcam();
  }

  startDetect = async () => {
    this.setState({ detecting: true });
    this.props.stopWebcam();
    let mediaStream = await navigator.mediaDevices.getUserMedia(this.props.constraints);
    let streamTracks = mediaStream.getTracks();
    this.props.startDetect(mediaStream, streamTracks);
  }

  stopDetect = () => {
    this.setState({ detecting: false });
    this.props.stopDetect();
    this.props.startWebcam();
  }

  startAndDetect = async () => {
    this.setState({ live: true, detecting: true });
    let mediaStream = await navigator.mediaDevices.getUserMedia(this.props.constraints);
    let streamTracks = mediaStream.getTracks();
    this.props.startDetect(mediaStream, streamTracks);
  }

  stop = () => {
    this.setState({ live: false, detecting: false })
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

    if (this.state.live) {
      this.props.stopWebcam();
    }
  }

  takeScreenshot = () => {
    let canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 360;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(this.state.videoRef.current, 0, 0, canvas.width, canvas.height);

    let { imgURLs } = this.state;
    imgURLs.unshift(canvas.toDataURL('image/jpeg'));
    this.setState({ imgURLs });
  }

  render() {
    return (
      <Container fluid>
        {/* Signaling state: {this.props.signaling} <br/>
        ICE gathering state: {this.props.iceGathering} */}
        <Row className="justify-content-md-center">
          <Col md={1}></Col>
          <Col md={11}>
            <Row>
              <Col md={6} className="justify-content-md-center">
                <Row>
                  <Col md={6}>
                    <h2>Video</h2>
                  </Col>
                  <Col md={6} className="text-right">
                    <Button as="span" variant={!this.state.detecting && (this.state.iceCon !== 'new' || this.state.iceCon !== 'connected') ? "outline-danger" : "outline-success"} style={{pointerEvents: "none"}}>
                      Connection state: {this.props.iceCon}
                      <Spinner as="span" role="status" size="sm"
                        variant={this.props.iceCon === 'connected' ? 'danger' : 'success'}
                        animation={this.props.iceCon === 'connected' ? "grow" : "border"}
                        style={{ display: this.props.iceCon && this.props.iceCon !== 'closed' ? "inline-block" : "none" }}>
                      </Spinner>
                    </Button>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <Card border={this.state.live ? "success" : "primary"} variant="primary" className="disabled border-3">
                      <video ref={this.state.videoRef} autoPlay={true} playsInline={true}
                        style={{ width: "480px", height: "360px", margin: "10px auto" }}>
                      </video>
                    </Card>
                  </Col>
                  <Col md={12}>
                    {this.props.loading ?
                      <Row className="mt-2">
                        <Col md={5}></Col>
                        <Col md={2} className="text-center" style={{ position: "relative" }}>
                          <Spinner role="status" animation="border" variant="success"
                            style={{ position: "absolute", top: "50%", left: "50%" }}>
                          </Spinner>
                        </Col>
                        <Col md={5}></Col>
                      </Row> :
                      <Row className="mt-2">
                        <Col md={4}>
                          <Button as="a" block
                            variant={!this.state.live ? "success" : "danger"}
                            className={this.state.detecting ? "disabled" : ""}
                            onClick={!this.state.live ? this.startWebcam : this.stopWebcam}>
                            {this.iceCon !== "connected" || this.iceCon !== "closed"}
                            {!this.state.live ? "Start webcam" : "Stop webcam"}
                          </Button>
                        </Col>
                        <Col md={4}>
                          <Button as="a" block
                            variant={!this.state.detecting ? "success" : "danger"}
                            onClick={!this.state.detecting ? this.startDetect : this.stopDetect}
                            className={!this.state.live ? "disabled" : ""}>
                            {!this.state.detecting ? "Start detecting" : "Stop detecting"}
                          </Button>
                        </Col>
                        <Col md={4}>
                          <Button as="a" block
                            variant={!this.state.detecting || !this.state.live ? "success" : "danger"}
                            onClick={!this.state.detecting && !this.state.live ? this.startAndDetect : this.stop}
                            className={this.state.live && !this.state.detecting ? "disabled" : ""}>
                            {this.state.live && this.state.detecting ? "Stop" : "Start & detect"}
                          </Button>
                        </Col>
                      </Row>
                    }
                  </Col>
                </Row>
              </Col>
              <Col md={1}></Col>
              <Col md={5}>
                <Row>
                  <Col md={12} className='text-center'>
                    <Button as="a" variant="info" size="lg"
                      className={(this.state.detecting || this.state.live) && !this.props.loading ? "" : "disabled"}
                      onClick={this.takeScreenshot}>Take screenshot</Button>
                  </Col>
                </Row>
                <Row className="border border-secondary border-2 mt-2"
                  style={{
                    minHeight: "75vh",
                    maxHeight: "75vh",
                    overflowY: (this.state.imgURLS && this.state.imgURLS.length > 2) ? "hidden" : "auto"
                  }}>
                  {this.state.imgURLs.map(image =>
                    <Col md={12}
                      className={`d-flex justify-content-center mb-1 mt-1`}>
                      <Image src={image} style={{maxWidth: "90%", maxHeight: 360 }} />
                    </Col>
                  )}
                </Row>
              </Col>
            </Row>

          </Col>
        </Row>

        {/* <h2>Data channel</h2>
        <pre id="data-channel" style={{ height: "200px" }}></pre>

        <h2>SDP</h2>

        <h3>Offer</h3>
        <pre id="offer-sdp"></pre>

        <h3>Answer</h3>
        <pre id="answer-sdp"></pre> */}
      </Container>
    )
  }
}