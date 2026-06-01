package ma.ensaf.sportscenter.Repository;

import ma.ensaf.sportscenter.Entity.Coach;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoachRepository extends JpaRepository<Coach, Long> {
}
