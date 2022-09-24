
package com.mechaels.invoice.modal;

import java.io.Serializable;

public class DrugDetail implements Serializable {

    /**
     * 
     */
    private static final long serialVersionUID = -3366642674058955418L;

    private int drugId;

    private String drug;

    private int dosage;

    private int frequencyId;

    private String frequency;

    private int routeId;

    private String route;

    private int duration;

    private String instructions;

    public int getDrugId() {
        return drugId;
    }

    public void setDrugId(final int drugId) {
        this.drugId = drugId;
    }

    public String getDrug() {
        return drug;
    }

    public void setDrug(final String drug) {
        this.drug = drug;
    }

    public int getDosage() {
        return dosage;
    }

    public void setDosage(final int dosage) {
        this.dosage = dosage;
    }

    public int getFrequencyId() {
        return frequencyId;
    }

    public void setFrequencyId(final int frequencyId) {
        this.frequencyId = frequencyId;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(final String frequency) {
        this.frequency = frequency;
    }

    public int getRouteId() {
        return routeId;
    }

    public void setRouteId(final int routeId) {
        this.routeId = routeId;
    }

    public String getRoute() {
        return route;
    }

    public void setRoute(final String route) {
        this.route = route;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(final int duration) {
        this.duration = duration;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(final String instructions) {
        this.instructions = instructions;
    }
}
