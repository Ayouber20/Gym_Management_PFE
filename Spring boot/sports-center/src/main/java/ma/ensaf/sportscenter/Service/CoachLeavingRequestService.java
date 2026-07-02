package ma.ensaf.sportscenter.Service;

import ma.ensaf.sportscenter.Entity.Coach;
import ma.ensaf.sportscenter.Entity.CoachLeavingRequest;
import ma.ensaf.sportscenter.Entity.CoachRequest;
import ma.ensaf.sportscenter.Repository.CoachLeavingRequestRepository;
import ma.ensaf.sportscenter.Repository.CoachRepository;
import ma.ensaf.sportscenter.Repository.CoachRequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CoachLeavingRequestService {

    private final CoachLeavingRequestRepository coachLeavingRequestRepository;
    private final CoachRequestRepository coachRequestRepository;
    private final CoachRepository coachRepository;
    private final NotificationService notificationService;

    public CoachLeavingRequestService(
            CoachLeavingRequestRepository coachLeaveRequestRepository,
            CoachRequestRepository coachRequestRepository,
            CoachRepository coachRepository,
            NotificationService notificationService) {

        this.coachLeavingRequestRepository = coachLeaveRequestRepository;
        this.coachRequestRepository = coachRequestRepository;
        this.coachRepository = coachRepository;
        this.notificationService = notificationService;
    }

    public CoachLeavingRequest createLeaveRequest(CoachLeavingRequest leaveRequest) {

        if (leaveRequest.getStartDate() == null || leaveRequest.getEndDate() == null) {
            throw new RuntimeException(
                    "Veuillez choisir une date de début et une date de fin."
            );
        }

        if (!leaveRequest.getStartDate().isAfter(LocalDate.now())) {
            throw new RuntimeException(
                    "La demande de congé doit commencer au minimum demain."
            );
        }

        if (leaveRequest.getEndDate().isBefore(leaveRequest.getStartDate())) {
            throw new RuntimeException(
                    "La date de fin doit être après ou égale à la date de début."
            );
        }

        if (leaveRequest.getCoach() == null || leaveRequest.getCoach().getId() == null) {
            throw new RuntimeException("Coach introuvable.");
        }

        Coach coach = coachRepository.findById(leaveRequest.getCoach().getId())
                .orElseThrow(() ->
                        new RuntimeException("Coach introuvable."));

        List<CoachLeavingRequest> existingLeaves =
                coachLeavingRequestRepository.findByCoachIdAndStatusIn(
                        coach.getId(),
                        List.of("PENDING", "ACCEPTED")
                );

        for (CoachLeavingRequest existingLeave : existingLeaves) {
            boolean overlap =
                    !leaveRequest.getEndDate().isBefore(existingLeave.getStartDate())
                            &&
                            !leaveRequest.getStartDate().isAfter(existingLeave.getEndDate());

            if (overlap) {
                throw new RuntimeException(
                        "Vous avez déjà une demande de congé sur cette période."
                );
            }
        }

        leaveRequest.setCoach(coach);
        leaveRequest.setStatus("PENDING");

        CoachLeavingRequest savedLeaveRequest =
                coachLeavingRequestRepository.save(leaveRequest);

        String coachName =
                coach.getUser().getFirstName()
                        + " "
                        + coach.getUser().getLastName();

        String message =
                "Nouvelle demande de congé envoyée par le coach "
                        + coachName
                        + " du "
                        + savedLeaveRequest.getStartDate()
                        + " au "
                        + savedLeaveRequest.getEndDate()
                        + ".";

        notificationService.createAdminNotification(
                "COACH_LEAVE_REQUEST",
                message,
                savedLeaveRequest.getStartDate(),
                null
        );

        return savedLeaveRequest;
    }

    public CoachLeavingRequest acceptLeaveRequest(Long id) {

        CoachLeavingRequest leaveRequest = coachLeavingRequestRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Demande de congé introuvable."));

        leaveRequest.setStatus("ACCEPTED");

        CoachLeavingRequest savedLeaveRequest =
                coachLeavingRequestRepository.save(leaveRequest);

        List<CoachRequest> sessionsToCancel =
                coachRequestRepository.findByCoachIdAndRequestDateBetweenAndStatus(
                        leaveRequest.getCoach().getId(),
                        leaveRequest.getStartDate(),
                        leaveRequest.getEndDate(),
                        "ACCEPTED"
                );

        for (CoachRequest session : sessionsToCancel) {
            session.setStatus("CANCELLED");
            coachRequestRepository.save(session);

            String message =
                    "Votre séance de coach du "
                            + session.getRequestDate()
                            + " à "
                            + session.getRequestTime()
                            + " a été annulée car le coach est en congé.";

            notificationService.createClientNotification(
                    session.getClient().getId(),
                    "COACH_SESSION_CANCELLED",
                    message,
                    session.getRequestDate(),
                    session.getRequestTime()
            );
        }

        return savedLeaveRequest;
    }

    public CoachLeavingRequest rejectLeaveRequest(Long id) {

        CoachLeavingRequest leaveRequest = coachLeavingRequestRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Demande de congé introuvable."));

        leaveRequest.setStatus("REJECTED");

        return coachLeavingRequestRepository.save(leaveRequest);
    }
}