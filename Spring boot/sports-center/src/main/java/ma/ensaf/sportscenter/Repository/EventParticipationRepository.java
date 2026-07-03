package ma.ensaf.sportscenter.Repository;

import ma.ensaf.sportscenter.Entity.EventParticipation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EventParticipationRepository extends JpaRepository<EventParticipation, Long> {

    boolean existsByEventIdAndParticipantRoleAndParticipantId(
            Long eventId,
            String participantRole,
            Long participantId
    );

    Optional<EventParticipation> findByEventIdAndParticipantRoleAndParticipantId(
            Long eventId,
            String participantRole,
            Long participantId
    );

    long countByEventId(Long eventId);
}