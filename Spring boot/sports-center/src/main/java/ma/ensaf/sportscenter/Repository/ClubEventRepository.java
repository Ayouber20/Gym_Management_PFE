package ma.ensaf.sportscenter.Repository;

import ma.ensaf.sportscenter.Entity.ClubEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClubEventRepository extends JpaRepository<ClubEvent, Long> {

    List<ClubEvent> findAllByOrderByEventDateDescEventTimeDesc();

    List<ClubEvent> findByStatusAndTargetAudienceInOrderByEventDateAscEventTimeAsc(
            String status,
            List<String> targetAudiences
    );
}