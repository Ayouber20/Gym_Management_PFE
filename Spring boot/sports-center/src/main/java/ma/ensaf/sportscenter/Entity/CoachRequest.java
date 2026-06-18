package ma.ensaf.sportscenter.Entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "coach_requests")
public class CoachRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_date")
    private LocalDate requestDate;

    private String status;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne
    @JoinColumn(name = "coach_id")
    private Coach coach;

    private String activity;

    @Column(name = "request_time")
    private LocalTime requestTime;

    @Column(name = "hidden_by_client")
    private boolean hiddenByClient = false;

    public CoachRequest() {
    }

    public Long getId() {
        return id;
    }

    public LocalDate getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDate requestDate) {
        this.requestDate = requestDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public Coach getCoach() {
        return coach;
    }

    public void setCoach(Coach coach) {
        this.coach = coach;
    }

    public String getActivity() {
        return activity;
    }

    public void setActivity(String activity) {
        this.activity = activity;
    }

    public LocalTime getRequestTime() {
        return requestTime;
    }

    public void setRequestTime(LocalTime requestTime) {
        this.requestTime = requestTime;
    }

    public boolean isHiddenByClient() {
        return hiddenByClient;
    }

    public void setHiddenByClient(boolean hiddenByClient) {
        this.hiddenByClient = hiddenByClient;
    }
}