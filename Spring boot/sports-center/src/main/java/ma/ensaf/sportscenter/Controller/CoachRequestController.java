package ma.ensaf.sportscenter.Controller;

import ma.ensaf.sportscenter.Entity.CoachRequest;
import ma.ensaf.sportscenter.Repository.CoachRequestRepository;
import ma.ensaf.sportscenter.Service.CoachRequestService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coach-requests")
public class CoachRequestController {

    private final CoachRequestRepository coachRequestRepository;
    private final CoachRequestService coachRequestService;

    public CoachRequestController(
            CoachRequestRepository coachRequestRepository,
            CoachRequestService coachRequestService) {

        this.coachRequestRepository = coachRequestRepository;
        this.coachRequestService = coachRequestService;
    }

    @GetMapping
    public List<CoachRequest> getAllRequests() {
        return coachRequestRepository.findAll();
    }

    @PostMapping
    public CoachRequest createRequest(
            @RequestBody CoachRequest request) {

        return coachRequestRepository.save(request);
    }

    @PutMapping("/{id}/accept")
    public CoachRequest acceptRequest(
            @PathVariable Long id) {

        return coachRequestService.acceptRequest(id);
    }

    @PutMapping("/{id}/reject")
    public CoachRequest rejectRequest(
            @PathVariable Long id) {

        return coachRequestService.rejectRequest(id);
    }
}