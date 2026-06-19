package ma.ensaf.sportscenter.Controller;

import ma.ensaf.sportscenter.Entity.Reservation;
import ma.ensaf.sportscenter.Repository.ReservationRepository;
import ma.ensaf.sportscenter.Service.ReservationService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "http://localhost:4200")
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
        reservationService.updatePastReservationsStatus();
        return reservationRepository.findAll();
    }

    @GetMapping("/client/{clientId}")
    public List<Reservation> getReservationsByClient(@PathVariable Long clientId) {
        return reservationService.getVisibleReservationsByClient(clientId);
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

    @PutMapping("/{id}/hide-for-client")
    public Reservation hideReservationForClient(@PathVariable Long id) {
        return reservationService.hideReservationForClient(id);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(
            RuntimeException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "message",
                        ex.getMessage()
                ));
    }

}
