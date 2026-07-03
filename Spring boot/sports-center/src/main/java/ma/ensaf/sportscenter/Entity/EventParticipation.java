package ma.ensaf.sportscenter.Entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "event_participations")
public class EventParticipation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private ClubEvent event;

    @Column(name = "participant_role")
    private String participantRole;

    @Column(name = "participant_id")
    private Long participantId;

    @Column(name = "participation_date")
    private LocalDate participationDate;

    public EventParticipation() {
    }

    public Long getId() {
        return id;
    }

    public ClubEvent getEvent() {
        return event;
    }

    public void setEvent(ClubEvent event) {
        this.event = event;
    }

    public String getParticipantRole() {
        return participantRole;
    }

    public void setParticipantRole(String participantRole) {
        this.participantRole = participantRole;
    }

    public Long getParticipantId() {
        return participantId;
    }

    public void setParticipantId(Long participantId) {
        this.participantId = participantId;
    }

    public LocalDate getParticipationDate() {
        return participationDate;
    }

    public void setParticipationDate(LocalDate participationDate) {
        this.participationDate = participationDate;
    }
}