package ma.ensaf.sportscenter.Controller;

import ma.ensaf.sportscenter.Dto.NotificationDTO;
import ma.ensaf.sportscenter.Entity.CoachRequest;
import ma.ensaf.sportscenter.Entity.Notification;
import ma.ensaf.sportscenter.Entity.Reservation;
import ma.ensaf.sportscenter.Repository.CoachRequestRepository;
import ma.ensaf.sportscenter.Repository.ReservationRepository;
import ma.ensaf.sportscenter.Service.NotificationService;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:4200")
public class NotificationController {

    private final ReservationRepository reservationRepository;
    private final CoachRequestRepository coachRequestRepository;
    private final NotificationService notificationService;

    public NotificationController(
            ReservationRepository reservationRepository,
            CoachRequestRepository coachRequestRepository,
            NotificationService notificationService
    ) {
        this.reservationRepository = reservationRepository;
        this.coachRequestRepository = coachRequestRepository;
        this.notificationService = notificationService;
    }

    @GetMapping("/client/{clientId}")
    public List<NotificationDTO> getClientNotifications(@PathVariable Long clientId) {
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        List<NotificationDTO> notifications = new ArrayList<>();

        // 1. Notifications persistantes enregistrées en base
        List<Notification> persistentNotifications =
                notificationService.getClientNotifications(clientId);

        for (Notification notification : persistentNotifications) {
            notifications.add(new NotificationDTO(notification));
        }

        // 2. Notifications automatiques pour les réservations de demain
        List<Reservation> reservations =
                reservationRepository.findByClientIdAndReservationDate(clientId, tomorrow);

        for (Reservation reservation : reservations) {
            if (!"CANCELLED".equals(reservation.getStatus())) {
                String message =
                        "Vous avez une réservation demain de "
                                + reservation.getStartTime()
                                + " à "
                                + reservation.getEndTime()
                                + " sur le terrain de tennis "
                                + reservation.getCourt().getCourtNumber()
                                + ".";

                notifications.add(
                        new NotificationDTO(
                                "RESERVATION",
                                message,
                                reservation.getReservationDate(),
                                reservation.getStartTime()
                        )
                );
            }
        }

        // 3. Notifications automatiques pour les séances coach de demain
        List<CoachRequest> coachRequests =
                coachRequestRepository.findByClientIdAndRequestDateAndStatus(
                        clientId,
                        tomorrow,
                        "ACCEPTED"
                );

        for (CoachRequest request : coachRequests) {
            String message =
                    "Vous avez une séance coach demain à "
                            + request.getRequestTime()
                            + " avec "
                            + request.getCoach().getUser().getFirstName()
                            + " "
                            + request.getCoach().getUser().getLastName()
                            + " pour l'activité: "
                            + request.getActivity()
                            + ".";

            notifications.add(
                    new NotificationDTO(
                            "COACH_SESSION",
                            message,
                            request.getRequestDate(),
                            request.getRequestTime()
                    )
            );
        }

        return notifications;
    }

    @GetMapping("/coach/{coachId}")
    public List<NotificationDTO> getCoachNotifications(@PathVariable Long coachId) {
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        List<NotificationDTO> notifications = new ArrayList<>();

        // 1. Notifications persistantes enregistrées en base
        List<Notification> persistentNotifications =
                notificationService.getCoachNotifications(coachId);

        for (Notification notification : persistentNotifications) {
            notifications.add(new NotificationDTO(notification));
        }

        // 2. Notifications automatiques pour les séances de demain
        List<CoachRequest> coachRequests =
                coachRequestRepository.findByCoachIdAndRequestDateAndStatus(
                        coachId,
                        tomorrow,
                        "ACCEPTED"
                );

        for (CoachRequest request : coachRequests) {
            String message =
                    "Vous avez une séance demain à "
                            + request.getRequestTime()
                            + " avec "
                            + request.getClient().getUser().getFirstName()
                            + " "
                            + request.getClient().getUser().getLastName()
                            + " pour l'activité: "
                            + request.getActivity()
                            + ".";

            notifications.add(
                    new NotificationDTO(
                            "COACH_SESSION",
                            message,
                            request.getRequestDate(),
                            request.getRequestTime()
                    )
            );
        }

        return notifications;
    }

    @PutMapping("/{id}/read")
    public Notification markNotificationAsRead(@PathVariable Long id) {
        return notificationService.markAsRead(id);
    }

    @GetMapping("/admin")
    public List<NotificationDTO> getAdminNotifications() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        List<NotificationDTO> notifications = new ArrayList<>();

        // 1. Notifications persistantes enregistrées en base
        List<Notification> persistentNotifications =
                notificationService.getAdminNotifications();

        for (Notification notification : persistentNotifications) {
            notifications.add(new NotificationDTO(notification));
        }

        // 2. Notifications automatiques pour les réservations de demain
        List<Reservation> reservations =
                reservationRepository.findByReservationDate(tomorrow);

        for (Reservation reservation : reservations) {
            if (!"CANCELLED".equals(reservation.getStatus())) {
                String message =
                        "Réservation demain : terrain "
                                + reservation.getCourt().getCourtNumber()
                                + " de "
                                + reservation.getStartTime()
                                + " à "
                                + reservation.getEndTime()
                                + " par "
                                + reservation.getClient().getUser().getFirstName()
                                + " "
                                + reservation.getClient().getUser().getLastName()
                                + ".";

                notifications.add(
                        new NotificationDTO(
                                "RESERVATION",
                                message,
                                reservation.getReservationDate(),
                                reservation.getStartTime()
                        )
                );
            }
        }

        // 3. Notifications automatiques pour les séances coach de demain
        List<CoachRequest> coachRequests =
                coachRequestRepository.findByRequestDateAndStatus(
                        tomorrow,
                        "ACCEPTED"
                );

        for (CoachRequest request : coachRequests) {
            String message =
                    "Séance coach demain : "
                            + request.getActivity()
                            + " à "
                            + request.getRequestTime()
                            + " entre "
                            + request.getClient().getUser().getFirstName()
                            + " "
                            + request.getClient().getUser().getLastName()
                            + " et le coach "
                            + request.getCoach().getUser().getFirstName()
                            + " "
                            + request.getCoach().getUser().getLastName()
                            + ".";

            notifications.add(
                    new NotificationDTO(
                            "COACH_SESSION",
                            message,
                            request.getRequestDate(),
                            request.getRequestTime()
                    )
            );
        }

        return notifications;
    }
}