package ma.ensaf.sportscenter.Controller;

import ma.ensaf.sportscenter.Entity.CoachLeavingRequest;
import ma.ensaf.sportscenter.Repository.CoachLeavingRequestRepository;
import ma.ensaf.sportscenter.Service.CoachLeavingRequestService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coach-leaves")
@CrossOrigin(origins = "http://localhost:4200")
public class CoachLeavingRequestController {

    private final CoachLeavingRequestRepository coachLeavingRequestRepository;
    private final CoachLeavingRequestService coachLeavingRequestService;

    public CoachLeavingRequestController(
            CoachLeavingRequestRepository coachLeavingRequestRepository,
            CoachLeavingRequestService coachLeavingRequestService) {

        this.coachLeavingRequestRepository = coachLeavingRequestRepository;
        this.coachLeavingRequestService = coachLeavingRequestService;
    }

    @GetMapping
    public List<CoachLeavingRequest> getAllLeaveRequests() {
        return coachLeavingRequestRepository.findAll();
    }

    @GetMapping("/coach/{coachId}")
    public List<CoachLeavingRequest> getLeaveRequestsByCoach(
            @PathVariable Long coachId) {

        return coachLeavingRequestRepository.findByCoachId(coachId);
    }

    @GetMapping("/pending")
    public List<CoachLeavingRequest> getPendingLeaveRequests() {
        return coachLeavingRequestRepository.findByStatus("PENDING");
    }

    @PostMapping
    public CoachLeavingRequest createLeaveRequest(
            @RequestBody CoachLeavingRequest leaveRequest) {

        return coachLeavingRequestService.createLeaveRequest(leaveRequest);
    }

    @PutMapping("/{id}/accept")
    public CoachLeavingRequest acceptLeaveRequest(
            @PathVariable Long id) {

        return coachLeavingRequestService.acceptLeaveRequest(id);
    }

    @PutMapping("/{id}/reject")
    public CoachLeavingRequest rejectLeaveRequest(
            @PathVariable Long id) {

        return coachLeavingRequestService.rejectLeaveRequest(id);
    }
}