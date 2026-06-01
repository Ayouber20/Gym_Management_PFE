package ma.ensaf.sportscenter.Repository;

import ma.ensaf.sportscenter.Entity.CoachRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoachRequestRepository
        extends JpaRepository<CoachRequest, Long> {
}