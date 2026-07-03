package ma.ensaf.sportscenter.Service;

import ma.ensaf.sportscenter.Entity.ClubEvent;
import ma.ensaf.sportscenter.Entity.EventParticipation;
import ma.ensaf.sportscenter.Repository.ClubEventRepository;
import ma.ensaf.sportscenter.Repository.EventParticipationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ClubEventService {

    private final ClubEventRepository clubEventRepository;
    private final EventParticipationRepository eventParticipationRepository;

    public ClubEventService(
            ClubEventRepository clubEventRepository,
            EventParticipationRepository eventParticipationRepository) {

        this.clubEventRepository = clubEventRepository;
        this.eventParticipationRepository = eventParticipationRepository;
    }

    public ClubEvent createEvent(ClubEvent event) {

        if (event.getTitle() == null || event.getTitle().isBlank()) {
            throw new RuntimeException("Veuillez saisir le titre de l'événement.");
        }

        if (event.getEventDate() == null || event.getEventTime() == null) {
            throw new RuntimeException("Veuillez choisir la date et l'heure de l'événement.");
        }

        if (event.getEventDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Impossible de créer un événement dans le passé.");
        }

        if (event.getLocation() == null || event.getLocation().isBlank()) {
            throw new RuntimeException("Veuillez saisir le lieu de l'événement.");
        }

        if (event.getMaxParticipants() == null || event.getMaxParticipants() <= 0) {
            throw new RuntimeException("Le nombre maximum de participants doit être supérieur à 0.");
        }

        if (event.getTargetAudience() == null || event.getTargetAudience().isBlank()) {
            throw new RuntimeException("Veuillez choisir le public cible.");
        }

        event.setStatus("ACTIVE");

        return clubEventRepository.save(event);
    }

    public List<ClubEvent> getAllEventsForAdmin() {
        return clubEventRepository.findAllByOrderByEventDateDescEventTimeDesc();
    }

    public List<ClubEvent> getEventsForClient() {
        return clubEventRepository.findByStatusAndTargetAudienceInOrderByEventDateAscEventTimeAsc(
                "ACTIVE",
                List.of("ALL", "CLIENT")
        );
    }

    public List<ClubEvent> getEventsForCoach() {
        return clubEventRepository.findByStatusAndTargetAudienceInOrderByEventDateAscEventTimeAsc(
                "ACTIVE",
                List.of("ALL", "COACH")
        );
    }

    public EventParticipation participate(
            Long eventId,
            String participantRole,
            Long participantId) {

        ClubEvent event = clubEventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Événement introuvable."));

        if (!"ACTIVE".equals(event.getStatus())) {
            throw new RuntimeException("Cet événement n'est plus disponible.");
        }

        if (event.getEventDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Impossible de participer à un événement passé.");
        }

        boolean alreadyParticipating =
                eventParticipationRepository.existsByEventIdAndParticipantRoleAndParticipantId(
                        eventId,
                        participantRole,
                        participantId
                );

        if (alreadyParticipating) {
            throw new RuntimeException("Vous participez déjà à cet événement.");
        }

        long participantsCount =
                eventParticipationRepository.countByEventId(eventId);

        if (participantsCount >= event.getMaxParticipants()) {
            throw new RuntimeException("Cet événement est complet.");
        }

        EventParticipation participation = new EventParticipation();
        participation.setEvent(event);
        participation.setParticipantRole(participantRole);
        participation.setParticipantId(participantId);
        participation.setParticipationDate(LocalDate.now());

        return eventParticipationRepository.save(participation);
    }

    public void cancelParticipation(
            Long eventId,
            String participantRole,
            Long participantId) {

        EventParticipation participation =
                eventParticipationRepository
                        .findByEventIdAndParticipantRoleAndParticipantId(
                                eventId,
                                participantRole,
                                participantId
                        )
                        .orElseThrow(() ->
                                new RuntimeException("Participation introuvable."));

        eventParticipationRepository.delete(participation);
    }

    public boolean isParticipating(
            Long eventId,
            String participantRole,
            Long participantId) {

        return eventParticipationRepository.existsByEventIdAndParticipantRoleAndParticipantId(
                eventId,
                participantRole,
                participantId
        );
    }

    public long countParticipants(Long eventId) {
        return eventParticipationRepository.countByEventId(eventId);
    }

    public ClubEvent disableEvent(Long id) {
        ClubEvent event = clubEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Événement introuvable."));

        event.setStatus("INACTIVE");

        return clubEventRepository.save(event);
    }

    public ClubEvent activateEvent(Long id) {
        ClubEvent event = clubEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Événement introuvable."));

        event.setStatus("ACTIVE");

        return clubEventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        if (!clubEventRepository.existsById(id)) {
            throw new RuntimeException("Événement introuvable.");
        }

        clubEventRepository.deleteById(id);
    }
}