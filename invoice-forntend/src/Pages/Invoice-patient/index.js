// import React from 'react'
// import RowAndColumnSpacing from '../../components/Grid'
// import BasicTextFields from '../../components/TextFields'


// const index = () => {
//     const patient=[{
//         patientCode: 1000002,
//         patientName: "Loubna Saoud",
//         registrationDate: "2020-03-03 11:18:23.390",
//         appDate: "2021-10-04 00:00:00.000",
//         provoder: "Dr. Firas Hamzeh",
//     },
//     {
//         patientCode: 1000003,
//         patientName: "Loubna Saoud",
//         registrationDate: "2020-03-03 11:18:23.390",
//         appDate: "2021-10-04 00:00:00.000",
//         provoder: "Dr. Firas Hamzeh",
//     },
//     {
//         patientCode: 1000004,
//         patientName: "Loubna Saoud",
//         registrationDate: "2020-03-03 11:18:23.390",
//         appDate: "2021-10-04 00:00:00.000",
//         provoder: "Dr. Firas Hamzeh",
//     },
//     {
//         patientCode: 1000005,
//         patientName: "Loubna Saoud",
//         registrationDate: "2020-03-03 11:18:23.390",
//         appDate: "2021-10-04 00:00:00.000",
//         provoder: "Dr. Firas Hamzeh",
//     },
// ]
//   return (
//    <RowAndColumnSpacing data={patient} />
//   )
// }

// export default index

import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';

