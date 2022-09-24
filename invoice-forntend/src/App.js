import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Invoice from "./Pages/invoice/Invoice";
import Prescription from "./Pages/Prescription/Prescription";
import InvoicePatient from "./Pages/Invoice-patient"

export default class App extends Component {
  
  constructor(props) {
    super(props);
  }

  render() {    
    return (
      // <Invoice/>
      <InvoicePatient/>
      // <Prescription/>
    );
  }
}
