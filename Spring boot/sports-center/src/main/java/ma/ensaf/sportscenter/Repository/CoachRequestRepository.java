package ma.ensaf.sportscenter.Repository;

import ma.ensaf.sportscenter.Entity.CoachRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface CoachRequestRepository
        extends JpaRepository<CoachRequest, Long> {
    List<CoachRequest> findByClientId(Long clientId);

    List<CoachRequest> findByRequestDateAndStatus(LocalDate requestDate, String status);

    List<CoachRequest> findByClientIdAndRequestDateAndStatus(Long clientId, LocalDate requestDate, String status);

    List<CoachRequest> findByCoachIdAndRequestDateAndStatus(Long coachId, LocalDate requestDate, String status);

    List<CoachRequest> findByStatus(String status);

    List<CoachRequest> findByCoachId(Long coachId);

    List<CoachRequest> findByCoachIdAndRequestDateBetweenAndStatus(
            Long coachId,
            LocalDate startDate,
            LocalDate endDate,
            String status
    );

    List<CoachRequest> findByCoachIdAndRequestDateAndRequestTimeAndStatus(
            Long coachId,
            LocalDate requestDate,
            LocalTime requestTime,
            String status
    );

    List<CoachRequest> findByClientIdAndCoachIdAndActivityAndRequestDateAndRequestTimeAndStatusIn(
            Long clientId,
            Long coachId,
            String activity,
            LocalDate requestDate,
            LocalTime requestTime,
            List<String> statuses
    );
}