
package com.mechaels.invoice.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class PatientService {

    @Autowired
    JdbcTemplate jdbcTemplate;

    public List<Map<String, Object>> getLatestPatients(final Integer patientsPerPage) {
        final String sql = "select DISTINCT Top " + patientsPerPage
                + " t.patientcode, p.forename + ' ' + p.surname as patientname, "
                + "p.sex as gender, convert(varchar(10), p.dob, 101) as dob, MAX(t.date) as transactiondate "
                + "from sys2000.dbo.transactions t "
                + "join sys2000.dbo.patients p on t.patientcode = p.patientcode "
                + "group by t.patientcode, p.Forename, p.Surname, p.sex, p.dob order by MAX(t.date) desc";
        System.out.println("Patient ids sql : " + sql);
        return jdbcTemplate.queryForList(sql);
    }

}
