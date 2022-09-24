
package com.mechaels.invoice.controller;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mechaels.invoice.modal.DrugDetail;
import com.mechaels.invoice.modal.Prescription;
import com.mechaels.invoice.service.PatientService;

@CrossOrigin
@RestController
public class PrescriptionController {

    @Autowired
    JdbcTemplate jdbcTemplate;

    @Value("${prescription.database.name}")
    private String prescriptionDBName;

    @Autowired
    private PatientService patientService;

    @CrossOrigin
    @RequestMapping(value = { "/getPatientsAndDoctors" }, method = RequestMethod.GET)
    public ResponseEntity<Object> getPatients(
            @RequestParam(name = "patientsPerPage", required = false) final Integer patientsPerPage)
            throws SQLException {
        final Map<String, Object> resp = new HashMap<String, Object>();
        resp.put("patients", patientService.getLatestPatients(
                patientsPerPage != null ? patientsPerPage : 10));
        resp.put("doctors", getDoctors());

        return new ResponseEntity<Object>(resp, HttpStatus.OK);
    }

    @RequestMapping(value = { "/getPrescriptionDetails" }, method = RequestMethod.GET)
    public ResponseEntity<Object> getInvoice(
            @RequestParam(name = "patientId") final int patientId) throws SQLException {
        if (patientId < 1) {
            return new ResponseEntity<Object>("patient Id cannot be less than 1",
                    HttpStatus.BAD_REQUEST);
        }

        final Map<String, Object> resp = new HashMap<String, Object>();
        resp.put("patientDetails", getPatientById(patientId));
        resp.put("drugs", getDrugs());
        resp.put("frequencies", getFrequencies());
        resp.put("routes", getRoutes());
        return new ResponseEntity<Object>(resp, HttpStatus.OK);
    }

    @CrossOrigin
    @PostMapping(path = "/savePrescription")
    public ResponseEntity<?> postPrescription(
            @RequestBody final Prescription prescription) {
        if (prescription == null) {
            return new ResponseEntity<Object>("Response Body is empty",
                    HttpStatus.BAD_REQUEST);
        }
        if (prescription.getDoctor() == null || prescription.getDoctor().trim().equals("")
                || prescription.getPatientId() < 1) {
            return new ResponseEntity<Object>("Doctor cannot be left blank",
                    HttpStatus.BAD_REQUEST);
        }
        if (prescription.getPatientName() == null
                || prescription.getPatientName().trim().equals("")
                || prescription.getPatientId() < 1) {
            return new ResponseEntity<Object>("Patient Name or Id cannot be left blank",
                    HttpStatus.BAD_REQUEST);
        }
        if (prescription.getDrugDetail().size() < 1) {
            return new ResponseEntity<Object>("Drug details cannot be left blank",
                    HttpStatus.BAD_REQUEST);
        }
        final KeyHolder key = new GeneratedKeyHolder();
        final int isAdded = jdbcTemplate.update(new PreparedStatementCreator() {

            @Override
            public PreparedStatement createPreparedStatement(final Connection connection)
                    throws SQLException {
                final PreparedStatement ps = connection.prepareStatement("insert into "
                        + prescriptionDBName
                        + ".dbo.Prescription (PATIENT_ID, PATIENT_NAME, DOCTOR, DIAGNOSIS, PATIENT_INSTRUCTION, DRCODE, CREATED_ON) VALUES (?, ?, ?, ?, ?, ?, getdate())",
                        Statement.RETURN_GENERATED_KEYS);
                ps.setInt(1, prescription.getPatientId());
                ps.setString(2, prescription.getPatientName());
                ps.setString(3, prescription.getDoctor());
                ps.setString(4, prescription.getDiagnosis());
                ps.setString(5, prescription.getPatientInstruction());
                ps.setInt(6, prescription.getDrCode());
                return ps;
            }
        }, key);
        if (isAdded > 0) {
            final int drugCount = addPrescriptionDetails(prescription,
                    key.getKey().intValue());
            if (drugCount > 0) {
                return new ResponseEntity<Object>("Prescription saved sucessfully",
                        HttpStatus.OK);
            }
        }
        return new ResponseEntity<Object>("Could not save prescription",
                HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public List<Map<String, Object>> getPatientById(final int id) {
        final String sql = "select patientcode, forename + ' ' + surname as patientname, sex as gender, "
                + " dob, mobileno, email from sys2000.dbo.patients where patientcode = "
                + id;
        System.out.println("Patient ids sql : " + sql);
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> getDrugs() {
        final String sql = "select id as drugId, name as drugName, formula from "
                + prescriptionDBName + ".dbo.drugs where enabled = 1 order by name";
        System.out.println("Getting All drugs sql : " + sql);
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> getFrequencies() {
        final String sql = "select id as frequencyId, frequency from "
                + prescriptionDBName + ".dbo.frequency";
        System.out.println("Getting All frequencies sql : " + sql);
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> getRoutes() {
        final String sql = "select id as routeId, route, code from " + prescriptionDBName
                + ".dbo.route where enabled = 1 order by route";
        System.out.println("Getting All routes sql : " + sql);
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> getDoctors() {
        final String sql = "select usercode, case when charindex('License',FullName) > 1 "
                + "then substring(fullname,0,charindex('License',fullname)) else FullName end"
                + " as fullname, case when charindex('License',FullName) > 1 then"
                + " substring(fullname,charindex('License ',fullname)+8,LEN(fullname)) else ''"
                + " end as License from sys2000.dbo.users where \"CURRENT\" = 1 and Title like 'Dr%'";
        System.out.println("Getting All doctors sql : " + sql);
        return jdbcTemplate.queryForList(sql);
    }

    private int addPrescriptionDetails(final Prescription pres, final int presId) {
        final StringBuilder savePrescriptionSql = new StringBuilder(
                "insert into ").append(prescriptionDBName).append(
                        ".dbo.PrescriptionDetail (PRESCRIPTION_ID, DOSAGE, DRUG, DRUG_ID, DURATION, FREQUENCY, FREQUENCY_ID, ROUTE, ROUTE_ID, INSTRUCTIONS) VALUES ");
        for (int i = 0; i < pres.getDrugDetail().size(); i++) {
            if (i > 0) {
                savePrescriptionSql.append(",");
            }
            final DrugDetail det = pres.getDrugDetail().get(i);
            final StringBuilder singleValue = new StringBuilder("(").append(
                    String.valueOf(presId)).append(",").append(String.valueOf(
                            det.getDosage())).append(",").append("'").append(
                                    det.getDrug()).append("',").append(String.valueOf(
                                            det.getDrugId())).append(",").append(
                                                    String.valueOf(
                                                            det.getDuration())).append(
                                                                    ",").append(
                                                                            "'").append(
                                                                                    det.getFrequency()).append(
                                                                                            "',").append(
                                                                                                    String.valueOf(
                                                                                                            det.getFrequencyId())).append(
                                                                                                                    ",").append(
                                                                                                                            "'").append(
                                                                                                                                    det.getRoute()).append(
                                                                                                                                            "',").append(
                                                                                                                                                    String.valueOf(
                                                                                                                                                            det.getRouteId())).append(
                                                                                                                                                                    ",").append(
                                                                                                                                                                            "'").append(
                                                                                                                                                                                    det.getInstructions()).append(
                                                                                                                                                                                            "')");
            savePrescriptionSql.append(singleValue.toString());

        }
        return jdbcTemplate.update(savePrescriptionSql.toString());
    }

}
