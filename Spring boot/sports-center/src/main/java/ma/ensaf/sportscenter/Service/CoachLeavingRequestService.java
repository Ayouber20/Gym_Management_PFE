package ma.ensaf.sportscenter.Service;

import ma.ensaf.sportscenter.Entity.CoachLeavingRequest;
import ma.ensaf.sportscenter.Entity.CoachRequest;
import ma.ensaf.sportscenter.Repository.CoachLeavingRequestRepository;
import ma.ensaf.sportscenter.Repository.CoachRequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CoachLeavingRequestService {

    private final CoachLeavingRequestRepository coachLeavingRequestRepository;
    private final CoachRequestRepository coachRequestRepository;
    private final NotificationService notificationService;

    public CoachLeavingRequestService(
            CoachLeavingRequestRepository coachLeaveRequestRepository,
            CoachRequestRepository coachRequestRepository,
            NotificationService notificationService) {

        this.coachLeavingRequestRepository = coachLeaveRequestRepository;
        this.coachRequestRepository = coachRequestRepository;
        this.notificationService = notificationService;
    }

    public CoachLeavingRequest createLeaveRequest(CoachLeavingRequest leaveRequest) {

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

        leaveRequest.setStatus("PENDING");

        return coachLeavingRequestRepository.save(leaveRequest);
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