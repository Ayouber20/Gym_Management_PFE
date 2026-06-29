package ma.ensaf.sportscenter.Controller;

import ma.ensaf.sportscenter.Entity.CoachRequest;
import ma.ensaf.sportscenter.Repository.CoachRequestRepository;
import ma.ensaf.sportscenter.Service.CoachRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coach-requests")
@CrossOrigin(origins = "http://localhost:4200")
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
        coachRequestService.updatePastCoachRequestsStatus();
        return coachRequestRepository.findAll();
    }

    @GetMapping("/client/{clientId}")
    public List<CoachRequest> getRequestsByClient(@PathVariable Long clientId) {
        return coachRequestService.getVisibleRequestsByClient(clientId);
    }

    @GetMapping("/coach/{coachId}")
    public List<CoachRequest> getRequestsByCoach(@PathVariable Long coachId) {
        return coachRequestService.getVisibleRequestsByCoach(coachId);
    }

    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody CoachRequest request) {
        try {
            CoachRequest savedRequest = coachRequestService.createRequest(request);
            return ResponseEntity.ok(savedRequest);
        } catch (RuntimeException exception) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(exception.getMessage());
        }
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptRequest(@PathVariable Long id) {
        try {
            CoachRequest acceptedRequest = coachRequestService.acceptRequest(id);
            return ResponseEntity.ok(acceptedRequest);
        } catch (RuntimeException exception) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(exception.getMessage());
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id) {
        try {
            CoachRequest rejectedRequest = coachRequestService.rejectRequest(id);
            return ResponseEntity.ok(rejectedRequest);
        } catch (RuntimeException exception) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(exception.getMessage());
        }
    }

    @PutMapping("/{id}/hide-for-client")
    public ResponseEntity<?> hideRequestForClient(@PathVariable Long id) {
        try {
            CoachRequest hiddenRequest = coachRequestService.hideRequestForClient(id);
            return ResponseEntity.ok(hiddenRequest);
        } catch (RuntimeException exception) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(exception.getMessage());
        }
    }

    @PutMapping("/{id}/hide-for-coach")
    public ResponseEntity<?> hideRequestForCoach(@PathVariable Long id) {
        try {
            CoachRequest hiddenRequest = coachRequestService.hideRequestForCoach(id);
            return ResponseEntity.ok(hiddenRequest);
        } catch (RuntimeException exception) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(exception.getMessage());
        }
    }
}