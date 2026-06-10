package ma.ensaf.sportscenter.Controller;

import ma.ensaf.sportscenter.Entity.Client;
import ma.ensaf.sportscenter.Repository.ClientRepository;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "http://localhost:4200")
public class ClientController {

    private final ClientRepository clientRepository;

    public ClientController(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    @GetMapping
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    @GetMapping("/user/{userId}")
    public Client getClientByUserId(@PathVariable Long userId) {
        return clientRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Client introuvable pour cet utilisateur."));
    }

    @PostMapping
    public ResponseEntity<?> createClient(@RequestBody Client client) {

        Long userId = client.getUser().getId();

        boolean exists = clientRepository.findByUserId(userId).isPresent();

        if (exists) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Cet utilisateur possède déjà un profil client.");

            return ResponseEntity
                    .badRequest()
                    .body(error);
        }

        Client savedClient = clientRepository.save(client);

        return ResponseEntity.ok(savedClient);
    }
}