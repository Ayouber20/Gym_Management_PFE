package ma.ensaf.sportscenter.Repository;

import ma.ensaf.sportscenter.Entity.GroupClass;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupClassRepository extends JpaRepository<GroupClass, Long> {

    List<GroupClass> findByCoachIdOrderByClassDateDescStartTimeDesc(Long coachId);

    List<GroupClass> findByStatusOrderByClassDateAscStartTimeAsc(String status);
}