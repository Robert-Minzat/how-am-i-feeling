import React, { Component } from 'react'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container'
import Spinner from 'react-bootstrap/Spinner'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'

export default class LiveWebcam extends Component {
  state = {
    live: false,
    detecting: false,
    videoRef: React.createRef()
  }

  startWebcam = () => {
    this.setState({ live: true});
    this.props.startWebcam();
  }

  stopWebcam = () => {
    this.setState({ live: false });
    this.props.stopWebcam();
  }

  startDetect = () => {
    this.setState({ detecting: true });
    this.props.stopWebcam();
    this.props.startDetect();
  }

  stopDetect = () => {
    this.setState({ detecting: false });
    this.props.stopDetect();
    this.props.startWebcam();
  }

  startAndDetect = () => {
    this.setState({ live: true, detecting: true });
    this.props.startDetect();
  }

  stop = () => {
    this.setState({ live: false, detecting: false })
    this.props.stopDetect();
  }

  componentDidUpdate() {
    let { videoRef } = this.state;
    if(videoRef.current.srcObject !== this.props.videoStream) {
      videoRef.current.srcObject = this.props.videoStream
      this.setState({ videoRef })
    }
  }

  render() {
    return (
      <Container fluid>
        <ul>
          <li>normal webcam/detect button</li>
          <li>add screenshot(easy)</li>
        </ul>

        <p>
          Signaling state: <span id="signaling-state"></span>
        </p>
        <p>
          ICE gathering state: <span id="ice-gathering-state"></span>
        </p>
        <Row className="justify-content-md-center">
          <Col md={2}></Col>
          <Col md={8}>
            <Row>
              <Col md={2}></Col>
              <Col md={6} className="justify-content-md-center">
                <Row>
                  <Col md={6}>
                    <h2>Media</h2>
                  </Col>
                  <Col md={6} className="text-right">
                    <Button className="disabled" as="span" variant={!this.state.detecting ? "outline-danger" : "outline-success"}>
                      Connection state: {this.props.iceCon}
                      <Spinner as="span" role="status" size="sm"
                        variant={this.props.iceCon === 'connected' ? 'danger' : 'info'}
                        animation={this.props.iceCon === 'connected' ? "grow" : "border"}
                        style={{ display: this.props.iceCon && this.props.iceCon !== 'closed' ? "inline-block" : "none" }}>
                      </Spinner>
                    </Button>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <Card border={this.state.live ? "success" : "primary"} variant="primary" className="disabled">
                      <video ref={this.state.videoRef} autoPlay={true} playsInline={true}
                        style={{ width: "480px", height: "360px", margin: "10px auto" }}>
                      </video>
                    </Card>
                  </Col>
                </Row>
              </Col>
              <Col md={4}> add statistics or screenshots here</Col>
            </Row>
            {/* <Row className="mt-2"> */}
              {/* <Col md={8} className="text-center" style={{position: "relative"}}>
                <Spinner role="status" animation="border"
                  className={this.state.loading ? "" : "d-none"} style={{position: "absolute", top: "50%", left: "50%", zIndex: "100"}}>
                </Spinner>
              </Col> */}
              {this.props.loading ?
              <Row className="mt-2">
                <Col md={4}></Col>
                <Col md={2} className="text-center" style={{ position: "relative" }}>
                  <Spinner role="status" animation="border"
                     style={{ position: "absolute", top: "50%", left: "50%" }}>
                  </Spinner>
                </Col>
                <Col md={6}></Col>
              </Row> :
                <Row className="mt-2">
                  <Col md={2}></Col>
                  <Col md={2}>
                    <Button as="a" block
                      variant={!this.state.live ? "success" : "danger"}
                      className={this.state.detecting ? "disabled" : ""}
                      onClick={!this.state.live ? this.startWebcam : this.stopWebcam}>
                      {this.iceCon !== "connected" || this.iceCon !== "closed"}
                      {!this.state.live ? "Start webcam" : "Stop webcam"}
                    </Button>
                  </Col>
                  <Col md={2}>
                    <Button as="a" block
                      variant={!this.state.detecting ? "success" : "danger"}
                      onClick={!this.state.detecting ? this.startDetect : this.stopDetect}
                      className={!this.state.live ? "disabled" : ""}>
                      {!this.state.detecting ? "Start detecting" : "Stop detecting"}
                    </Button>
                  </Col>
                  <Col md={2}>
                    <Button as="a" block
                      variant={!this.state.detecting || !this.state.live ? "success" : "danger"}
                      onClick={!this.state.detecting && !this.state.live ? this.startAndDetect : this.stop}
                      className={this.state.live && !this.state.detecting ? "disabled" : ""}>
                      {this.state.live && this.state.detecting ? "Stop" : "Start & detect"}
                    </Button>
                  </Col>
                  <Col md={4}></Col>
                </Row>
              }
            {/* </Row> */}

          </Col>
          <Col md={2}></Col>
        </Row>

        <h2>Data channel</h2>
        <pre id="data-channel" style={{ height: "200px" }}></pre>

        <h2>SDP</h2>

        <h3>Offer</h3>
        <pre id="offer-sdp"></pre>

        <h3>Answer</h3>
        <pre id="answer-sdp"></pre>
      </Container>
    )
  }
}