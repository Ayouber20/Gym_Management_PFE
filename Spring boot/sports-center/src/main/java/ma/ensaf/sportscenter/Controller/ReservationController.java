package ma.ensaf.sportscenter.Controller;

import ma.ensaf.sportscenter.Entity.Reservation;
import ma.ensaf.sportscenter.Repository.ReservationRepository;
import ma.ensaf.sportscenter.Service.ReservationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationRepository reservationRepository;
    private final ReservationService reservationService;

    public ReservationController(
            ReservationRepository reservationRepository,
            ReservationService reservationService) {

        this.reservationRepository = reservationRepository;
        this.reservationService = reservationService;
    }

    @GetMapping
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    @PostMapping
    public Reservation createReservation(
            @RequestBody Reservation reservation) {

        return reservationService.createReservation(reservation);
    }

    @DeleteMapping("/{id}")
    public void deleteReservation(@PathVariable Long id) {
        reservationRepository.deleteById(id);
    }
}