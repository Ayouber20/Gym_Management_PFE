package ma.ensaf.sportscenter.Controller;

import ma.ensaf.sportscenter.Entity.TennisCourt;
import ma.ensaf.sportscenter.Repository.TennisCourtRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courts")
@CrossOrigin(origins = "http://localhost:4200")
public class TennisCourtController {

    private final TennisCourtRepository tennisCourtRepository;

    public TennisCourtController(TennisCourtRepository tennisCourtRepository) {
        this.tennisCourtRepository = tennisCourtRepository;
    }

    @GetMapping
    public List<TennisCourt> getAllCourts() {
        return tennisCourtRepository.findAll();
    }

    @PutMapping("/{id}/maintenance")
    public TennisCourt setCourtMaintenance(@PathVariable Long id) {

        TennisCourt court = tennisCourtRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Terrain introuvable."));

        court.setStatus("MAINTENANCE");

        return tennisCourtRepository.save(court);
    }

    @PutMapping("/{id}/available")
    public TennisCourt setCourtAvailable(@PathVariable Long id) {

        TennisCourt court = tennisCourtRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Terrain introuvable."));

        court.setStatus("AVAILABLE");

        return tennisCourtRepository.save(court);
    }
}