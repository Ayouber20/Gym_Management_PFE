package ma.ensaf.sportscenter.Controller;

import ma.ensaf.sportscenter.Entity.Coach;
import ma.ensaf.sportscenter.Repository.CoachRepository;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/api/coaches")
@CrossOrigin(origins = "http://localhost:4200")
public class CoachController {

    private final CoachRepository coachRepository;

    public CoachController(CoachRepository coachRepository) {
        this.coachRepository = coachRepository;
    }

    @GetMapping
    public List<Coach> getAllCoaches() {
        return coachRepository.findAll();
    }

    @GetMapping("/user/{userId}")
    public Coach getCoachByUserId(@PathVariable Long userId) {
        return coachRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Coach introuvable pour cet utilisateur."));
    }

    @PostMapping
    public ResponseEntity<?> createCoach(@RequestBody Coach coach) {

        Long userId = coach.getUser().getId();

        boolean exists = coachRepository.findByUserId(userId).isPresent();

        if (exists) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Cet utilisateur possède déjà un profil coach.");

            return ResponseEntity
                    .badRequest()
                    .body(error);
        }

        Coach savedCoach = coachRepository.save(coach);

        return ResponseEntity.ok(savedCoach);
    }
}