package ma.ensaf.sportscenter.Service;

import ma.ensaf.sportscenter.Entity.CoachRequest;
import ma.ensaf.sportscenter.Service.NotificationService;
import ma.ensaf.sportscenter.Repository.CoachRequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CoachRequestService {

    private final CoachRequestRepository coachRequestRepository;
    private final NotificationService notificationService;

    public CoachRequestService(
            CoachRequestRepository coachRequestRepository,
            NotificationService notificationService
    ) {
        this.coachRequestRepository = coachRequestRepository;
        this.notificationService = notificationService;
    }

    public CoachRequest createRequest(CoachRequest coachRequest) {

        if (!coachRequest.getRequestDate().isAfter(LocalDate.now())) {
            throw new RuntimeException(
                    "Les demandes de coach doivent être faites au minimum un jour à l’avance."
            );
        }

        List<CoachRequest> existingRequests =
                coachRequestRepository
                        .findByClientIdAndCoachIdAndActivityAndRequestDateAndRequestTimeAndStatusIn(
                                coachRequest.getClient().getId(),
                                coachRequest.getCoach().getId(),
                                coachRequest.getActivity(),
                                coachRequest.getRequestDate(),
                                coachRequest.getRequestTime(),
                                List.of("PENDING", "ACCEPTED")
                        );

        if (!existingRequests.isEmpty()) {
            throw new RuntimeException(
                    "Vous avez déjà envoyé une demande pour ce coach sur ce créneau."
            );
        }

        coachRequest.setStatus("PENDING");
        coachRequest.setHiddenByClient(false);
        coachRequest.setHiddenByCoach(false);

        CoachRequest savedRequest = coachRequestRepository.save(coachRequest);

        notificationService.createNewCoachRequestNotification(savedRequest);

        return savedRequest;
    }

    public CoachRequest acceptRequest(Long id) {

        CoachRequest request = coachRequestRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Demande introuvable"));

        List<CoachRequest> acceptedRequestsAtSameTime =
                coachRequestRepository.findByCoachIdAndRequestDateAndRequestTimeAndStatus(
                        request.getCoach().getId(),
                        request.getRequestDate(),
                        request.getRequestTime(),
                        "ACCEPTED"
                );

        if (!acceptedRequestsAtSameTime.isEmpty()) {
            throw new RuntimeException(
                    "Une séance est déjà acceptée sur ce créneau."
            );
        }

        request.setStatus("ACCEPTED");

        CoachRequest savedRequest = coachRequestRepository.save(request);

        notificationService.createCoachRequestAcceptedNotification(savedRequest);

        return savedRequest;
    }

    public CoachRequest rejectRequest(Long id) {

        CoachRequest request = coachRequestRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Demande introuvable"));

        request.setStatus("REJECTED");

        CoachRequest savedRequest = coachRequestRepository.save(request);

        notificationService.createCoachRequestRejectedNotification(savedRequest);

        return savedRequest;
    }

    public void updatePastCoachRequestsStatus() {

        List<CoachRequest> acceptedRequests =
                coachRequestRepository.findByStatus("ACCEPTED");

        List<CoachRequest> pendingRequests =
                coachRequestRepository.findByStatus("PENDING");

        LocalDateTime now = LocalDateTime.now();

        for (CoachRequest request : acceptedRequests) {

            LocalDateTime sessionEndDateTime =
                    LocalDateTime.of(
                            request.getRequestDate(),
                            request.getRequestTime().plusHours(2)
                    );

            if (sessionEndDateTime.isBefore(now)) {
                request.setStatus("COMPLETED");
                coachRequestRepository.save(request);
            }
        }

        for (CoachRequest request : pendingRequests) {

            LocalDateTime requestDateTime =
                    LocalDateTime.of(
                            request.getRequestDate(),
                            request.getRequestTime()
                    );

            if (requestDateTime.isBefore(now)) {
                request.setStatus("EXPIRED");
                coachRequestRepository.save(request);
            }
        }
    }

    public List<CoachRequest> getVisibleRequestsByClient(Long clientId) {

        updatePastCoachRequestsStatus();

        List<CoachRequest> allClientRequests =
                coachRequestRepository.findByClientId(clientId);

        List<CoachRequest> visibleRequests = new ArrayList<>();

        LocalDate today = LocalDate.now();

        for (CoachRequest request : allClientRequests) {

            boolean isOldCompleted =
                    "COMPLETED".equals(request.getStatus())
                            && request.getRequestDate().isBefore(today);

            boolean isOldCancelled =
                    "CANCELLED".equals(request.getStatus())
                            && request.getRequestDate().isBefore(today);

            boolean isHiddenByClient =
                    request.isHiddenByClient();

            if (!isOldCompleted && !isOldCancelled && !isHiddenByClient) {
                visibleRequests.add(request);
            }
        }

        return visibleRequests;
    }

    public List<CoachRequest> getVisibleRequestsByCoach(Long coachId) {

        updatePastCoachRequestsStatus();

        List<CoachRequest> allCoachRequests =
                coachRequestRepository.findByCoachId(coachId);

        List<CoachRequest> visibleRequests = new ArrayList<>();

        LocalDate today = LocalDate.now();

        for (CoachRequest request : allCoachRequests) {

            boolean isOldCompleted =
                    "COMPLETED".equals(request.getStatus())
                            && request.getRequestDate().isBefore(today);

            boolean isOldCancelled =
                    "CANCELLED".equals(request.getStatus())
                            && request.getRequestDate().isBefore(today);

            boolean isHiddenByCoach =
                    request.isHiddenByCoach();

            if (!isOldCompleted && !isOldCancelled && !isHiddenByCoach) {
                visibleRequests.add(request);
            }
        }

        return visibleRequests;
    }

    public CoachRequest hideRequestForClient(Long id) {

        CoachRequest request = coachRequestRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Demande introuvable."));

        boolean canBeHidden =
                "REJECTED".equals(request.getStatus()) ||
                        "CANCELLED".equals(request.getStatus()) ||
                        "EXPIRED".equals(request.getStatus()) ||
                        "COMPLETED".equals(request.getStatus());

        if (!canBeHidden) {
            throw new RuntimeException(
                    "Seules les demandes refusées, annulées, expirées ou terminées peuvent être masquées."
            );
        }

        request.setHiddenByClient(true);

        return coachRequestRepository.save(request);
    }

    public CoachRequest hideRequestForCoach(Long id) {

        CoachRequest request = coachRequestRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Demande introuvable."));

        boolean canBeHidden =
                "REJECTED".equals(request.getStatus()) ||
                        "CANCELLED".equals(request.getStatus()) ||
                        "EXPIRED".equals(request.getStatus()) ||
                        "COMPLETED".equals(request.getStatus());

        if (!canBeHidden) {
            throw new RuntimeException(
                    "Seules les demandes refusées, annulées, expirées ou terminées peuvent être masquées."
            );
        }

        request.setHiddenByCoach(true);

        return coachRequestRepository.save(request);
    }
}