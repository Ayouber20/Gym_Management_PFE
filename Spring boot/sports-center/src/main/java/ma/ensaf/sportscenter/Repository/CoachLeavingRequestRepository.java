package ma.ensaf.sportscenter.Repository;

import ma.ensaf.sportscenter.Entity.CoachLeavingRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CoachLeavingRequestRepository
        extends JpaRepository<CoachLeavingRequest, Long> {

    List<CoachLeavingRequest> findByCoachId(Long coachId);

    List<CoachLeavingRequest> findByStatus(String status);
}