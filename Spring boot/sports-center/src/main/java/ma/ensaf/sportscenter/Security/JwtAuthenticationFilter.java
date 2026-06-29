package ma.ensaf.sportscenter.Security;

import ma.ensaf.sportscenter.Entity.User;
import ma.ensaf.sportscenter.Repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        System.out.println("JWT FILTER CALLED FOR: " + request.getMethod() + " " + request.getRequestURI());

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if (!jwtService.isTokenValid(token)) {
            System.out.println("JWT TOKEN INVALID");
            filterChain.doFilter(request, response);
            return;
        }

        String email = jwtService.extractEmail(token);

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            System.out.println("JWT USER NOT FOUND");
            filterChain.doFilter(request, response);
            return;
        }

        String role = String.valueOf(user.getRole()).trim().toUpperCase();

        if (role.startsWith("ROLE_")) {
            role = role.substring(5);
        }

        SimpleGrantedAuthority authorityWithoutPrefix =
                new SimpleGrantedAuthority(role);

        SimpleGrantedAuthority authorityWithPrefix =
                new SimpleGrantedAuthority("ROLE_" + role);

        System.out.println("JWT USER: " + user.getEmail());
        System.out.println("JWT ROLE FROM DB: " + user.getRole());
        System.out.println("JWT AUTHORITY 1: " + authorityWithoutPrefix.getAuthority());
        System.out.println("JWT AUTHORITY 2: " + authorityWithPrefix.getAuthority());

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        null,
                        List.of(authorityWithoutPrefix, authorityWithPrefix)
                );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }
}