package ma.ensaf.sportscenter.Repository;

import ma.ensaf.sportscenter.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
