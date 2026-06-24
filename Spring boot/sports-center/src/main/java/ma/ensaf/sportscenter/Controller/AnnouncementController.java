package ma.ensaf.sportscenter.Controller;

import ma.ensaf.sportscenter.Entity.Announcement;
import ma.ensaf.sportscenter.Service.AnnouncementService;
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
    public Announcement createAnnouncement(@RequestBody Announcement announcement) {
        return announcementService.createAnnouncement(announcement);
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
    public Announcement disableAnnouncement(@PathVariable Long id) {
        return announcementService.disableAnnouncement(id);
    }
}