package ma.ensaf.sportscenter.Controller;

import ma.ensaf.sportscenter.Entity.Reservation;
import ma.ensaf.sportscenter.Entity.TennisCourt;
import ma.ensaf.sportscenter.Repository.ReservationRepository;
import ma.ensaf.sportscenter.Repository.TennisCourtRepository;
import ma.ensaf.sportscenter.Service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courts")
@CrossOrigin(origins = "http://localhost:4200")
public class TennisCourtController {

    private final TennisCourtRepository tennisCourtRepository;
    private final ReservationRepository reservationRepository;
    private final NotificationService notificationService;

    public TennisCourtController(
            TennisCourtRepository tennisCourtRepository,
            ReservationRepository reservationRepository,
            NotificationService notificationService) {

        this.tennisCourtRepository = tennisCourtRepository;
        this.reservationRepository = reservationRepository;
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<TennisCourt> getAllCourts() {
        return tennisCourtRepository.findAll();
    }

    @PutMapping("/{id}/maintenance")
    public TennisCourt setCourtMaintenance(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        TennisCourt court = tennisCourtRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Terrain introuvable."));

        LocalDate startDate = LocalDate.parse(body.get("maintenanceStartDate"));
        LocalDate endDate = LocalDate.parse(body.get("maintenanceEndDate"));

        if (startDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("La date de début de maintenance ne peut pas être passée.");
        }

        if (endDate.isBefore(startDate)) {
            throw new RuntimeException("La date de fin doit être après ou égale à la date de début.");
        }

        court.setStatus("MAINTENANCE");
        court.setMaintenanceStartDate(startDate);
        court.setMaintenanceEndDate(endDate);

        List<Reservation> reservationsToCancel =
                reservationRepository.findByCourtIdAndReservationDateBetween(
                        id,
                        startDate,
                        endDate
                );

        for (Reservation reservation : reservationsToCancel) {
            if (!"CANCELLED".equals(reservation.getStatus())) {
                reservation.setStatus("CANCELLED");
                reservationRepository.save(reservation);

                String message =
                        "Votre réservation du terrain "
                                + court.getCourtNumber()
                                + " le "
                                + reservation.getReservationDate()
                                + " de "
                                + reservation.getStartTime()
                                + " à "
                                + reservation.getEndTime()
                                + " a été annulée car le terrain est en maintenance.";

                notificationService.createClientNotification(
                        reservation.getClient().getId(),
                        "RESERVATION_CANCELLED",
                        message,
                        reservation.getReservationDate(),
                        reservation.getStartTime()
                );
            }
        }

        return tennisCourtRepository.save(court);
    }

    @PutMapping("/{id}/available")
    public TennisCourt setCourtAvailable(@PathVariable Long id) {

        TennisCourt court = tennisCourtRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Terrain introuvable."));

        court.setStatus("AVAILABLE");
        court.setMaintenanceStartDate(null);
        court.setMaintenanceEndDate(null);

        return tennisCourtRepository.save(court);
    }
}