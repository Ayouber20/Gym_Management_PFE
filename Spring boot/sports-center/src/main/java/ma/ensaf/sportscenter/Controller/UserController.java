package ma.ensaf.sportscenter.Controller;

import org.springframework.security.crypto.password.PasswordEncoder;

import ma.ensaf.sportscenter.Entity.User;
import ma.ensaf.sportscenter.Repository.UserRepository;
import ma.ensaf.sportscenter.Dto.ChangePasswordRequest;
import ma.ensaf.sportscenter.Service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    public UserController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            UserService userService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {

        boolean emailExists = userRepository.findByEmail(user.getEmail()).isPresent();

        if (emailExists) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Cet email est déjà utilisé.");

            return ResponseEntity
                    .badRequest()
                    .body(error);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User savedUser = userRepository.save(user);

        return ResponseEntity.ok(savedUser);
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request) {

        userService.changePassword(request);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Mot de passe modifié avec succès.");

        return ResponseEntity.ok(response);
    }
}