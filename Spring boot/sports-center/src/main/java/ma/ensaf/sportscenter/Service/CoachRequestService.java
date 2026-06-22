package ma.ensaf.sportscenter.Service;

import ma.ensaf.sportscenter.Entity.CoachRequest;
import ma.ensaf.sportscenter.Repository.CoachRequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CoachRequestService {

    private final CoachRequestRepository coachRequestRepository;

    public CoachRequestService(
            CoachRequestRepository coachRequestRepository) {
        this.coachRequestRepository = coachRequestRepository;
    }

    public CoachRequest createRequest(CoachRequest coachRequest) {

        if (!coachRequest.getRequestDate().isAfter(LocalDate.now())) {
            throw new RuntimeException(
                    "Les demandes de coach doivent être faites au minimum un jour à l’avance."
            );
        }

        coachRequest.setStatus("PENDING");
        coachRequest.setHiddenByClient(false);
        coachRequest.setHiddenByCoach(false);

        return coachRequestRepository.save(coachRequest);
    }

    public CoachRequest acceptRequest(Long id) {

        CoachRequest request = coachRequestRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Demande introuvable"));

        request.setStatus("ACCEPTED");

        return coachRequestRepository.save(request);
    }

    public CoachRequest rejectRequest(Long id) {

        CoachRequest request = coachRequestRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Demande introuvable"));

        request.setStatus("REJECTED");

        return coachRequestRepository.save(request);
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
                        "EXPIRED".equals(request.getStatus());

        if (!canBeHidden) {
            throw new RuntimeException(
                    "Seules les demandes refusées, annulées ou expirées peuvent être masquées."
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