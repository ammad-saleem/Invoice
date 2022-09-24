
package com.mechaels.invoice.modal;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

public class Prescription implements Serializable {

    /**
     * 
     */
    private static final long serialVersionUID = 6556395136476796751L;

    private int id;

    private int patientId;

    private String patientName;

    private String doctor;

    private int drCode;

    private Date createdOn;

    private List<DrugDetail> drugDetail;

    private String diagnosis;

    private String patientInstruction;

    public int getId() {
        return id;
    }

    public void setId(final int prescriptionId) {
        this.id = prescriptionId;
    }

    public int getPatientId() {
        return patientId;
    }

    public void setPatientId(final int patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(final String patientName) {
        this.patientName = patientName;
    }

    public List<DrugDetail> getDrugDetail() {
        return drugDetail;
    }

    public void setDrugDetail(final List<DrugDetail> drugDetail) {
        this.drugDetail = drugDetail;
    }

    public Date getCreatedOn() {
        return createdOn;
    }

    public void setCreatedOn(final Date createdOn) {
        this.createdOn = createdOn;
    }

    public String getDoctor() {
        return doctor;
    }

    public void setDoctor(final String doctor) {
        this.doctor = doctor;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(final String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getPatientInstruction() {
        return patientInstruction;
    }

    public void setPatientInstruction(final String patientInstruction) {
        this.patientInstruction = patientInstruction;
    }

    public int getDrCode() {
        return drCode;
    }

    public void setDrCode(final int drCode) {
        this.drCode = drCode;
    }

}
