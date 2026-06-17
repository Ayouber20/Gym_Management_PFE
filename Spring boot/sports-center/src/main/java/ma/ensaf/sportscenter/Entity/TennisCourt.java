package ma.ensaf.sportscenter.Entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "tennis_courts")
public class TennisCourt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "court_number")
    private Integer courtNumber;

    private String status;

    @Column(name = "maintenance_start_date")
    private LocalDate maintenanceStartDate;

    @Column(name = "maintenance_end_date")
    private LocalDate maintenanceEndDate;

    public TennisCourt() {
    }

    public Long getId() {
        return id;
    }

    public Integer getCourtNumber() {
        return courtNumber;
    }

    public void setCourtNumber(Integer courtNumber) {
        this.courtNumber = courtNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getMaintenanceStartDate() {
        return maintenanceStartDate;
    }

    public void setMaintenanceStartDate(LocalDate maintenanceStartDate) {
        this.maintenanceStartDate = maintenanceStartDate;
    }

    public LocalDate getMaintenanceEndDate() {
        return maintenanceEndDate;
    }

    public void setMaintenanceEndDate(LocalDate maintenanceEndDate) {
        this.maintenanceEndDate = maintenanceEndDate;
    }
}