package ma.ensaf.sportscenter.Controller;

import ma.ensaf.sportscenter.Entity.GroupClass;
import ma.ensaf.sportscenter.Entity.GroupClassParticipation;
import ma.ensaf.sportscenter.Service.GroupClassService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/group-classes")
@CrossOrigin(origins = "http://localhost:4200")
public class GroupClassController {

    private final GroupClassService groupClassService;

    public GroupClassController(GroupClassService groupClassService) {
        this.groupClassService = groupClassService;
    }

    @PostMapping
    public ResponseEntity<?> createGroupClass(@RequestBody GroupClass groupClass) {
        try {
            GroupClass savedGroupClass =
                    groupClassService.createGroupClass(groupClass);

            return ResponseEntity.ok(savedGroupClass);
        } catch (RuntimeException exception) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(exception.getMessage());
        }
    }

    @GetMapping("/coach/{coachId}")
    public ResponseEntity<?> getCoachGroupClasses(@PathVariable Long coachId) {
        return ResponseEntity.ok(groupClassService.getCoachGroupClasses(coachId));
    }

    @GetMapping
    public ResponseEntity<?> getAvailableGroupClasses() {
        return ResponseEntity.ok(groupClassService.getAvailableGroupClasses());
    }

    @PostMapping("/{groupClassId}/participate/{clientId}")
    public ResponseEntity<?> participate(
            @PathVariable Long groupClassId,
            @PathVariable Long clientId) {

        try {
            GroupClassParticipation participation =
                    groupClassService.participate(groupClassId, clientId);

            return ResponseEntity.ok(participation);
        } catch (RuntimeException exception) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(exception.getMessage());
        }
    }

    @GetMapping("/{groupClassId}/participants/count")
    public ResponseEntity<?> countParticipants(@PathVariable Long groupClassId) {
        return ResponseEntity.ok(groupClassService.countParticipants(groupClassId));
    }

    @GetMapping("/{groupClassId}/participating/{clientId}")
    public ResponseEntity<?> isParticipating(
            @PathVariable Long groupClassId,
            @PathVariable Long clientId) {

        return ResponseEntity.ok(
                groupClassService.isParticipating(groupClassId, clientId)
        );
    }

    @DeleteMapping("/{groupClassId}/participate/{clientId}")
    public ResponseEntity<?> cancelParticipation(
            @PathVariable Long groupClassId,
            @PathVariable Long clientId) {

        try {
            groupClassService.cancelParticipation(groupClassId, clientId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException exception) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(exception.getMessage());
        }
    }
}