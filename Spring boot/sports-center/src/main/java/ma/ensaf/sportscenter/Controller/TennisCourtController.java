package ma.ensaf.sportscenter.Controller;

import ma.ensaf.sportscenter.Entity.TennisCourt;
import ma.ensaf.sportscenter.Repository.TennisCourtRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courts")
public class TennisCourtController {

    private final TennisCourtRepository tennisCourtRepository;

    public TennisCourtController(TennisCourtRepository tennisCourtRepository) {
        this.tennisCourtRepository = tennisCourtRepository;
    }

    @GetMapping
    public List<TennisCourt> getAllCourts() {
        return tennisCourtRepository.findAll();
    }
}