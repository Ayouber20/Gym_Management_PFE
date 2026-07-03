package ma.ensaf.sportscenter.Controller;

import ma.ensaf.sportscenter.Entity.ClubEvent;
import ma.ensaf.sportscenter.Entity.EventParticipation;
import ma.ensaf.sportscenter.Service.ClubEventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:4200")
public class ClubEventController {

    private final ClubEventService clubEventService;

    public ClubEventController(ClubEventService clubEventService) {
        this.clubEventService = clubEventService;
    }

    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody ClubEvent event) {
        try {
            ClubEvent savedEvent = clubEventService.createEvent(event);
            return ResponseEntity.ok(savedEvent);
        } catch (RuntimeException exception) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(exception.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllEventsForAdmin() {
        return ResponseEntity.ok(clubEventService.getAllEventsForAdmin());
    }

    @GetMapping("/client")
    public ResponseEntity<?> getEventsForClient() {
        return ResponseEntity.ok(clubEventService.getEventsForClient());
    }

    @GetMapping("/coach")
    public ResponseEntity<?> getEventsForCoach() {
        return ResponseEntity.ok(clubEventService.getEventsForCoach());
    }

    @PostMapping("/{eventId}/participate/{participantRole}/{participantId}")
    public ResponseEntity<?> participate(
            @PathVariable Long eventId,
            @PathVariable String participantRole,
            @PathVariable Long participantId) {

        try {
            EventParticipation participation =
                    clubEventService.participate(
                            eventId,
                            participantRole,
                            participantId
                    );

            return ResponseEntity.ok(participation);
        } catch (RuntimeException exception) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(exception.getMessage());
        }
    }

    @DeleteMapping("/{eventId}/participate/{participantRole}/{participantId}")
    public ResponseEntity<?> cancelParticipation(
            @PathVariable Long eventId,
            @PathVariable String participantRole,
            @PathVariable Long participantId) {

        try {
            clubEventService.cancelParticipation(
                    eventId,
                    participantRole,
                    participantId
            );

            return ResponseEntity.ok().build();
        } catch (RuntimeException exception) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(exception.getMessage());
        }
    }

    @GetMapping("/{eventId}/participating/{participantRole}/{participantId}")
    public ResponseEntity<?> isParticipating(
            @PathVariable Long eventId,
            @PathVariable String participantRole,
            @PathVariable Long participantId) {

        return ResponseEntity.ok(
                clubEventService.isParticipating(
                        eventId,
                        participantRole,
                        participantId
                )
        );
    }

    @GetMapping("/{eventId}/participants/count")
    public ResponseEntity<?> countParticipants(@PathVariable Long eventId) {
        return ResponseEntity.ok(
                clubEventService.countParticipants(eventId)
        );
    }

    @PutMapping("/{id}/disable")
    public ResponseEntity<?> disableEvent(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(clubEventService.disableEvent(id));
        } catch (RuntimeException exception) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(exception.getMessage());
        }
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateEvent(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(clubEventService.activateEvent(id));
        } catch (RuntimeException exception) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(exception.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        try {
            clubEventService.deleteEvent(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException exception) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(exception.getMessage());
        }
    }
}