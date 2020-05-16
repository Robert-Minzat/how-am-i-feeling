import React, { Component } from 'react'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';

export default class ImageUpload extends Component {
  state = {
    imgUrl: "",
    imgFile: null,
  }

  handleChange = event => {
    const files = event.target.files;
    let ext = files[0].name.substr(files[0].name.lastIndexOf('.') + 1)
    if (ext === 'jpg' || ext === "jpeg" || ext === "png") {
      if( (files[0].size / 1024)/1024 <= 1) {
        let imgUrl = URL.createObjectURL(files[0]);
        this.setState({ imgUrl, imgFile: files[0] });
      } else {
        this.setState({ imgUrl: "", imgFile: null});
        this.props.showToaster("File size limit excedeed! Maximum 1MB!", "bg-danger")
      }
    } else {
      this.setState({ imgUrl: "", imgFile: null });
      this.props.showToaster("Only images with .jpg, .jpeg and .png extensions accepted!", "bg-danger")
    }
  }

  sendImage = async () => {
    let formData = new FormData();
    formData.append("detect-image", this.state.imgFile)
    console.log(formData);

    const response = await fetch('/detect-image', {
      body: formData,
      method: 'POST'
    })

    if(response.status === 200) {
      const blob = await response.blob();
      let imgUrl = URL.createObjectURL(blob);
      this.props.showToaster("Processing successful!", "bg-success")
      this.setState({ imgUrl });
    } else {
      this.props.showToaster(response.status + ": " + response.statusText, "bg-danger")
    }
  }

  render() {
    return (
      <Container fluid>
        <Row className="justify-content-md-center">
          <Col md={3}></Col>
          <Form.Group as={Col} md="6">
            <InputGroup>
              <Form.File custom
              >
                <Form.File.Input
                  accept=".jpg, .jpeg, .png"
                  onChange={event => this.handleChange(event)} />
                <Form.File.Label data-browse="Browse">
                  {this.state.imgFile ? this.state.imgFile.name : 'Choose file'}
                </Form.File.Label>
              </Form.File>
              <InputGroup.Append>
                <Button as="a"
                  variant="secondary"
                  className={`input-group-text ${this.state.imgFile ? "" : "disabled"} `}
                  onClick={this.state.imgFile ? () => this.sendImage() : () => { }}>Send</Button>
              </InputGroup.Append>
            </InputGroup>
          </Form.Group>
          <Col md={3}></Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col md={3}></Col>
          <Col md={6} className="text-center">
            <Image src={this.state.imgUrl} style={{minWidth: "80%"}} fluid />
          </Col>
          <Col md={3}></Col>
        </Row>
      </Container>
    )
  }

}