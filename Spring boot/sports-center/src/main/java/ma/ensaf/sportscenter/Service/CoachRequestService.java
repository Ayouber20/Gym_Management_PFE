package ma.ensaf.sportscenter.Service;

import ma.ensaf.sportscenter.Entity.CoachRequest;
import ma.ensaf.sportscenter.Repository.CoachRequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

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
}