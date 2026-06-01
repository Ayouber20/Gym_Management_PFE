package ma.ensaf.sportscenter.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tennis_courts")
public class TennisCourt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "court_number")
    private Integer courtNumber;

    private String status;

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
}