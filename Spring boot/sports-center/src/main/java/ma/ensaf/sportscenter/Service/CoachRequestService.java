package ma.ensaf.sportscenter.Service;

import ma.ensaf.sportscenter.Entity.CoachRequest;
import ma.ensaf.sportscenter.Repository.CoachRequestRepository;
import org.springframework.stereotype.Service;

@Service
public class CoachRequestService {

    private final CoachRequestRepository coachRequestRepository;

    public CoachRequestService(
            CoachRequestRepository coachRequestRepository) {
        this.coachRequestRepository = coachRequestRepository;
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
