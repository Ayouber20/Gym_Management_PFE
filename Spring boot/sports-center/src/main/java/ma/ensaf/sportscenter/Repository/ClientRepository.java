package ma.ensaf.sportscenter.Repository;

import ma.ensaf.sportscenter.Entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, Long> {
}
