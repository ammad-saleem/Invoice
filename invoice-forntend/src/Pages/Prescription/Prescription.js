import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';

const {REACT_APP_SERVER_URL, TRN, CLINIC_ADDRESS, CLINIC_NAME, CLINIC_EMAIL, POWERED_BY} = window.env;
class Prescription extends Component {
  constructor(props) {
    super(props);
    this.drugDetailsTemplate = {
      drugId: 0,
      drug: '',
      dosage: '',
      frequencyId: 0,
      frequency: '',
      routeId: 0,
      route: '',
      duration: '',
      instructions: ''
    };
    this.state = {
      dated: new Date().toLocaleString(),
			patient: {},
      showPatientList: true,
      doctor: {},
      diagnosis: '',
      patientInstruction: '',
      routes: [],
      drugs: [],
      frequencies: [],
      drugRows: [],
      drugDetails: Object.assign({},this.drugDetailsTemplate),
      showPrintButton: true
    };
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

  onInputchange=(event)=> {
    this.setState({
      [event.target.name]: parseInt(event.target.value),
      patient: {}
    });
  }

  onPrescriptionInputchange=(event)=> {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  componentDidMount() {
    axios.get(REACT_APP_SERVER_URL + 'getPatientsAndDoctors')
      .then(res => {
        if(res.data) {
          if(res.data.doctors && res.data.doctors.length > 0) {
            this.setState({doctorList : res.data.doctors});
          } else {
            alert('No Doctor found.');
            return;
          }
          if(res.data.patients && res.data.patients.length > 0) {
            this.setState({patientList : res.data.patients});
          } else {
            alert('No Patient found.');
          }
        } else {
          alert("Backend Service failed to respond");
        }
      }, (error)=> {
        alert("Backend Service failed to respond");
        console.log('error : ', error);
      }
    );
  }

  changePatient = (patient)=> {
    this.setState({patientId : patient.patientcode, patient: patient});
  }

  showPatientList = (e) => {
    e.preventDefault();
    this.setState({
      showPatientList : true,
      showInvoiceList: false
    });
  }

	showPrescriptionTemplate = async() => {
		const patientId = this.state.patientId;
    if(Object.keys(this.state.doctor).length < 1 || this.state.doctor.fullname.length < 1) {
      alert("Please select doctor first.");
      return;
    }
		if(this.state.patientId && typeof this.state.patientId === 'number' && this.state.patientId > 0) {

      let res = null;
      res = await	axios.get(REACT_APP_SERVER_URL + 'getPrescriptionDetails?patientId=' + patientId);
      if(res.data && res.data.patientDetails && res.data.patientDetails.length > 0) {
        this.setState({
          showPatientList : false,
          patient: res.data.patientDetails[0],
          drugs: res.data.drugs,
          routes: res.data.routes,
          frequencies: res.data.frequencies,
          drugDetails: Object.assign({},this.drugDetailsTemplate),
          drugRows: []
        });
      } else {
        alert("No Patient exists against this code");
      } 
    } else {
			alert("Patient Code must be a number");
		}
		
	}

  validateDrugDetails = () => {
    let {drugDetails} = this.state;
    if(drugDetails.drugId < 1 || drugDetails.drug.length < 1 ) {
      alert('Drug cannot be left blank');
      return;
    }
    if(drugDetails.frequencyId < 1 || drugDetails.frequency.length < 1 ) {
      alert('Frequency cannot be left blank');
      return;
    }
    if(drugDetails.routeId < 1 || drugDetails.route.length < 1 ) {
      alert('Route cannot be left blank');
      return;
    }
    if(drugDetails.dosage.length < 1 ) {
      alert('Dosage cannot be less than 1 or left blank');
      return;
    }
    if(drugDetails.duration.length < 1 ) {
      alert('Duration cannot be less than 1 or left blank');
      return;
    }
    this.addDrugDetails();
  }

  addDrugDetails = () => {
    let drugRows = this.state.drugRows;
    drugRows.push(Object.assign({},this.state.drugDetails));
    this.setState({
      drugRows: drugRows,
      drugDetails: Object.assign({},this.drugDetailsTemplate),
      showPrintButton:true
    });
  }

  setField = (e, keyName) => {
    let {drugDetails} = this.state;
    if(e.target.className === 'form-select') {
      drugDetails[keyName] = e.target.selectedOptions[0].text;
      drugDetails[keyName+'Id'] = e.target.value
    } else{
      drugDetails[keyName] = e.target.value;
    }
    this.setState({ drugDetails: drugDetails });
  };

  validatePrescription = () => {
    if(this.state.drugRows.length < 1 ) {
      alert('Add atleast one drug to generate prescription');
      return;
    }
    if(!this.state.patient || this.state.patient.patientcode < 1 || this.state.patient.patientname.length < 1) {
      alert('Patient Name or Id cannot cannot be left blank');
      return;
    }
    let axiosConfig = {
      headers: {
          'Content-Type': 'application/json'
      }
    };
    let prescription = {
      patientId: this.state.patient.patientcode,
      patientName: this.state.patient.patientname,
      doctor: this.state.doctor.fullname,
      drCode: this.state.doctor.usercode,
      drugDetail: this.state.drugRows,
      diagnosis: this.state.diagnosis,
      patientInstruction: this.state.patientInstruction
    }
    axios.post(REACT_APP_SERVER_URL + 'savePrescription', prescription, axiosConfig)
    .then((res) => {
      console.log("RESPONSE RECEIVED: ", res);
      const now = new Date();
      document.title = JSON.parse(res.config.data)['patientId'] + "-" + now.getUTCFullYear().toString() + "-" +(now.getUTCMonth() + 1).toString() +"-" + now.getUTCDate();
      this.setState({showPrintButton: false});
      window.print();
    })
    .catch((err) => {
      console.log("AXIOS ERROR: ", err);
    })
  }

  getAge = (dateString) => {
    var birthday = new Date(dateString);
    return ((Date.now() - birthday) / (31557600000));
  }

  setDoctor = (name) => {
    let doctors = this.state.doctorList.filter(function(dr){
      return name === dr.fullname;
    });
    this.setState({doctor: doctors[0]});
  }

  render() {
    // const dated = this.state.dated;
    const patientList = this.state.patientList;
    // const showPatientList = this.state.showPatientList;
		const {patientId, patient, doctor, drugs, routes, frequencies, drugRows, drugDetails, showPatientList, doctorList, showPrintButton} = this.state;
    const drugList = drugs ? drugs.map((drg, key) => {
      return(
        <option key={key} value={drg.drugId} title={drg.formula}>{drg.drugName}</option>
      )
    }) : null;
    const routeList = routes ? routes.map((rt, key) => {
      return(
        <option key={key} value={rt.routeId} title={rt.code}>{rt.route}</option>
      )
    }) : null;
    const frequencyList = frequencies ? frequencies.map((fr, key) => {
      return(
        <option key={key} value={fr.frequencyId}>{fr.frequency}</option>
      )
    }) : null;
    const doctorListHtml = doctorList ? doctorList.map((dr, key)=> {
      return(
        <option key={key} value={dr.fullname}>{dr.fullname}</option>
      )
    }) : null;
    const drugRowsHtml = drugRows.map((drg, key)=>{
      return(
        <tr key={key}>
          <td>{drg.drug}</td>
          <td>{drg.dosage}</td>
          <td>{drg.frequency}</td>
          <td>{drg.route}</td>
          <td>{drg.duration}</td>
          <td>{drg.instructions}</td>
        </tr>
      )
    })
    let patients = patientList ? patientList.map((pat, key) =>{
      return(
        <tr key={key}>
          <td onClick={()=> this.changePatient(pat)} className="link">{pat.patientcode}</td>
          <td>{pat.patientname}</td>
          <td>{pat.gender === 'M' ? 'Male' : 'Female'}</td>
          <td>{pat.dob}</td>
        </tr>
      )
    }) : null;

    return (
      <div className="receipt_box">
        <header>
          <div className="logo">
            <img src={process.env.PUBLIC_URL + "/logo.png"} />
          </div>
        </header>
        <hr/>
        <div className="prescription-tab">
          <section className="form_section no-print">
            {showPatientList ? <h2 className="text-center">Prescription</h2> : null}
            <input class="form-input w-auto" placeholder="Enter Patient Code" name="patientId" type="number" value={patientId} onChange={(e) => this.onInputchange}/>
            <select class="form-select select-doctor w-auto" value={doctor.fullname ? doctor.fullname: ''} onChange={(e) => this.setDoctor(e.target.value)}>
              <option disabled selected value="">Select Doctor</option>
              {doctorListHtml}
            </select>
            <button className="btn btn-primary" onClick={(e)=>this.showPrescriptionTemplate()}>Generate Prescription</button>
            { showPatientList ?
                <button className="btn btn-primary ml-10" onClick={(e)=>this.getInvoiceListByPatient(e)}>Get Prescriptions</button>
                : 
                <button className="btn btn-primary ml-10" onClick={(e)=>this.showPatientList(e)}>Show Patient List</button>
            }
          </section>
          {
            patients && showPatientList ? 
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
						!showPatientList ? 
              <>
                <section className="patient_detail">
                  <h2 className="text-center">Prescription</h2>
                  <p className="text-center mb-5"></p>
                  <div className="row">
                    <div className="col-sm-6 col-md-5">
                      <div className="row">
                        <p className="col-sm-4 col-md-4">Patient:</p>
                        <span className="col-sm-8 col-md-4">{patient.patientname}</span>
                      </div>
                      <div className="row">
                        <p className="col-sm-4 col-md-4">Doctor:</p>
                        <span className="col-sm-8 col-md-4">{doctor.fullname ? doctor.fullname : ''}</span>
                      </div>
                      <div className="row">
                        <p className="col-sm-4 col-md-4">DOB:</p>
                        <span className="col-sm-8 col-md-4">{new Date(patient.dob).toLocaleDateString("en-UK")}</span>
                      </div>
                      <div className="row">
                        <p className="col-sm-4 col-md-4">Email:</p>
-                       <span className="col-sm-8 col-md-4">{patient.email}</span>
                      </div>
                      <div className="row">
                        <p className="col-sm-4 col-md-4">Mobile No:</p>
                        <span className="col-sm-8 col-md-4">{patient.mobileno}</span>
                      </div>
                    </div>
                    <div className="col-sm-6 col-md-4">
                      <div className="row">
                        <p className="col-sm-4 col-md-4">Patient Code:</p>
                        <span className="col-sm-8 col-md-4">{patient.patientcode}</span>
                      </div>
                      <div className="row">
                        <p className="col-sm-4 col-md-4">Gender:</p>
                        <span className="col-sm-8 col-md-4">{patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Unknown'}</span>
                      </div>
                      <div className="row">
                        <p className="col-sm-4 col-md-4">Date:</p>
                        <span className="col-sm-8 col-md-4">{new Date().toLocaleDateString("en-UK")}</span>
                      </div>
                      <div className="row">
                        <p className="col-sm-4 col-md-4">Age:</p>
                        <span className="col-sm-8 col-md-4">{Math.round(this.getAge(patient.dob))}</span>
                      </div>
                    </div>
                  </div>
                </section>
                <hr/>
                <div className="container no-print">
                  <h4 className="page-title">Add Drugs</h4> 
                  <div className="row execute_container">
                    <div className="inputGroup col-md-6">
                      <label>Drug</label>                  
                      <select class="form-select" value={drugDetails.drugId > 0 ? drugDetails.drugId : 0} onChange={(e) => this.setField(e, 'drug')}>
                        <option selected value="0">Select Drug</option>
                        {drugList}
                      </select>
                    </div>
                    <div className="inputGroup col-md-3">
                      <label>Dosage</label>
                      <input
                        type="number" step="any"
                        placeholder="Quantity"
                        value={drugDetails.dosage}
                        onChange={(e) => this.setField(e, 'dosage')}
                      />
                    </div>
                    <div className="inputGroup col-md-3">
                      <label>Frequency</label>
                      <select class="form-select" value={drugDetails.frequencyId > 0 ? drugDetails.frequencyId : 0} onChange={(e) => this.setField(e, 'frequency')}>
                        <option selected>Select Frequency</option>
                        {frequencyList}
                      </select>
                    </div>
                    <div className="inputGroup col-md-3" onChange={(e) => this.setField(e, 'route')}>
                      <label>Route</label>
                      <select class="form-select" value={drugDetails.routeId > 0 ? drugDetails.routeId : 0} onChange={(e) => this.setField(e, 'route')}>
                        <option selected>Select Route</option>
                        {routeList}
                      </select>
                    </div>
                    <div className="inputGroup col-md-3">
                      <label>Duration</label>
                      <input
                        type="number" step="any"
                        value={drugDetails.duration}
                        placeholder="Days"
                        onChange={(e) => this.setField(e, 'duration')}
                      />
                    </div>
                    <div className="inputGroup col-md-6">
                      <label>Instructions</label>
                      <textarea class="form-control rounded-0" value={drugDetails.instructions} onChange={(e) => this.setField(e, 'instructions')}></textarea>
                    </div>
                    <div className="inputGroup offset-md-5 col-md-2 d-flex justify-content-center">
                    <button className="btn btn-primary ml-10" onClick={(e)=>this.validateDrugDetails()}>Add</button>
                    </div>
                  </div>
                </div>
                <section className="drug_detail mb-5">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Drug</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Route</th>
                        <th>Duration</th>
                        <th>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drugRowsHtml}
                    </tbody>
                  </table>
                </section>
                <div className="row">
                  <div className="inputGroup col-sm-4 col-md-4">
                    <label>Diagnosis</label>
                    <input
                      type="text" name="diagnosis"
                      value={this.state.diagnosis}
                      placeholder="Diagnosis"
                      onChange={this.onPrescriptionInputchange}
                    />
                  </div>
                  <div className="inputGroup col-sm-8 col-md-8">
                    <label>Patient Instructions</label>
                    <textarea class="form-control rounded-0" name="patientInstruction" value={this.state.patientInstruction} onChange={this.onPrescriptionInputchange}></textarea>
                  </div>
                </div>
                <hr/>
                <section className="payment_detail mt-5">
                  <div className="row">
                    <p className="col-sm-2 col-md-1 text-end">Provider:</p>
                    <p className="col-sm-4 col-md-3 text-start" >{doctor.fullname ? doctor.fullname : ''}</p>
                    <p className="col-sm-2 col-md-1 text-end">Licence No:</p>
                    <p className="col-sm-4 col-md-3 text-start" >{doctor.licence ? doctor.licence : ''}</p>
                  </div>
                </section>
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
                {
                  showPrintButton ? 
                  <div className="row no-print justify-content-center">
                    <div className="col-sm-2 col-md-2 d-flex justify-content-center">
                      <button type="button" className="btn btn-primary" onClick={(e)=>this.validatePrescription()}>Save & Print</button>
                    </div>
                  </div> : null
                }
              </>
						: null
					}
        </div>
      </div>
    );
  }
}
export default Prescription;