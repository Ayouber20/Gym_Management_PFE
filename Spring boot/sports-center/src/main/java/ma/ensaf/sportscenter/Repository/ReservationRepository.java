package ma.ensaf.sportscenter.Repository;

import ma.ensaf.sportscenter.Entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByCourtIdAndReservationDate(
            Long courtId,
            LocalDate reservationDate
    );

    List<Reservation> findByClientId(Long clientId);
}