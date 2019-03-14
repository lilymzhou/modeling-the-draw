import React, { Component } from 'react';
//import ReactDOM from 'react-dom';
//import Flexbox from 'flexbox-react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
//import Button from 'react-bootstrap/Button';
//import logo from './logo.svg';
import './App.css';
import Form from "react-jsonschema-form";

const schema = {
  title: "Calculator",
  type: "object",
  required: ["sex", "roomtype", "residence", "tiernumber"],
  properties: {
    sex: {
      type: "string", 
      title: "Sex (F or M):"
    },
    roomtype: {
      type: "string", 
      title: "Room Type:"
    },
    residence: {
      type: "string", 
      title: "Residence:"
    },
    tiernumber: {
      type: "integer", 
      title: "Tier #:",
      maxLength: 1
    }
  }
};

/*Variables representing form label names*/
let sex;
let roomtype;
let residence;
let tiernumber;

/* percentage output */
const schema2 = {
  title: "Your Chances",
  type: "object",
  properties: {
    percentage: {
      type: "string",
      title: ""//TODO
    }
  }
}

const log = (type) => console.log.bind(console, type);

//const onSubmit = ({formData}, e) => console.log("Data submitted: ", formData);

const onError = (errors) => console.log("I have", errors.length, "errors to fix");

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  onSubmit = ({formData}) => {
    sex = JSON.stringify(formData.sex, null, 2);
    roomtype = JSON.stringify(formData.roomtype, null, 2);
    residence = JSON.stringify(formData.residence, null, 2);
    tiernumber = JSON.stringify(formData.tiernumber, null, 2);
    
    //<Form schema={schema2} />
    //alert(sex); //TODO: add this to schema2
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Container>
            <Row>
              <Col>
                <Form schema={schema}
                onChange={log("changed")}
                onSubmit={this.onSubmit}
                formData={this.formData}
                onError={onError} />
              </Col>
              <Col>
                <Form schema={schema2} />
              </Col>
            </Row>
          </Container>
        </header>
      </div>
    );
  }
}

export default App;