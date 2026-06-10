package ma.ensaf.sportscenter.Repository;

import ma.ensaf.sportscenter.Entity.CoachRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CoachRequestRepository
        extends JpaRepository<CoachRequest, Long> {
    List<CoachRequest> findByClientId(Long clientId);
}