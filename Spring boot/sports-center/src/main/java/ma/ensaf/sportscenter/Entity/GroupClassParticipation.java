package ma.ensaf.sportscenter.Entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "group_class_participations")
public class GroupClassParticipation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "group_class_id")
    private GroupClass groupClass;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @Column(name = "participation_date")
    private LocalDate participationDate;

    public GroupClassParticipation() {
    }

    public Long getId() {
        return id;
    }

    public GroupClass getGroupClass() {
        return groupClass;
    }

    public void setGroupClass(GroupClass groupClass) {
        this.groupClass = groupClass;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public LocalDate getParticipationDate() {
        return participationDate;
    }

    public void setParticipationDate(LocalDate participationDate) {
        this.participationDate = participationDate;
    }
}