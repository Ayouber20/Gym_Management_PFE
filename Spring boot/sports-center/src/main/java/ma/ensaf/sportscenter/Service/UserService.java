package ma.ensaf.sportscenter.Service;

import ma.ensaf.sportscenter.Dto.ChangePasswordRequest;
import ma.ensaf.sportscenter.Entity.User;
import ma.ensaf.sportscenter.Repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void changePassword(ChangePasswordRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("Utilisateur introuvable."));

        if (!passwordEncoder.matches(
                request.getOldPassword(),
                user.getPassword())) {

            throw new RuntimeException("Ancien mot de passe incorrect.");
        }

        if (request.getNewPassword() == null ||
                request.getNewPassword().trim().length() < 6) {

            throw new RuntimeException(
                    "Le nouveau mot de passe doit contenir au moins 6 caractères."
            );
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);
    }
}