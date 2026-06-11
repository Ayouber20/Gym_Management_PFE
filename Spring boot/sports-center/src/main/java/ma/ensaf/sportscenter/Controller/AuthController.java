package ma.ensaf.sportscenter.Controller;

import ma.ensaf.sportscenter.Entity.User;
import ma.ensaf.sportscenter.Repository.UserRepository;
import ma.ensaf.sportscenter.Security.JwtService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {

        String email = loginData.get("email");
        String password = loginData.get("password");

        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Email ou mot de passe incorrect.");
            return ResponseEntity.status(401).body(error);
        }

        User user = optionalUser.get();

        boolean passwordMatches;

        if (user.getPassword().startsWith("$2a$") || user.getPassword().startsWith("$2b$")) {
            passwordMatches = passwordEncoder.matches(password, user.getPassword());
        } else {
            passwordMatches = user.getPassword().equals(password);

            if (passwordMatches) {
                user.setPassword(passwordEncoder.encode(password));
                userRepository.save(user);
            }
        }

        if (!passwordMatches) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Email ou mot de passe incorrect.");
            return ResponseEntity.status(401).body(error);
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("firstName", user.getFirstName());
        userData.put("lastName", user.getLastName());
        userData.put("email", user.getEmail());
        userData.put("role", user.getRole());

        response.put("user", userData);

        return ResponseEntity.ok(response);
    }
}