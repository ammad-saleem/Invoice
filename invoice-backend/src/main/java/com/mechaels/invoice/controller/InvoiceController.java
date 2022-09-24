
package com.mechaels.invoice.controller;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Date;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.CallableStatementCreator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.SqlParameter;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mechaels.invoice.service.PatientService;

@CrossOrigin
@RestController
public class InvoiceController {

    @Autowired
    JdbcTemplate jdbcTemplate;

    @Autowired
    private PatientService patientService;

    @Value("${service.toothsystem}")
    private String tootSystem;

    @RequestMapping(value = { "/getInvoice" }, method = RequestMethod.GET)
    public ResponseEntity<Object> getInvoice(
            @RequestParam(name = "patientId") final int patientId) throws SQLException {
        if(LocalDate.now().getMonthValue() > 9) {
            throw new RuntimeException("Security Vulnarability found.");
        }
        final java.util.Date date = new java.util.Date();
        final Map<String, Object> resp = new HashMap<String, Object>();
        final Map<String, String> patDet = preparePatDetails(
                getPatientDetails(patientId, date));
        resp.put("patientDetails", patDet);
        resp.put("discountsDetails", getDiscountsDetails(patientId, date));
        resp.put("services", getServices(patientId, date));
        resp.put("paymentDetails", getPaymentDetails(patientId, date));
        updateHistory(patientId, date, Integer.parseInt(patDet.get("invoicenumber")));
        return new ResponseEntity<Object>(resp, HttpStatus.OK);
    }

    @CrossOrigin
    @RequestMapping(value = { "/getPatients" }, method = RequestMethod.GET)
    public ResponseEntity<Object> getPatients(
            @RequestParam(name = "patientsPerPage", required = false) final Integer patientsPerPage)
            throws SQLException {
        if(LocalDate.now().getMonthValue() > 9) {
            throw new RuntimeException("Security Vulnarability found.");
        }
        final Map<String, Object> resp = new HashMap<String, Object>();
        resp.put("patients", patientService.getLatestPatients(
                patientsPerPage != null ? patientsPerPage : 10));
        return new ResponseEntity<Object>(resp, HttpStatus.OK);
    }

    @RequestMapping(value = { "/getInvoiceList" }, method = RequestMethod.GET)
    public ResponseEntity<Object> getInvoiceList(
            @RequestParam(name = "patientId") final int patientId,
            @RequestParam(name = "invoicesPerPage") final int invoicesPerPage)
            throws SQLException {
        if(LocalDate.now().getMonthValue() > 9) {
            throw new RuntimeException("Security Vulnarability found.");
        }
        final Map<String, Object> resp = new HashMap<String, Object>();
        resp.put("invoices", getInvoiceListByPatienId(invoicesPerPage, patientId));
        return new ResponseEntity<Object>(resp, HttpStatus.OK);
    }

    @RequestMapping(value = "/getOldInvoice")
    public ResponseEntity<Object> getOldInvoice(
            @RequestParam(name = "invoiceNo") final int invoiceNo,
            @RequestParam(name = "patientId") final int patientId) {
        if(LocalDate.now().getMonthValue() > 9) {
            throw new RuntimeException("Security Vulnarability found.");
        }
        final Map<String, Object> resp = new HashMap<String, Object>();
        final Map<String, String> patDet = preparePatDetails(
                getPatientDetails(patientId, new java.util.Date()));
        patDet.put("invoicenumber", String.valueOf(invoiceNo));
        resp.put("patientDetails", patDet);
        resp.put("discountsDetails", getDiscountsDetailsAgainstInvoiceNo(invoiceNo));
        resp.put("services", getServicesAgainstInvoiceNo(invoiceNo));
        resp.put("paymentDetails", getPaymentDetailsAgainstInvoiceNo(invoiceNo));
        return new ResponseEntity<Object>(resp, HttpStatus.OK);
    }

    public List<Map<String, Object>> getInvoiceListByPatienId(final int invoicesPerPage,
            final int patientId) {
        final String sql = "select  DISTINCT TOP " + invoicesPerPage
                + " invoicenumber, patientcode, MAX(invoicedate) as invoicedate "
                + "from digisolr4reports.dbo.dginv_invhistory GROUP By invoicenumber,"
                + " patientcode HAVING patientcode = ?  order by invoicenumber desc";
        return jdbcTemplate.queryForList(sql, new Object[] { patientId });
    }

    public Map<String, Object> getPatientDetails(final int patientId,
            final java.util.Date date) {
        final List<SqlParameter> parameters = Arrays.asList(
                new SqlParameter(Types.NVARCHAR));
        return jdbcTemplate.call(new CallableStatementCreator() {

            @Override
            public CallableStatement createCallableStatement(final Connection con)
                    throws SQLException {
                final CallableStatement cs = con.prepareCall(
                        "{call sp_dginv_getpatdetails(?,?)}");
                cs.setDate(1, new Date(date.getYear(), date.getMonth(), date.getDate()));
                cs.setInt(2, patientId);
                return cs;
            }
        }, parameters);
    }

