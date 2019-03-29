import React, { Component } from 'react';
/*
import ReactDOM from 'react-dom';
// eslint-disable-next-line import/no-webpack-loader-syntax
import data from "csv-loader!./housingData1718_cleaned.csv";
*/
import './App.css';
import Form from "react-jsonschema-form";

const schema = {
  title: "Calculator",
  type: "object",
  required: ["sex", "roomtype", "residence", "tiernumber", "applytype"],
  properties: {
    sex: {
      type: "string", 
      title: "Sex:"
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
    },
    applytype: {
      type: "string",
      title: "Group Size: "
    }
  }
};

function findLeastSquares(x_values, y_values) {
  let x_sum = 0;
  let y_sum = 0;
  let xsq_sum = 0;
  let xy_sum = 0;
  let count = 0;

  for (let i = 0; i < x_values.length; i++) {
    let x = x_values[i];
    let y = y_values[i];

    x_sum += x;
    y_sum += y;
    xsq_sum += (x * x);
    xy_sum += (x * y);
    count++;
  }

  let aValue = ( (count * xy_sum) - (x_sum * y_sum) ) / ( (count * xsq_sum) - (x_sum * x_sum) );
  let bValue = ( (y_sum * xsq_sum) - (x_sum * xy_sum) ) / ( (count * xsq_sum) - (x_sum * x_sum) );

  return [aValue, bValue];  
}


function processTrends(gender, typeCol, resID, des_year, simple, linear, logistic) {
  const data_1718 = require('./housingData1718.json');
  const data_16 = require('./housingData16.json');
  const data_15 = require('./housingData15.json');

  let cutoffs = [];
  let yearList = [2015, 2016, 2017, 2018];

  let currData;
  for (let i = 0; i < yearList.length; i++) {
    switch (yearList[i]) {
      case 2015:
        currData = data_15;
        break;
      case 2016:
        currData = data_16;
        break;
      case 2017 || 2018:
        currData = data_1718;
    }
    for (let j = 0; j < currData.length; j++) {
      let item = currData[j];
      if (item.year == yearList[i] && (gender == "n" || item.sex == gender) && item.res_name_edited == resID) {
        switch (typeCol) {
          case "individual":
            cutoffs.push(item.individual);
            break;
          case "group_2":
            cutoffs.push(item.group_2);
            break;
          case "group_3":
            cutoffs.push(item.group_3);
            break;
          case "group_4":
            cutoffs.push(item.group_4);
        }
        break;
      }
    }
  }

  if (cutoffs.length == 1) {
    return cutoffs[0];
  } else if (cutoffs.length > 1 && yearList.length == cutoffs.length) {
    const ls_model = findLeastSquares(yearList, cutoffs);
    return Math.round(ls_model[0] * des_year + ls_model[1]);
  }
  return 0;
}

function processSingleQuery(gender_raw, roomType_raw, resName_raw, tierNum_raw, applyType_raw) {

  /* gender */
  let gender;
  switch(gender_raw) {
    case "male":
      gender = "m";
      break;
    case "female":
      gender = "f";
      break;
    default:
      gender = "n";
  }

  /* room type + residence */
  let roomType;
  switch(roomType_raw) {
    case "a 1 room single":
      roomType = "1 Room Single";
      break;
    case "a 1 room double":
      roomType = "1 Room Double";
      break;
    case "a 1 room double (focus)" :
      roomType = "1 Room Double (focus)";
      break;
    case "a 2 room double" :
      roomType = "2 Room Double";
      break;
    case "a 2 room double (focus)" : 
      roomType = "2 Room Double (focus)";
      break;
    case "a triple" : 
      roomType = "Triple";
      break;
    case "a standard room" : 
      roomType = "Standard";
      break;
    case "a premium room" :
      roomType = "Premium";
      break;
    case "substance free housing" :
      roomType = "Substance Free Housing";
      break;
    case "ethnic housing" :
      roomType = "ETHNIC";
      break;
    default:
      roomType = "Any";
  }
  if (roomType == "ETHNIC") {
    switch (resName_raw) {
      case "Ujamaa":
        roomType = "Ethnic" + "B";
        break;
      case "Hammarskjold":
        roomType = "Ethnic" + "I";
        break;
      case "Muwekma":
        roomType = "Ethnic" + "N";
        break;
      case "Zapata":
        roomType = "Ethnic" + "C";
        break;
      case "Okada":
        roomType = "Ethnic" + "A";
        break;
    }
  }
  const resID = roomType + "," + resName_raw;

  /* applytype (number of ppl in group) */
  let typeCol;
  switch (applyType_raw) {
    case "an individual" :
      typeCol = "individual";
      break;
    case "a group of 2" :
      typeCol = "group_2";
      break;
    case "a group of 3" :
      typeCol = "group_3";
      break;
    case "a group of 4" :
      typeCol = "group_4";
      break;
  }

  /* tier number */
  const tierNum = tierNum_raw;

  let output = '';
  /* find percentage */
  const score_ceiling = tierNum * 1000;
  const score_floor = score_ceiling - 999;

  const cutoff = processTrends(gender, typeCol, resID, 2019, false, true, false);

  if (cutoff > score_ceiling) {
    output = '>99';
  } else if (cutoff < score_floor) {
    output = '<0.1';
  } else {
    output = (cutoff - score_floor) / 10;
  }

  return output;
}

const log = (type) => console.log.bind(console, type);

const onError = (errors) => console.log('I have', errors.length, 'errors to fix');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      results: null
    }
  }

  onSubmit = ({formData}) => {
    let sex = formData.sex;
    let roomtype = formData.roomtype;
    let residence = formData.residence;
    let tiernumber = formData.tiernumber;
    let applytype = formData.applytype;

    this.setState({results: processSingleQuery(sex, roomtype, residence, tiernumber, applytype)});
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Form schema={schema}
            onChange={log("changed")}
            onSubmit={this.onSubmit}
            formData={this.formData}
            onError={onError} />
          <div>{this.state.results && `Your Chances: ${this.state.results}%` }</div> 
        </header>
      </div>
    );
  }
}

export default App;