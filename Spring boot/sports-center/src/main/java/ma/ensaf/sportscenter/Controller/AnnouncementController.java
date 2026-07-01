package ma.ensaf.sportscenter.Controller;

import ma.ensaf.sportscenter.Entity.Announcement;
import ma.ensaf.sportscenter.Service.AnnouncementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@CrossOrigin(origins = "http://localhost:4200")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @PostMapping
    public ResponseEntity<?> createAnnouncement(@RequestBody Announcement announcement) {
        try {
            Announcement savedAnnouncement = announcementService.createAnnouncement(announcement);
            return ResponseEntity.ok(savedAnnouncement);
        } catch (RuntimeException exception) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(exception.getMessage());
        }
    }

    @GetMapping
    public List<Announcement> getAllAnnouncementsForAdmin() {
        return announcementService.getAllAnnouncementsForAdmin();
    }

    @GetMapping("/client")
    public List<Announcement> getAnnouncementsForClient() {
        return announcementService.getAnnouncementsForClient();
    }

    @GetMapping("/coach")
    public List<Announcement> getAnnouncementsForCoach() {
        return announcementService.getAnnouncementsForCoach();
    }

    @PutMapping("/{id}/disable")
    public ResponseEntity<?> disableAnnouncement(@PathVariable Long id) {
        try {
            Announcement announcement = announcementService.disableAnnouncement(id);
            return ResponseEntity.ok(announcement);
        } catch (RuntimeException exception) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(exception.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable Long id) {
        try {
            announcementService.deleteAnnouncement(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException exception) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(exception.getMessage());
        }
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateAnnouncement(@PathVariable Long id) {
        try {
            Announcement announcement = announcementService.activateAnnouncement(id);
            return ResponseEntity.ok(announcement);
        } catch (RuntimeException exception) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(exception.getMessage());
        }
    }
}