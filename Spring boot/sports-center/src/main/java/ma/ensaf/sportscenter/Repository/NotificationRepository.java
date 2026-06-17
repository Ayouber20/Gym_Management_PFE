package ma.ensaf.sportscenter.Repository;

import ma.ensaf.sportscenter.Entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByTargetRoleAndTargetIdOrderByCreatedAtDesc(
            String targetRole,
            Long targetId
    );

    List<Notification> findByTargetRoleOrderByCreatedAtDesc(
            String targetRole
    );
}