import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Button from 'react-bootstrap/Button';
// import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Container from 'react-bootstrap/Container'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import LiveWebcam from './ui/LiveWebcam'
class App extends Component {
  state = {
    constraints: {
      audio: false,
      video: {
        width: 320,
        height: 240,
        facingMode: "user",
      }
    },
    active: false,
    pc: null,
    dc: null,
    dcInterval: null,
    iceGathering: null,
    iceCon: null,
    signaling: null,
    videoStream: null,
    loading: false,
  }

  createPeerConnection = () => {
    const config = {
      sdpSemantics: 'unified-plan'
    };

    const pc = new RTCPeerConnection(config);

    // register some listeners to help debugging
    pc.addEventListener('icegatheringstatechange', () => {
      document.getElementById('ice-gathering-state').textContent += ' -> ' + pc.iceGatheringState;
    }, false);
    document.getElementById('ice-gathering-state').textContent = pc.iceGatheringState;

    pc.onconnectionstatechange = () => {
      console.log(pc)
      this.setState({ iceCon: pc.iceConnectionState })
    };
    this.setState({ iceCon: pc.iceConnectionState })

    pc.addEventListener('signalingstatechange', () => {
      document.getElementById('signaling-state').textContent += ' -> ' + pc.signalingState;
    }, false);
    document.getElementById('signaling-state').textContent = pc.signalingState;

    // connect video
    pc.ontrack = (event) => {
      console.log(event);
      if (event.track.kind === 'video')
        // document.getElementById('video').srcObject = event.streams[0];
        this.setState({ videoStream: event.streams[0] });
    }

    this.setState({ pc });
  }



  negotiate = async () => {
    const { pc } = this.state
    try {
      let offer = await pc.createOffer()
      console.log("offer" + offer)
      pc.setLocalDescription(offer)

      await new Promise(resolve => {
        if (pc.iceGatheringState === 'complete') {
          resolve();
        } else {
            pc.onicegatheringstatechange = () => {
              if (pc.iceGatheringState === 'complete') {
                pc.onicegatheringstatechange = null;
                resolve();
              }
            };
        }
      })

      let codec = 'default';
      // codec = 'VP8/90000';
      offer = pc.localDescription

      document.getElementById('offer-sdp').textContent = offer.sdp;

      const response = await fetch('/offer', {
        body: JSON.stringify({
          sdp: offer.sdp,
          type: offer.type
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      });

      const answer = await response.json();
      document.getElementById('answer-sdp').textContent = answer.sdp;
      pc.setRemoteDescription(answer);
      this.setState({ loading: false });
    }
    catch (e) {
      console.log(e);
    }
  }

  startWebcam = async () => {
    this.setState({ loading: true });
    const userMediaStream = await navigator.mediaDevices.getUserMedia(this.state.constraints);
    // console.log("aicilisa")
    // console.log(userMediaStream.getTracks())
    // console.log(userMediaStream.getTracks()[0])
    this.setState({ videoStream: userMediaStream, loading: false })
  }

  stopWebcam = async () => {
    this.setState({ loading: true });
    await this.state.videoStream.getTracks().forEach(track => {
      track.stop();
    })
    this.setState({ videoStream: null, loading: false });
  }

  startDetect = async () => {
    this.setState({ loading: true });

    await this.createPeerConnection();
    console.log(this.state.pc)
    let time_start = null

    // create datachannel
    let parameters = {
      "ordered": "true",
    }
    this.setState({ dc: this.state.pc.createDataChannel('chat', parameters) })

    // // just for debugging
    // this.state.dc.onopen = function () {
    //   document.getElementById('data-channel').textContent += '- open\n';
    //   this.setState({dcInterval: setInterval(function () {
    //     var message = 'ping ' + current_stamp();
    //     document.getElementById('data-channel').textContent += '> ' + message + '\n';
    //     this.state.dc.send(message);
    //   }, 1000)})
    // };

    this.state.dc.onmessage = function (event) {
      console.log(event)
      document.getElementById('data-channel').textContent += '< ' + event.data + '\n';

      if (event.data.substring(0, 4) === 'pong') {
        var elapsed_ms = parseInt(event.data.substring(5), 10);
        document.getElementById('data-channel').textContent += ' RTT ' + elapsed_ms + ' ms\n';
      }
    };

    try {
      const userMediaStream = await navigator.mediaDevices.getUserMedia(this.state.constraints);
      console.log("aici")
      console.log(userMediaStream.getTracks())
      userMediaStream.getTracks().forEach(track => {
        this.state.pc.addTrack(track, userMediaStream);
      });
      await this.negotiate();
    }
    catch (e) {
      alert('Could not acquire media: ' + e);
    }
  }

  stopDetect = () => {
    const { pc, dc } = this.state;
    this.setState({ loading: true })
    // close data channel
    if (dc) {
      dc.close();
    }

    // close transceivers
    if (pc.getTransceivers) {
      pc.getTransceivers().forEach(transceiver => {
        if (transceiver.stop) {
          transceiver.stop();
        }
      });
    }

    // close local video
    pc.getSenders().forEach(sender => {
      sender.track.stop();
    });

    // close peer connection
    pc.close();

    this.setState({ iceCon: "closed", videoStream: null, loading: false });
  }

  render() {
    return (
      <Router>

        <div className="wrapper">
          <Sidebar active={this.state.active} />

          <div id="content">
            <Navbar btnClick={() => this.setState({ active: !this.state.active })} />
            <Switch>
              <Route exact path="/">
                <LiveWebcam {...this.state}
                  startDetect={() => this.startDetect()} stopDetect={() => this.stopDetect()}
                  startWebcam={() => this.startWebcam()} stopWebcam={() => this.stopWebcam()} />
              </Route>
              <Route path="/upload-video">
                {/* <UploadVideo /> */}
                <div>uvid</div>
              </Route>
              <Route path="/upload-image">
                {/* <UploadImage /> */}
                <div>uimg</div>
              </Route>
            </Switch>
          </div>
        </div>
      </Router>
    )
  }
}
export default App;
