package ma.ensaf.sportscenter.Security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth

                        // Preflight CORS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Login public
                        .requestMatchers("/api/auth/login").permitAll()

                        // USERS
                        .requestMatchers(HttpMethod.PUT, "/api/users/change-password")
                        .hasAnyAuthority("ROLE_CLIENT", "CLIENT", "ROLE_COACH", "COACH", "ROLE_ADMIN", "ADMIN")

                        .requestMatchers("/api/users", "/api/users/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                        // CLIENTS
                        .requestMatchers(HttpMethod.GET, "/api/clients/user/**")
                        .hasAnyAuthority("ROLE_CLIENT", "CLIENT", "ROLE_ADMIN", "ADMIN")

                        .requestMatchers("/api/clients", "/api/clients/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                        // COACHES
                        .requestMatchers(HttpMethod.GET, "/api/coaches/user/**")
                        .hasAnyAuthority("ROLE_COACH", "COACH", "ROLE_ADMIN", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/coaches", "/api/coaches/**")
                        .hasAnyAuthority("ROLE_CLIENT", "CLIENT", "ROLE_COACH", "COACH", "ROLE_ADMIN", "ADMIN")

                        .requestMatchers("/api/coaches", "/api/coaches/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                        // COURTS
                        .requestMatchers("/api/courts/*/maintenance")
                        .hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                        .requestMatchers("/api/courts/*/available")
                        .hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/courts", "/api/courts/**")
                        .hasAnyAuthority("ROLE_CLIENT", "CLIENT", "ROLE_ADMIN", "ADMIN")

                        .requestMatchers("/api/courts", "/api/courts/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                        // RESERVATIONS
                        .requestMatchers(HttpMethod.PUT, "/api/reservations/*/hide-for-client")
                        .hasAnyAuthority("ROLE_CLIENT", "CLIENT")

                        .requestMatchers(HttpMethod.GET, "/api/reservations/client/**")
                        .hasAnyAuthority("ROLE_CLIENT", "CLIENT", "ROLE_ADMIN", "ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/reservations", "/api/reservations/**")
                        .hasAnyAuthority("ROLE_CLIENT", "CLIENT", "ROLE_ADMIN", "ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/reservations", "/api/reservations/**")
                        .hasAnyAuthority("ROLE_CLIENT", "CLIENT", "ROLE_ADMIN", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/reservations", "/api/reservations/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                        // COACH REQUESTS
                        .requestMatchers(HttpMethod.POST, "/api/coach-requests")
                        .hasAnyAuthority("ROLE_CLIENT", "CLIENT")

                        .requestMatchers(HttpMethod.GET, "/api/coach-requests/client/**")
                        .hasAnyAuthority("ROLE_CLIENT", "CLIENT", "ROLE_ADMIN", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/coach-requests/coach/**")
                        .hasAnyAuthority("ROLE_COACH", "COACH", "ROLE_ADMIN", "ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/coach-requests/*/accept")
                        .hasAnyAuthority("ROLE_COACH", "COACH", "ROLE_ADMIN", "ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/coach-requests/*/reject")
                        .hasAnyAuthority("ROLE_COACH", "COACH", "ROLE_ADMIN", "ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/coach-requests/*/hide-for-client")
                        .hasAnyAuthority("ROLE_CLIENT", "CLIENT")

                        .requestMatchers(HttpMethod.PUT, "/api/coach-requests/*/hide-for-coach")
                        .hasAnyAuthority("ROLE_COACH", "COACH")

                        .requestMatchers(HttpMethod.GET, "/api/coach-requests")
                        .hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                        // NOTIFICATIONS
                        .requestMatchers(HttpMethod.GET, "/api/notifications/client/**")
                        .hasAnyAuthority("ROLE_CLIENT", "CLIENT")

                        .requestMatchers(HttpMethod.GET, "/api/notifications/coach/**")
                        .hasAnyAuthority("ROLE_COACH", "COACH")

                        .requestMatchers(HttpMethod.GET, "/api/notifications/admin")
                        .hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/notifications/*/read")
                        .hasAnyAuthority("ROLE_CLIENT", "CLIENT", "ROLE_COACH", "COACH", "ROLE_ADMIN", "ADMIN")

                        // COACH LEAVES
                        .requestMatchers(HttpMethod.POST, "/api/coach-leaves", "/api/coach-leaves/**")
                        .hasAnyAuthority("ROLE_COACH", "COACH")

                        .requestMatchers(HttpMethod.PUT, "/api/coach-leaves/*/accept")
                        .hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/coach-leaves/*/reject")
                        .hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/coach-leaves", "/api/coach-leaves/**")
                        .hasAnyAuthority("ROLE_COACH", "COACH", "ROLE_ADMIN", "ADMIN")

                        .requestMatchers("/api/coach-leaves", "/api/coach-leaves/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                        // ANNOUNCEMENTS
                        .requestMatchers(HttpMethod.POST, "/api/announcements")
                        .hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/announcements")
                        .hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/announcements/*/disable")
                        .hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/announcements/*/activate")
                        .hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/announcements/*")
                        .hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/announcements/client")
                        .hasAnyAuthority("ROLE_CLIENT", "CLIENT")

                        .requestMatchers(HttpMethod.GET, "/api/announcements/coach")
                        .hasAnyAuthority("ROLE_COACH", "COACH")

                        // GROUP CLASSES
                        .requestMatchers(HttpMethod.POST, "/api/group-classes")
                        .hasAnyAuthority("ROLE_COACH", "COACH")

                        .requestMatchers(HttpMethod.GET, "/api/group-classes/coach/**")
                        .hasAnyAuthority("ROLE_COACH", "COACH", "ROLE_ADMIN", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/group-classes", "/api/group-classes/**")
                        .hasAnyAuthority("ROLE_CLIENT", "CLIENT", "ROLE_COACH", "COACH", "ROLE_ADMIN", "ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/group-classes/*/participate/*")
                        .hasAnyAuthority("ROLE_CLIENT", "CLIENT")

                        .requestMatchers(HttpMethod.GET, "/api/group-classes/*/participating/*")
                        .hasAnyAuthority("ROLE_CLIENT", "CLIENT")

                        .requestMatchers(HttpMethod.DELETE, "/api/group-classes/*/participate/*")
                        .hasAnyAuthority("ROLE_CLIENT", "CLIENT")

                        // Everything else
                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        return new CorsConfigurationSource() {
            @Override
            public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                CorsConfiguration config = new CorsConfiguration();

                config.setAllowedOriginPatterns(List.of(
                        "http://localhost:4200",
                        "http://127.0.0.1:4200"
                ));

                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setExposedHeaders(List.of("Authorization"));
                config.setAllowCredentials(true);

                return config;
            }
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {
        return configuration.getAuthenticationManager();
    }
}