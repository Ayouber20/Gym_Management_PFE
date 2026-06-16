package ma.ensaf.sportscenter.Service;

import ma.ensaf.sportscenter.Entity.Reservation;
import ma.ensaf.sportscenter.Repository.ReservationRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;

    public ReservationService(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    public Reservation createReservation(Reservation reservation) {

        long durationHours = Duration.between(
                reservation.getStartTime(),
                reservation.getEndTime()
        ).toHours();

        if (reservation.getReservationDate().isBefore(LocalDate.now())) {
            throw new RuntimeException(
                    "Impossible de réserver une date passée."
            );
        }

        if (!reservation.getReservationDate().isAfter(LocalDate.now())) {
            throw new RuntimeException("Les réservations doivent être faites au minimum un jour à l’avance.");
        }

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
}