package ma.ensaf.sportscenter.Repository;

import ma.ensaf.sportscenter.Entity.TennisCourt;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TennisCourtRepository extends JpaRepository<TennisCourt, Long> {
}