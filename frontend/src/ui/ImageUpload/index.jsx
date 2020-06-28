import React, { Component } from 'react'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Spinner from 'react-bootstrap/Spinner';

export default class ImageUpload extends Component {
  state = {
    imgUrls: [],
    imgFiles: [],
    selectedImgUrl: "",
    loading: false,
  }

  handleChange = event => {
    const files = Object.values(event.target.files);
    console.log(files)
    console.log(typeof files)
    let exts = files.map(file => file.name.substr(file.name.lastIndexOf('.') + 1))
    let imgUrls = [];
    let imgFiles = [];
    let result = exts.every((ext, i) => {
      if (ext === 'jpg' || ext === "jpeg" || ext === "png") {
        if ((files[i].size / 1024) / 1024 <= 1) {
          imgUrls.push(URL.createObjectURL(files[i]));
          imgFiles.push(files[i])
          // this.setState({ imgUrl, imgFile: files[0] });
          return true;
        } else {
          this.props.showToaster("File size limit excedeed! Maximum size per file is 1MB!", "bg-danger");
          return false;
        }
      } else {
        this.props.showToaster("Only images with .jpg, .jpeg and .png extensions accepted!", "bg-danger")
        return false;
      }
    })

    if (result) {
      this.setState({ imgUrls, imgFiles, selectedImgUrl: imgUrls[0] });
    }
  }

  showFileList = () => {
    const { imgFiles } = this.state;
    let string = '';
    imgFiles.forEach(file => {
      string += file.name + ', '
    })
    string = string.substr(0, string.length - 2)
    if (string.length > 52) {
      string = string.substr(0, 50) + "..";
    }
    return string;
  }

  sendImage = async () => {
    this.setState({ loading: true, selectedImgUrl: "" })
    const { imgFiles } = this.state
    const imgUrls = []
    let flag = false
    await Promise.all(imgFiles.map(async (file, index) => {
      let formData = new FormData();
      formData.append("detect-image", file)
      console.log(formData);

      const response = await fetch('/detect-image', {
        body: formData,
        method: 'POST'
      })

      if (response.status === 200) {
        const blob = await response.blob();
        imgUrls[index] = URL.createObjectURL(blob);
      } else {
        flag = true;
        this.props.showToaster(response.status + ": " + response.statusText, "bg-danger")
      }
    }))

    if (!flag) {
      this.setState({ imgUrls, selectedImgUrl: imgUrls[0] });
      this.props.showToaster("Processing successful!", "bg-success");
    }
    this.setState({ loading: false })
}

render() {
  return (
    <Container fluid>
      <Row className="justify-content-md-center">
        <Col md={3}></Col>
        <Form.Group as={Col} md="6">
          <small className="text-muted">Maximum 1MB per image</small>
          <InputGroup >
            <Form.File custom>
              <Form.File.Input
                multiple
                accept=".jpg, .jpeg, .png"
                onChange={event => this.handleChange(event)} />
              <Form.File.Label htmlFor="a" data-browse="Browse" className="bg-secondary">
                {this.state.imgFiles.length ? this.showFileList() : 'Choose files'}
              </Form.File.Label>
            </Form.File>
            <InputGroup.Append>
              <Button as="a"
                variant="secondary"
                className={`input-group-text ${this.state.imgFiles.length ? "" : "disabled"} `}
                onClick={this.state.imgFiles.length ? () => this.sendImage() : () => { }}>Send</Button>
            </InputGroup.Append>
          </InputGroup>
        </Form.Group>
        <Col md={3}></Col>
      </Row>
      <Row className="justify-content-md-center">
        <Col md={1}></Col>
        <Col md={7} className="d-flex align-items-center justify-content-center">
          <Image fluid src={this.state.selectedImgUrl}
            style={{
              width: "auto",
              maxHeight: "75vh"
            }} />
        </Col>
        <Col md={4}>
          <h4>Image list</h4>
          <Row className={`border-secondary ${this.state.imgFiles.length ? "border" : "border-top"}`}
            style={{
              maxHeight: "70vh",
              overflowY: this.state.loading ? "hidden" : "auto"
            }}>
            {this.state.loading ?
              <Col md={12} className="text-center" style={{ position: "relative", minHeight: 300, minWidth: 300 }}>
                <Spinner role="status" animation="border" variant="primary"
                  style={{ position: "absolute", top: "50%", left: "50%" }}>
                </Spinner>
              </Col> :
              this.state.imgUrls.map(image =>
                <Col md={6}
                  className={`d-flex align-items-center justify-content-center mb-1 mt-1`}>
                  <Image src={image} style={{
                    maxWidth: "90%",
                    maxHeight: 300,
                  }}
                    className={`${this.state.selectedImgUrl === image ? "border border-3 border-danger rounded" : ""}`}
                    onClick={() => this.setState({ selectedImgUrl: image })}
                  />
                </Col>)
            }
          </Row>
        </Col>
      </Row>
    </Container>
  )
}

}