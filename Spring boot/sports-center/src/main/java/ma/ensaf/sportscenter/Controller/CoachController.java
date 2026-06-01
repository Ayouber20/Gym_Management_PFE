package ma.ensaf.sportscenter.Controller;

import ma.ensaf.sportscenter.Entity.Coach;
import ma.ensaf.sportscenter.Repository.CoachRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coaches")
public class CoachController {

    private final CoachRepository coachRepository;

    public CoachController(CoachRepository coachRepository) {
        this.coachRepository = coachRepository;
    }

    @GetMapping
    public List<Coach> getAllCoaches() {
        return coachRepository.findAll();
    }
}
