package ma.ensaf.sportscenter.Service;

import ma.ensaf.sportscenter.Entity.Reservation;
import ma.ensaf.sportscenter.Repository.ReservationRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;

    public ReservationService(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    public Reservation createReservation(Reservation reservation) {

        if (!reservation.getReservationDate().isAfter(LocalDate.now())) {
            throw new RuntimeException(
                    "Les réservations doivent être faites au minimum un jour à l’avance."
            );
        }

        long durationHours = Duration.between(
                reservation.getStartTime(),
                reservation.getEndTime()
        ).toHours();

        if (durationHours < 2) {
            throw new RuntimeException(
                    "Une réservation doit durer au minimum 2 heures."
            );
        }

        var existingReservations =
                reservationRepository.findByCourtIdAndReservationDate(
                        reservation.getCourt().getId(),
                        reservation.getReservationDate()
                );

        for (Reservation existing : existingReservations) {

            boolean overlap =
                    reservation.getStartTime().isBefore(existing.getEndTime())
                            &&
                            reservation.getEndTime().isAfter(existing.getStartTime());

            if (overlap) {
                throw new RuntimeException(
                        "Ce terrain est déjà réservé sur ce créneau."
                );
            }
        }

        return reservationRepository.save(reservation);
    }

    public void updatePastReservationsStatus() {

        List<Reservation> confirmedReservations =
                reservationRepository.findByStatus("CONFIRMED");

        LocalDateTime now = LocalDateTime.now();

        for (Reservation reservation : confirmedReservations) {

            LocalDateTime reservationEndDateTime =
                    LocalDateTime.of(
                            reservation.getReservationDate(),
                            reservation.getEndTime()
                    );

            if (reservationEndDateTime.isBefore(now)) {
                reservation.setStatus("COMPLETED");
                reservationRepository.save(reservation);
            }
        }
    }

    public List<Reservation> getVisibleReservationsByClient(Long clientId) {

        updatePastReservationsStatus();

        List<Reservation> allClientReservations =
                reservationRepository.findByClientId(clientId);

        List<Reservation> visibleReservations = new ArrayList<>();

        LocalDate today = LocalDate.now();

        for (Reservation reservation : allClientReservations) {

            boolean isOldCompleted =
                    "COMPLETED".equals(reservation.getStatus())
                            && reservation.getReservationDate().isBefore(today);

            boolean isOldCancelled =
                    "CANCELLED".equals(reservation.getStatus())
                            && reservation.getReservationDate().isBefore(today);

            if (!isOldCompleted && !isOldCancelled) {
                visibleReservations.add(reservation);
            }
        }

        return visibleReservations;
    }
}