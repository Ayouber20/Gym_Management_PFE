package ma.ensaf.sportscenter.Service;

import ma.ensaf.sportscenter.Entity.Notification;
import ma.ensaf.sportscenter.Repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification createClientNotification(
            Long clientId,
            String type,
            String message,
            LocalDate date,
            LocalTime time
    ) {
        Notification notification = new Notification(
                "CLIENT",
                clientId,
                type,
                message,
                date,
                time
        );

        return notificationRepository.save(notification);
    }

    public Notification createCoachNotification(
            Long coachId,
            String type,
            String message,
            LocalDate date,
            LocalTime time
    ) {
        Notification notification = new Notification(
                "COACH",
                coachId,
                type,
                message,
                date,
                time
        );

        return notificationRepository.save(notification);
    }

    public Notification createAdminNotification(
            String type,
            String message,
            LocalDate date,
            LocalTime time
    ) {
        Notification notification = new Notification(
                "ADMIN",
                null,
                type,
                message,
                date,
                time
        );

        return notificationRepository.save(notification);
    }

    public List<Notification> getClientNotifications(Long clientId) {
        return notificationRepository.findByTargetRoleAndTargetIdOrderByCreatedAtDesc(
                "CLIENT",
                clientId
        );
    }

    public List<Notification> getCoachNotifications(Long coachId) {
        return notificationRepository.findByTargetRoleAndTargetIdOrderByCreatedAtDesc(
                "COACH",
                coachId
        );
    }

    public List<Notification> getAdminNotifications() {
        return notificationRepository.findByTargetRoleOrderByCreatedAtDesc("ADMIN");
    }
}