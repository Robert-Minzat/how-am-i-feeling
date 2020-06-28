import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import LiveWebcam from './ui/LiveWebcam'
import ImageUpload from './ui/ImageUpload'
import Toaster from './components/Toaster'
import VideoUpload from './ui/VideoUpload';
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
    title: 'Live webcam',
    showToaster: false,
    toasterMessage: '',
    toasterVariant: ''
  }

  createPeerConnection = () => {
    const config = {
      sdpSemantics: 'unified-plan'
    };

    const pc = new RTCPeerConnection(config);

    // register some listeners to help debugging
    pc.onicegatheringstatechange = () => {
      this.setState({ iceGathering: pc.iceGatheringState });
    };
    this.setState({ iceGathering: pc.iceGatheringState });

    pc.onconnectionstatechange = () => {
      console.log(pc)
      this.setState({ iceCon: pc.iceConnectionState });
      if (pc.iceConnectionState === "connected") {
        this.showToaster("Connection established successfully!", "bg-success");
      } else if (pc.iceCon === "disconnected") {
        this.showToaster("Connection lost!", "bg-danger");
      }
    };
    this.setState({ iceCon: pc.iceConnectionState });

    pc.onsignalingstatechange = () => {
      this.setState({ signaling: pc.signalingState });
    };
    this.setState({ signaling: pc.signalingState });

    // connect video
    pc.ontrack = (event) => {
      console.log(event);
      if (event.track.kind === 'video')
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

      // document.getElementById('offer-sdp').textContent = offer.sdp;

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
      // document.getElementById('answer-sdp').textContent = answer.sdp;
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

  startDetect = async (stream, streamTracks) => {
    this.setState({ loading: true });

    await this.createPeerConnection();
    console.log(this.state.pc)

    // create datachannel
    let parameters = {
      "ordered": "true",
    }
    this.setState({ dc: this.state.pc.createDataChannel('chat', parameters) })

    this.state.dc.onmessage = function (event) {
      console.log(event)
      document.getElementById('data-channel').textContent += '< ' + event.data + '\n';

      if (event.data.substring(0, 4) === 'pong') {
        var elapsed_ms = parseInt(event.data.substring(5), 10);
        document.getElementById('data-channel').textContent += ' RTT ' + elapsed_ms + ' ms\n';
      }
    };

    try {
      // const userMediaStream = await navigator.mediaDevices.getUserMedia(this.state.constraints);
      streamTracks.forEach(track => {
        this.state.pc.addTrack(track, stream);
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

  showToaster = (message, variant) => {
    this.setState({ showToaster: true, toasterMessage: message, toasterVariant: variant })
  }

  render() {
    return (
      <Router>
        <Toaster
          handleClose={() => this.setState({ showToaster: false })}
          show={this.state.showToaster}
          message={this.state.toasterMessage}
          variant={this.state.toasterVariant} />
        <div className="wrapper">
          <Sidebar active={this.state.active} />
          <div id="content">
            <Switch>
              <Route exact path="/">
                <Navbar btnClick={() => this.setState({ active: !this.state.active })} title={"Live webcam"} />
                <LiveWebcam {...this.state}
                  startDetect={(stream, streamTracks) => this.startDetect(stream, streamTracks)} stopDetect={() => this.stopDetect()}
                  startWebcam={() => this.startWebcam()} stopWebcam={() => this.stopWebcam()} />
              </Route>
              <Route path="/upload-video">
                <Navbar btnClick={() => this.setState({ active: !this.state.active })} title={"Video upload"} />
                <VideoUpload {...this.state}
                  startDetect={(stream, streamTracks) => this.startDetect(stream, streamTracks)} stopDetect={() => this.stopDetect()}/>
              </Route>
              <Route path="/image-upload">
                <Navbar btnClick={() => this.setState({ active: !this.state.active })} title={"Image upload"} />
                <ImageUpload
                  showToaster={(message, variant) => this.showToaster(message, variant)} />
              </Route>
            </Switch>
          </div>
        </div>
      </Router>
    )
  }
}
export default App;
