package ma.ensaf.sportscenter.Service;

import ma.ensaf.sportscenter.Entity.Announcement;
import ma.ensaf.sportscenter.Repository.AnnouncementRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    public Announcement createAnnouncement(Announcement announcement) {

        if (announcement.getTitle() == null || announcement.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Le titre de l’annonce est obligatoire.");
        }

        if (announcement.getMessage() == null || announcement.getMessage().trim().isEmpty()) {
            throw new RuntimeException("Le message de l’annonce est obligatoire.");
        }

        if (announcement.getTargetAudience() == null || announcement.getTargetAudience().trim().isEmpty()) {
            throw new RuntimeException("Le destinataire de l’annonce est obligatoire.");
        }

        boolean validTarget =
                "ALL".equals(announcement.getTargetAudience()) ||
                        "CLIENT".equals(announcement.getTargetAudience()) ||
                        "COACH".equals(announcement.getTargetAudience());

        if (!validTarget) {
            throw new RuntimeException("Le destinataire doit être ALL, CLIENT ou COACH.");
        }

        announcement.setActive(true);
        announcement.setCreatedAt(LocalDateTime.now());

        return announcementRepository.save(announcement);
    }

    public List<Announcement> getAllAnnouncementsForAdmin() {
        return announcementRepository.findAll();
    }

    public List<Announcement> getAnnouncementsForClient() {
        return announcementRepository.findByActiveTrueAndTargetAudienceInOrderByCreatedAtDesc(
                List.of("ALL", "CLIENT")
        );
    }

    public List<Announcement> getAnnouncementsForCoach() {
        return announcementRepository.findByActiveTrueAndTargetAudienceInOrderByCreatedAtDesc(
                List.of("ALL", "COACH")
        );
    }

    public Announcement disableAnnouncement(Long id) {

        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Annonce introuvable."));

        announcement.setActive(false);

        return announcementRepository.save(announcement);
    }

    public void deleteAnnouncement(Long id) {

        if (!announcementRepository.existsById(id)) {
            throw new RuntimeException("Annonce introuvable.");
        }

        announcementRepository.deleteById(id);
    }

    public Announcement activateAnnouncement(Long id) {

        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Annonce introuvable."));

        announcement.setActive(true);

        return announcementRepository.save(announcement);
    }
}