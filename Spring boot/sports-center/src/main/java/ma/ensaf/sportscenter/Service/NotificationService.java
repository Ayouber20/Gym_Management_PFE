package ma.ensaf.sportscenter.Service;

import ma.ensaf.sportscenter.Entity.Notification;
import ma.ensaf.sportscenter.Entity.CoachRequest;
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
            LocalTime time) {

        Notification notification = new Notification(
                "CLIENT",
                clientId,
                type,
                message,
                date,
                time
        );

        notification.setReadStatus(false);

        return notificationRepository.save(notification);
    }

    public Notification createCoachNotification(
            Long coachId,
            String type,
            String message,
            LocalDate date,
            LocalTime time) {

        Notification notification = new Notification(
                "COACH",
                coachId,
                type,
                message,
                date,
                time
        );

        notification.setReadStatus(false);

        return notificationRepository.save(notification);
    }

    public Notification createAdminNotification(
            String type,
            String message,
            LocalDate date,
            LocalTime time) {

        Notification notification = new Notification(
                "ADMIN",
                null,
                type,
                message,
                date,
                time
        );

        notification.setReadStatus(false);

        return notificationRepository.save(notification);
    }

    public List<Notification> getClientNotifications(Long clientId) {
        return notificationRepository
                .findByTargetRoleAndTargetIdAndReadStatusFalseOrderByCreatedAtDesc(
                        "CLIENT",
                        clientId
                );
    }

    public List<Notification> getCoachNotifications(Long coachId) {
        return notificationRepository
                .findByTargetRoleAndTargetIdAndReadStatusFalseOrderByCreatedAtDesc(
                        "COACH",
                        coachId
                );
    }

    public List<Notification> getAdminNotifications() {
        return notificationRepository
                .findByTargetRoleAndReadStatusFalseOrderByCreatedAtDesc("ADMIN");
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Notification introuvable."));

        notification.setReadStatus(true);

        return notificationRepository.save(notification);
    }

    public void createCoachRequestAcceptedNotification(CoachRequest request) {

        String message =
                "Votre demande de coach avec "
                        + request.getCoach().getUser().getFirstName()
                        + " "
                        + request.getCoach().getUser().getLastName()
                        + " pour l'activité "
                        + request.getActivity()
                        + " le "
                        + request.getRequestDate()
                        + " à "
                        + request.getRequestTime()
                        + " a été acceptée.";

        Notification notification = new Notification(
                "CLIENT",
                request.getClient().getId(),
                "COACH_REQUEST_ACCEPTED",
                message,
                request.getRequestDate(),
                request.getRequestTime()
        );

        notificationRepository.save(notification);
    }

    public void createCoachRequestRejectedNotification(CoachRequest request) {

        String message =
                "Votre demande de coach avec "
                        + request.getCoach().getUser().getFirstName()
                        + " "
                        + request.getCoach().getUser().getLastName()
                        + " pour l'activité "
                        + request.getActivity()
                        + " le "
                        + request.getRequestDate()
                        + " à "
                        + request.getRequestTime()
                        + " a été refusée.";

        Notification notification = new Notification(
                "CLIENT",
                request.getClient().getId(),
                "COACH_REQUEST_REJECTED",
                message,
                request.getRequestDate(),
                request.getRequestTime()
        );

        notificationRepository.save(notification);
    }

    public void createNewCoachRequestNotification(CoachRequest request) {

        String message =
                "Vous avez reçu une nouvelle demande de coaching pour l'activité "
                        + request.getActivity()
                        + " le "
                        + request.getRequestDate()
                        + " à "
                        + request.getRequestTime()
                        + ".";

        Notification notification = new Notification(
                "COACH",
                request.getCoach().getId(),
                "COACH_REQUEST",
                message,
                request.getRequestDate(),
                request.getRequestTime()
        );

        notificationRepository.save(notification);
    }
}