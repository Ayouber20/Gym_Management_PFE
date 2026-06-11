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

                        // Public login
                        .requestMatchers("/api/auth/login").permitAll()

                        // Admin
                        .requestMatchers("/api/users/**").hasRole("ADMIN")

                        // Client profile lookup
                        .requestMatchers(HttpMethod.GET, "/api/clients/user/**")
                        .hasAnyRole("CLIENT", "ADMIN")

                        // Coach profile lookup
                        .requestMatchers(HttpMethod.GET, "/api/coaches/user/**")
                        .hasAnyRole("COACH", "ADMIN")

                        // Client management
                        .requestMatchers("/api/clients/**").hasRole("ADMIN")

                        // Coaches list can be useful for client coach request page
                        .requestMatchers(HttpMethod.GET, "/api/coaches/**")
                        .hasAnyRole("CLIENT", "COACH", "ADMIN")

                        // Coach management
                        .requestMatchers("/api/coaches/**").hasRole("ADMIN")

                        // Courts
                        .requestMatchers("/api/courts/**")
                        .hasAnyRole("ADMIN", "CLIENT")

                        // Reservations
                        .requestMatchers("/api/reservations/**")
                        .hasAnyRole("ADMIN", "CLIENT")

                        // Coach requests
                        .requestMatchers("/api/coach-requests/**")
                        .hasAnyRole("ADMIN", "CLIENT", "COACH")

                        // Everything else needs authentication
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

                config.setAllowedOrigins(List.of("http://localhost:4200"));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
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