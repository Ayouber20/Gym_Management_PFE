package ma.ensaf.sportscenter.Service;

import ma.ensaf.sportscenter.Entity.Client;
import ma.ensaf.sportscenter.Entity.Coach;
import ma.ensaf.sportscenter.Entity.GroupClass;
import ma.ensaf.sportscenter.Entity.GroupClassParticipation;
import ma.ensaf.sportscenter.Repository.ClientRepository;
import ma.ensaf.sportscenter.Repository.CoachRepository;
import ma.ensaf.sportscenter.Repository.GroupClassParticipationRepository;
import ma.ensaf.sportscenter.Repository.GroupClassRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class GroupClassService {

    private final GroupClassRepository groupClassRepository;
    private final GroupClassParticipationRepository participationRepository;
    private final CoachRepository coachRepository;
    private final ClientRepository clientRepository;

    public GroupClassService(
            GroupClassRepository groupClassRepository,
            GroupClassParticipationRepository participationRepository,
            CoachRepository coachRepository,
            ClientRepository clientRepository) {

        this.groupClassRepository = groupClassRepository;
        this.participationRepository = participationRepository;
        this.coachRepository = coachRepository;
        this.clientRepository = clientRepository;
    }

    public GroupClass createGroupClass(GroupClass groupClass) {

        if (groupClass.getTitle() == null || groupClass.getTitle().isBlank()) {
            throw new RuntimeException("Veuillez saisir le titre du cours.");
        }

        if (groupClass.getActivity() == null || groupClass.getActivity().isBlank()) {
            throw new RuntimeException("Veuillez choisir une activité.");
        }

        if (groupClass.getClassDate() == null || groupClass.getStartTime() == null || groupClass.getEndTime() == null) {
            throw new RuntimeException("Veuillez choisir la date, l'heure de début et l'heure de fin.");
        }

        if (groupClass.getClassDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Impossible de créer un cours dans le passé.");
        }

        if (!groupClass.getEndTime().isAfter(groupClass.getStartTime())) {
            throw new RuntimeException("L'heure de fin doit être après l'heure de début.");
        }

        if (groupClass.getMaxParticipants() == null || groupClass.getMaxParticipants() <= 0) {
            throw new RuntimeException("Le nombre maximum de participants doit être supérieur à 0.");
        }

        if (groupClass.getCoach() == null || groupClass.getCoach().getId() == null) {
            throw new RuntimeException("Coach introuvable.");
        }

        Coach coach = coachRepository.findById(groupClass.getCoach().getId())
                .orElseThrow(() -> new RuntimeException("Coach introuvable."));

        groupClass.setCoach(coach);
        groupClass.setStatus("ACTIVE");

        return groupClassRepository.save(groupClass);
    }

    public List<GroupClass> getCoachGroupClasses(Long coachId) {
        return groupClassRepository.findByCoachIdOrderByClassDateDescStartTimeDesc(coachId);
    }

    public List<GroupClass> getAvailableGroupClasses() {
        return groupClassRepository.findByStatusOrderByClassDateAscStartTimeAsc("ACTIVE");
    }

    public GroupClassParticipation participate(Long groupClassId, Long clientId) {

        GroupClass groupClass = groupClassRepository.findById(groupClassId)
                .orElseThrow(() -> new RuntimeException("Cours collectif introuvable."));

        if (!"ACTIVE".equals(groupClass.getStatus())) {
            throw new RuntimeException("Ce cours collectif n'est plus disponible.");
        }

        if (groupClass.getClassDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Impossible de participer à un cours passé.");
        }

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client introuvable."));

        boolean alreadyParticipating =
                participationRepository.existsByGroupClassIdAndClientId(groupClassId, clientId);

        if (alreadyParticipating) {
            throw new RuntimeException("Vous participez déjà à ce cours collectif.");
        }

        long participantsCount =
                participationRepository.countByGroupClassId(groupClassId);

        if (participantsCount >= groupClass.getMaxParticipants()) {
            throw new RuntimeException("Ce cours collectif est complet.");
        }

        GroupClassParticipation participation = new GroupClassParticipation();
        participation.setGroupClass(groupClass);
        participation.setClient(client);
        participation.setParticipationDate(LocalDate.now());

        return participationRepository.save(participation);
    }

    public long countParticipants(Long groupClassId) {
        return participationRepository.countByGroupClassId(groupClassId);
    }

    public boolean isParticipating(Long groupClassId, Long clientId) {
        return participationRepository.existsByGroupClassIdAndClientId(
                groupClassId,
                clientId
        );
    }

    public void cancelParticipation(Long groupClassId, Long clientId) {

        GroupClassParticipation participation =
                participationRepository.findByGroupClassIdAndClientId(groupClassId, clientId)
                        .orElseThrow(() ->
                                new RuntimeException("Participation introuvable."));

        participationRepository.delete(participation);
    }
}