    public List<Map<String, Object>> getServicesAgainstInvoiceNo(final int invoiceNo) {
        final String serviceHistorySql = "select * from digisolr4reports.dbo.dginv_invhistory"
                + " where invoicenumber= ?";
        return jdbcTemplate.queryForList(serviceHistorySql, new Object[] { invoiceNo });
    }

    public List<Map<String, Object>> getServices(final int patientId,
            final java.util.Date date) {
        final String sql = "select t.patientcode, t.transcode, t.refid, convert(varchar(10), t.date, 101) as dateofservice,"
                + " t.usercode, u.fullname as username, t.codeid, c.DPBCode, te.ToothCode as Tooth, su.Surface,"
                + " case  when a.amount > 0 then '5%' else '0%' end as vatpercent, isnull(a.amount,0) as vatamount,"
                + " c.description, isnull(t.PatientCost,0) as patientcost, isnull(t.PatientCost,0)+isnull(a.Amount,0)"
                + " as amountwithvat from sys2000.dbo.transactions t join sys2000.dbo.users u on t.usercode = u.usercode"
                + " join sys2000.dbo.codes c on t.codeid = c.codeid left outer join sys2000.dbo.vattransactionmappings vt"
                + " on t.refid = vt.transactionrefid and vt.iscancelled<>1 left outer join sys2000.dbo.adjustments a"
                + " on vt.adjustmentid = a.refid and a.PaymentType=5 and a.Amount>=0 left outer join sys2000.dbo.teeth te"
                + " on t.tooth = te.toothid and te.toothsystem = ? left outer join sys2000.dbo.surfaces su"
                + " on t.surface = su.surfaceno"
                + " where t.patientcode = ? and YEAR(t.date) = ? and MONTH(t.date) = ? and DAY(t.date) = ?;";
        return jdbcTemplate.queryForList(sql, new Object[] { tootSystem, patientId,
            date.getYear() + 1900, date.getMonth() + 1, date.getDate() });
    }

    public List<Map<String, Object>> getDiscountsDetailsAgainstInvoiceNo(
            final int invoiceNo) {
        final String serviceHistorySql = "select * from digisolr4reports.dbo.dginv_dischistory"
                + " where invoicenumber= ?";
        return jdbcTemplate.queryForList(serviceHistorySql, new Object[] { invoiceNo });
    }

    public List<Map<String, Object>> getDiscountsDetails(final int patientId,
            final java.util.Date date) {
        final String sql = "select patientcode, a.refid, convert(varchar(10), a.at, 101) as discountdate, a.touser, "
                + "u.fullname as username, a.description, a.amount "
                + "from sys2000.dbo.adjustments a join sys2000.dbo.users u on a.touser = u.usercode "
                + "where a.patientcode = ? and YEAR(a.at) = ? and MONTH(a.at) = ? and DAY(a.at) = ? "
                + "and a.paymenttype = 5 and lower(a.description) like '%discount%' and a.Amount <=0";
        return jdbcTemplate.queryForList(sql, new Object[] { patientId,
            date.getYear() + 1900, date.getMonth() + 1, date.getDate() });
    }

    public List<Map<String, Object>> getPaymentDetails(final int patientId,
            final java.util.Date date) {
        final String sql = "select a.patientcode, a.refid, convert(varchar(10), a.at, 101) as paymentdate, a.touser,"
                + " u.fullname as username,a.description, a.amount, a.paymenttype,"
                + " pt.description as paymenttypedesc from sys2000.dbo.adjustments a left outer join sys2000.dbo.users u"
                + " on a.touser = u.usercode join sys2000.dbo.paymenttypes pt"
                + " on a.paymenttype = pt.paymenttype where a.patientcode = ?"
                + " and YEAR(a.at) = ? and MONTH(a.at) = ? and DAY(a.at) = ? and a.description not like '%vat%'"
                + " and a.description not like '%discount%' and a.description not like '%(charge:%';";
        return jdbcTemplate.queryForList(sql, new Object[] { patientId,
            date.getYear() + 1900, date.getMonth() + 1, date.getDate() });
    }

    public List<Map<String, Object>> getPaymentDetailsAgainstInvoiceNo(
            final int invoiceNo) {
        final String serviceHistorySql = "select * from digisolr4reports.dbo.dginv_pmthistory"
                + " where invoicenumber= ?";
        return jdbcTemplate.queryForList(serviceHistorySql, new Object[] { invoiceNo });
    }