const {REACT_APP_SERVER_URL, TRN, CLINIC_ADDRESS, CLINIC_NAME, CLINIC_EMAIL, CURRENCY, CR} = window.env;
     const patient=[{
        patientCode: 1000002,
        patientName: "Loubna Saoud",
        registrationDate: "2020-03-03 11:18:23.390",
        appDate: "2021-10-04 00:00:00.000",
        provoder: "Dr. Firas Hamzeh",
    },
    {
        patientCode: 1000003,
        patientName: "Loubna Saoud",
        registrationDate: "2020-03-03 11:18:23.390",
        appDate: "2021-10-04 00:00:00.000",
        provoder: "Dr. Firas Hamzeh",
    },
    {
        patientCode: 1000004,
        patientName: "Loubna Saoud",
        registrationDate: "2020-03-03 11:18:23.390",
        appDate: "2021-10-04 00:00:00.000",
        provoder: "Dr. Firas Hamzeh",
    },
    {
        patientCode: 1000005,
        patientName: "Loubna Saoud",
        registrationDate: "2020-03-03 11:18:23.390",
        appDate: "2021-10-04 00:00:00.000",
        provoder: "Dr. Firas Hamzeh",
    },
]
class Invoice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dated: new Date().toLocaleString(),
      patientId: undefined,
      showPatientList: true
    };
  }
 
  getInvoices=(e)=> {
    e.preventDefault();
    let id = this.state.patientId;
    if(!this.isValidId(id)) return;
    axios.get(REACT_APP_SERVER_URL + 'getInvoice?patientId=' + id)
      .then(res => {
        console.log('response : ', res);
        if(res.data) {
          if(res.data.services.length < 1 ) {
            alert('No service provided to this patient today');
            return;
          }
          this.setState({
            'patientDetail' : res.data.patientDetails,
            'services' : res.data.services,
            'paymentDetails' : res.data.paymentDetails,
            'discounts' : res.data.discountsDetails,
            'showPatientList' : false,
            'showInvoiceList' : false
          });
        } else {
        //   alert("Backend Service failed to respond");
        }
      }, (error)=> {
        // alert("Backend Service failed to respond");
        console.log('error : ', error);
      }
    )
  }

  isValidId = (id) => {
    if(!id) {
      alert('Please enter Patient Id first');
      return false;
    }
    if(isNaN(id)) {
      alert('Please enter a valid Patient Id');
      return false;
    }
    return true;
  }

  getInvoiceListByPatient= (e)=> {
    e.preventDefault();
    let id = this.state.patientId;
    if(!this.isValidId(id)) return;
    axios.get(REACT_APP_SERVER_URL + 'getInvoiceList?invoicesPerPage=100&patientId=' + id)
      .then(res => {
        console.log('response : ', res);
        if(res.data) {
          this.setState({
            'invoiceList' : res.data.invoices,
            'showPatientList' : false,
            'showInvoiceList' : true,
            'patientIdForOldInvoice' : id
          });
        } else {
        //   alert("Backend Service failed to respond");
        }
      }, (error)=> {
        // alert("Backend Service failed to respond");
        console.log('error : ', error);
      }
    )
  }

  cancelInvoice = (e) => {
    this.setState({
      'patientDetail' : null,
      'services' : null,
      'paymentDetails' : null,
      'discounts' : null,
      'showPatientList' : true
    });
  }

  onInputchange=(event)=> {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  regenerateInvoice = (invoiceNo) => {
    let id = this.state.patientId;
    if(!this.isValidId(id)) return;
    // axios.get('http://192.168.1.109:8085/getInvoice?patientId=' + this.state.patientId)
    axios.get(REACT_APP_SERVER_URL + 'getOldInvoice?invoiceNo=' + invoiceNo + '&patientId=' + this.state.patientIdForOldInvoice)
      .then(res => {
        if(res.data) {
          this.setState({
            'patientDetail' : res.data.patientDetails,
            'services' : res.data.services,
            'paymentDetails' : res.data.paymentDetails,
            'discounts' : res.data.discountsDetails,
            'showPatientList' : false,
            'showInvoiceList' : false
          });
        } else {
        //   alert("Backend Service failed to respond");
        }
      }, (error)=> {
        // alert("Backend Service failed to respond");
        console.log('error : ', error);
      }
    )
  }

  componentDidMount() {
    axios.get(REACT_APP_SERVER_URL + 'getPatients')
      .then(res => {
        if(res.data) {
          if(res.data.patients && res.data.patients.length > 0) {
            this.setState({patientList : res.data.patients});
          } else {
            alert('No Patient found.');
          }
        } else {
        //   alert("Backend Service failed to respond");
        }
      }, (error)=> {
        // alert("Backend Service failed to respond");
        console.log('error : ', error);
      }
    );
  }

  changePatientId = (patientId)=> {
    this.setState({patientId : patientId});
  }

  showPatientList = (e) => {
    e.preventDefault();
    this.setState({
      showPatientList : true,
      showInvoiceList: false
    });
  }
  
  
  render() {
    const patientDetail = this.state.patientDetail;
    const services = this.state.services;
    const paymentDetails = this.state.paymentDetails;
    const discounts = this.state.discounts;
    const dated = this.state.dated;
    const patientList = this.state.patientList;
    const showPatientList = this.state.showPatientList;
    const invoiceList = this.state.invoiceList;
    const showInvoiceList = this.state.showInvoiceList;

    const getPatientId = (id) => {
        console.log(id)
    }

    let cost = {
      totalCost : 0,
      totalVat : 0,
      totalPayment : 0,
      discount: 0
    };
         const patient=[{
        patientCode: 1000002,
        patientName: "Loubna Saoud",
        registrationDate: "2020-03-03 11:18:23.390",
        appDate: "2021-10-04 00:00:00.000",
        provoder: "Dr. Firas Hamzeh",
    },
    {
        patientCode: 1000003,
        patientName: "Loubna Saoud",
        registrationDate: "2020-03-03 11:18:23.390",
        appDate: "2021-10-04 00:00:00.000",
        provoder: "Dr. Firas Hamzeh",
    },
    {
        patientCode: 1000004,
        patientName: "Loubna Saoud",
        registrationDate: "2020-03-03 11:18:23.390",
        appDate: "2021-10-04 00:00:00.000",
        provoder: "Dr. Firas Hamzeh",
    },
    {
        patientCode: 1000005,
        patientName: "Loubna Saoud",
        registrationDate: "2020-03-03 11:18:23.390",
        appDate: "2021-10-04 00:00:00.000",
        provoder: "Dr. Firas Hamzeh",
    },
]

    if(discounts && discounts.length > 0) {
      discounts.forEach(discount => {
        cost.discount += (discount.amount * (-1));
      });
    };
    let invoices = invoiceList ? invoiceList.map((inv, key) =>{
      return(
        <tr key={key}>
          <td onClick={()=> this.regenerateInvoice(inv.invoicenumber)} className="link">{inv.invoicenumber}</td>
          <td>{inv.patientcode}</td>
          <td>{inv.invoicedate}</td>
        </tr>
      )
    }) : null;
    let patients = patientList ? patientList.map((pat, key) =>{
      return(
        <tr key={key}>
          <td onClick={()=> this.changePatientId(pat.patientcode)} className="link">{pat.patientcode}</td>
          <td>{pat.patientname}</td>
          <td>{pat.gender === 'M' ? 'Male' : 'Female'}</td>
          <td>{pat.dob}</td>
        </tr>
      )
    }) : null;
    let serviceTable = services && services.length > 0 ? services.map((res) => {
      cost.totalCost += res.patientcost;
      cost.totalVat += res.vatamount;
      return (
        <tr>
          <td>{res.username}</td>
          <td>{res.description}</td>
          <td style={{textAlign: "center"}}>{res.codeid}</td>
          <td style={{textAlign: "center"}}>{res.Tooth}</td>
          <td style={{textAlign: "center"}}>{res.Surface}</td>
          <td style={{textAlign: "right"}}>{res.patientcost.toFixed(2) }</td>
          <td style={{textAlign: "center"}}>{res.vatpercent}</td>
          <td style={{textAlign: "right"}}>{res.vatamount.toFixed(2)}</td>
          <td style={{textAlign: "right"}}>{res.amountwithvat.toFixed(2)}</td>
        </tr>
      );
    }) : null;

    let paymentsSection = paymentDetails && paymentDetails.length > 0 ?
      paymentDetails.map(payment=> {
        cost.totalPayment += payment.amount;
        const amount = payment.amount < 0 ? (payment.amount * (-1)) : payment.amount;
        const amountDisplay = payment.paymenttypedesc === 'Refund Cash' ?
          '(' + amount.toFixed(2) + ')' : amount.toFixed(2);
        return (
          <div className="row">
            <p className="col-sm-6 col-md-6">{(payment.paymenttypedesc && payment.paymenttypedesc.length > 0) ? payment.paymenttypedesc : payment.description}</p>
            <p className="col-sm-6 col-md-6" style={{textAlign: "right"}}>{amountDisplay}</p>
          </div>
        )
      })
      : null;
    
    const totalPayment = (cost.totalPayment < 0) ? cost.totalPayment*(-1) : cost.totalPayment;
    cost.netAmount = cost.totalCost - cost.discount;
    cost.grandTotal = cost.totalCost - cost.discount + cost.totalVat;
    return (
      <div className="receipt_box">
        <header>
          <div className="logo">
            <img src={process.env.PUBLIC_URL + "/logo.png"} />
          </div>
        </header>
        <hr/>
        <div className="invoice-tab">
          {
            !patientDetail ? (
            <section className="form_section">
              <form>
                <input name="patientId" type="text" placeholder="Enter Patient Code" value={this.state.patientId} onChange={this.onInputchange}/>
                <button className="btn btn-primary" onClick={(e)=>this.getInvoices(e)}>Generate Invoice</button>
                { showPatientList ?
                  <button className="btn btn-primary ml-10" onClick={(e)=>this.getInvoiceListByPatient(e)}>Get Invoices</button>
                  : 
                  <button className="btn btn-primary ml-10" onClick={(e)=>this.showPatientList(e)}>Show Patient List</button>
                }
              </form>
            </section>
            ) : null
          }
          {invoices && showInvoiceList ? 
            (
              <section className="invoice-list">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Invoice Number</th>
                      <th>Patient Code</th>
                      <th>Invoice Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices}
                  </tbody>
                </table>
              </section>
            ) : ''
          }
          {true || patients && showPatientList ? 
            (
              <section className="patient-list">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Patient Id</th>
                      <th>Patient Name</th>
                      <th>Gender</th>
                      <th>DOB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients}
                  </tbody>
                </table>
              </section>
            ) : ''
          }
          {
            patient.map((data)=>{
                return(
                    <section className="patient-list">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th onClick={() => getPatientId(data?.patientCode)}>{data.patientCode}</th>
                          <th>{data?.patientName}</th>
                          <th>Gender</th>
                          <th>DOB</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patients}
                      </tbody>
                    </table>
                  </section>
                )
            })
          }

          {
            patientDetail ? (
              <section className="patient_detail">
                <h2 className="text-center">Tax Invoice</h2>
                <p className="text-center mb-0">TRN : {TRN}</p>
                <p className="text-center mb-5">{CR}</p>
                <div className="row">
                  <div className="col-sm-5 col-md-5">
                    <div className="row">
                      <p className="col-sm-4 col-md-4">Patient:</p>
                      <span className="col-sm-4 col-md-4">{patientDetail.patientname}</span>
                    </div>
                    <div className="row">
                      <p className="col-sm-4 col-md-4">Invoice No:</p>
                      <span className="col-sm-4 col-md-4">{patientDetail.invoicenumber}</span>
                    </div>
                    <div className="row">
                      <p className="col-sm-4 col-md-4">Date:</p>
                      {/* <span className="col-sm-4 col-md-4">{new Date(services[0].invoicedate).toLocaleDateString("en-UK")}</span> */}
                      <span className="col-sm-4 col-md-4">{new Date(services[0].dateofservice).toLocaleDateString("en-UK")}</span>
                    </div>
                  </div>
                  <div className="col-sm-4 col-md-4">
                    <div className="row">
                      <p className="col-sm-4 col-md-4">Patient Code:</p>
                      <span className="col-sm-4 col-md-4">{patientDetail.patientcode}</span>
                    </div>
                    <div className="row">
                      <p className="col-sm-4 col-md-4">Gender:</p>
                      <span className="col-sm-4 col-md-4">{patientDetail.gender === 'M' ? 'Male' : patientDetail.gender === 'F' ? 'Female' : 'Unknown'}</span>
                    </div>
                    <div className="row">
                      <p className="col-sm-4 col-md-4">DOB:</p>
                      <span className="col-sm-4 col-md-4">{new Date(patientDetail.dob).toLocaleDateString("en-UK")}</span>
                    </div>
                  </div>
                </div>
              </section> ): null
          }
          {
            serviceTable ? (
              <section className="provider_detail">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Provider</th>
                      <th>Service</th>
                      <th>Code</th>
                      <th>Tooth</th>
                      <th>Surface</th>
                      <th>Amount</th>
                      <th>VAT%</th>
                      <th>VAT</th>
                      <th>Amount With VAT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceTable}
                  </tbody>
                </table>
              </section>
            ) : null
          }
          {
            serviceTable ? (
              <section className="payment_detail">
                <div className="row">
                  <div className="col-sm-4 col-md-4">
                    <p>Payment Mode</p>
                    {paymentsSection}
                    <div className="row">
                      <p className="col-sm-6 col-md-6">Total Payment:</p>
                      <p className="col-sm-6 col-md-6" style={{textAlign: "right"}}>{totalPayment.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="col-sm-2 col-md-2"></div>
                  <div className="col-sm-4 col-md-4">
                    <div className="row">
                      <p className="col-sm-6 col-md-6">Total:</p>
                      <p className="col-sm-6 col-md-6" style={{textAlign: "right"}}>{cost.totalCost.toFixed(2)}</p>
                      <p className="col-sm-6 col-md-6" >Discount:</p>
                      <p className="col-sm-6 col-md-6" style={{textAlign: "right"}}>{cost.discount.toFixed(2)}</p>
                      <p className="col-sm-6 col-md-6">Net Amount:</p>
                      <p className="col-sm-6 col-md-6" style={{textAlign: "right"}}>{cost.netAmount.toFixed(2)}</p>
                      <p className="col-sm-6 col-md-6">Total VAT:</p>
                      <p className="col-sm-6 col-md-6" style={{textAlign: "right"}}>{cost.totalVat.toFixed(2)}</p>
                      <p className="col-sm-6 col-md-6">
                        <b>Grand Total:</b>
                      </p>
                      <p className="col-sm-6 col-md-6" style={{textAlign: "right"}}>
                        <b>{cost.grandTotal.toFixed(2)}</b>
                      </p>
                      <p className="col-sm-6 col-md-6">
                        <b>Total Payment:</b>
                      </p>
                      <p className="col-sm-6 col-md-6" style={{textAlign: "right"}}>
                        <b>{totalPayment.toFixed(2)}</b>
                      </p>
                      <p className="col-sm-6 col-md-6">
                        <b>Invoice Balance:</b>
                      </p>
                      <p className="col-sm-6 col-md-6" style={{textAlign: "right"}}>
                        <b>{(cost.grandTotal + cost.totalPayment).toFixed(2)}</b>
                      </p>
                      <p className="col-sm-6 col-md-6">
                        <b></b>
                      </p>
                      <p className="col-sm-6 col-md-6">
                        <b></b>
                      </p>
                      <p className="col-sm-6 col-md-6">
                        <b>Patient Balance:</b>
                      </p>
                      <p className="col-sm-6 col-md-6" style={{textAlign: "right"}}>
                        <b>{parseInt(patientDetail.balance).toFixed(2)}</b>
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            ) : null
          }
          { patientDetail ? (
            <>
              <p><b>Note: Currency = {CURRENCY}</b></p>
              <hr/>
              <footer>
                <span className="text-center">
                  {CLINIC_NAME}
                </span>
                <span className="text-center">{CLINIC_ADDRESS}</span>
                <span className="text-center">
                  {CLINIC_EMAIL}
                </span>
                <span className="text-end">Powered by <b><i>DigiSol Ltd.</i></b></span>
              </footer>
              <div className="row justify-content-md-center no-print">
                <div className="col-sm-2 col-md-2">
                  <button type="button" className="btn btn-primary" onClick={(e)=>window.print()}>Print</button>
                  <button type="button" className="btn btn-btn-light" onClick={(e)=>this.cancelInvoice(e)}>Cancel</button>
                </div>
              </div>
            </>
            ) : null
          }
        </div>
      </div>
    );
  }
}
export default Invoice;