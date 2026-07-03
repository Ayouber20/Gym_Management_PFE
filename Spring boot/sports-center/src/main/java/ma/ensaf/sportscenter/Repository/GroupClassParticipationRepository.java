package ma.ensaf.sportscenter.Repository;

import ma.ensaf.sportscenter.Entity.GroupClassParticipation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GroupClassParticipationRepository extends JpaRepository<GroupClassParticipation, Long> {

    boolean existsByGroupClassIdAndClientId(Long groupClassId, Long clientId);

    long countByGroupClassId(Long groupClassId);

    Optional<GroupClassParticipation> findByGroupClassIdAndClientId(
            Long groupClassId,
            Long clientId
    );
}