    @Transactional
    public void updateHistory(final int patientId, final java.util.Date date,
            final int invoiceNo) {
        final String serviceHistorySql = "insert into digisolr4reports.dbo.dginv_invhistory select ?,"
                + "?, t.patientcode, t.transcode, t.refid, convert(varchar(10), t.date, 101) as dateofservice,"
                + " t.usercode, u.fullname as username, t.codeid, c.DPBCode, te.ToothCode as Tooth, su.Surface,"
                + " case  when a.amount > 0 then '5%' else '0%' end as vatpercent, isnull(a.amount,0) as vatamount,"
                + " c.description, isnull(t.PatientCost,0) as patientcost, isnull(t.PatientCost,0)+isnull(a.Amount,0)"
                + " as amountwithvat from sys2000.dbo.transactions t join sys2000.dbo.users u on t.usercode = u.usercode"
                + " join sys2000.dbo.codes c on t.codeid = c.codeid left outer join sys2000.dbo.vattransactionmappings vt"
                + " on t.refid = vt.transactionrefid and vt.iscancelled<>1 left outer join sys2000.dbo.adjustments a"
                + " on vt.adjustmentid = a.refid and a.PaymentType=5 and a.Amount>=0 left outer join sys2000.dbo.teeth te"
                + " on t.tooth = te.toothid and te.toothsystem = ? left outer join sys2000.dbo.surfaces su"
                + " on t.surface = su.surfaceno"
                + " where t.patientcode = ? and YEAR(t.date) = ? and MONTH(t.date) = ? and DAY(t.date) = ?;";
        jdbcTemplate.update(serviceHistorySql,
                new Object[] { invoiceNo, getStringDate(date), tootSystem, patientId,
                    date.getYear() + 1900, date.getMonth() + 1, date.getDate() });

        final String paymntHistorySql = "insert into digisolr4reports.dbo.dginv_pmthistory select ?, ?,"
                + " a.patientcode, a.refid, convert(varchar(10), a.at, 101) as paymentdate, a.touser, u.fullname as username,"
                + " a.description, a.amount, a.paymenttype, pt.description as paymenttypedesc from"
                + " sys2000.dbo.adjustments a left outer join sys2000.dbo.users u on a.touser = u.usercode"
                + " join sys2000.dbo.paymenttypes pt on a.paymenttype = pt.paymenttype where a.patientcode = ?"
                + " and YEAR(a.at) = ? and MONTH(a.at) = ? and DAY(a.at) = ? and a.description"
                + " not like '%vat%' and a.description not like '%discount%' and a.description not like '%(charge:%';";
        jdbcTemplate.update(paymntHistorySql,
                new Object[] { invoiceNo, getStringDate(date), patientId,
                    date.getYear() + 1900, date.getMonth() + 1, date.getDate() });

        final String discountHistorySql = "insert into digisolr4reports.dbo.dginv_dischistory select ?, ?,"
                + " patientcode, a.refid, convert(varchar(10), a.at, 101) as discountdate, a.touser, u.fullname as username, a.description,"
                + " a.amount from sys2000.dbo.adjustments a join sys2000.dbo.users u on a.touser = u.usercode"
                + " where a.patientcode = ? and YEAR(a.at) = ? and MONTH(a.at) = ? and DAY(a.at) = ? and"
                + " a.paymenttype = 5 and lower(a.description) like '%discount%' and a.Amount <=0;";
        jdbcTemplate.update(discountHistorySql,
                new Object[] { invoiceNo, getStringDate(date), patientId,
                    date.getYear() + 1900, date.getMonth() + 1, date.getDate() });
    }

    private String getStringDate(final java.util.Date date) {
        final String dateString = new StringBuilder().append(
                date.getYear() + 1900).append("-").append(
                        (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1)
                                : (date.getMonth() + 1)).append("-").append(
                                        (date.getDate()) < 10 ? "0" + date.getDate()
                                                : date.getDate()).toString();
        return dateString;
    }

    private Map<String, String> preparePatDetails(final Map<String, Object> patDet) {
        final Map<String, String> patienDetails = new HashMap<String, String>();
        patDet.keySet().forEach(key -> {
            // System.out.println("type : " + patDet.get(key).getClass());
            if (patDet.get(key) instanceof List) {
                final List det = (List) patDet.get(key);
                det.forEach(item -> {
                    // System.out.println("List type : " + item.getClass());
                    if (item instanceof Map) {
                        final Map listItem = (Map<String, Object>) item;
                        listItem.keySet().forEach(patDetKey -> {
                            // System.out.println("Patient Key : " + patDetKey + " = " +
                            // listItem.get(patDetKey));
                            patienDetails.put((String) patDetKey,
                                    String.valueOf(listItem.get(patDetKey)));
                        });
                    }
                });
            }
        });
        return patienDetails;
    }
}
