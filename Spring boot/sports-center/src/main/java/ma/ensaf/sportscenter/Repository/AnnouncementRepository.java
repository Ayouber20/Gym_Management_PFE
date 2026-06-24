package ma.ensaf.sportscenter.Repository;

import ma.ensaf.sportscenter.Entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findByActiveTrueOrderByCreatedAtDesc();

    List<Announcement> findByActiveTrueAndTargetAudienceInOrderByCreatedAtDesc(
            List<String> targetAudiences
    );
}