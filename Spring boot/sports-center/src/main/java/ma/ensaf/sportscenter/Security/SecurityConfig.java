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
                        .hasAnyAuthority("ROLE_CLIENT", "ROLE_COACH", "ROLE_ADMIN")
                        
                        .requestMatchers("/api/users", "/api/users/**")
                        .hasAuthority("ROLE_ADMIN")



                        // CLIENTS
                        .requestMatchers(HttpMethod.GET, "/api/clients/user/**")
                        .hasAnyAuthority("ROLE_CLIENT", "ROLE_ADMIN")

                        .requestMatchers("/api/clients", "/api/clients/**")
                        .hasAuthority("ROLE_ADMIN")

                        // COACHES
                        .requestMatchers(HttpMethod.GET, "/api/coaches/user/**")
                        .hasAnyAuthority("ROLE_COACH", "ROLE_ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/coaches", "/api/coaches/**")
                        .hasAnyAuthority("ROLE_CLIENT", "ROLE_COACH", "ROLE_ADMIN")

                        .requestMatchers("/api/coaches", "/api/coaches/**")
                        .hasAuthority("ROLE_ADMIN")

                        // COURTS
                        .requestMatchers("/api/courts/*/maintenance")
                        .hasAuthority("ROLE_ADMIN")

                        .requestMatchers("/api/courts/*/available")
                        .hasAuthority("ROLE_ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/courts", "/api/courts/**")
                        .hasAnyAuthority("ROLE_CLIENT", "ROLE_ADMIN")

                        .requestMatchers("/api/courts", "/api/courts/**")
                        .hasAuthority("ROLE_ADMIN")

                        // RESERVATIONS
                        .requestMatchers(HttpMethod.PUT, "/api/reservations/*/hide-for-client")
                        .hasAuthority("ROLE_CLIENT")

                        .requestMatchers(HttpMethod.GET, "/api/reservations/client/**")
                        .hasAnyAuthority("ROLE_CLIENT", "ROLE_ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/reservations", "/api/reservations/**")
                        .hasAnyAuthority("ROLE_CLIENT", "ROLE_ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/reservations", "/api/reservations/**")
                        .hasAnyAuthority("ROLE_CLIENT", "ROLE_ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/reservations", "/api/reservations/**")
                        .hasAuthority("ROLE_ADMIN")

                        // COACH REQUESTS
                        .requestMatchers(HttpMethod.POST, "/api/coach-requests", "/api/coach-requests/**")
                        .hasAuthority("ROLE_CLIENT")

                        .requestMatchers(HttpMethod.PUT, "/api/coach-requests/*/hide-for-client")
                        .hasAuthority("ROLE_CLIENT")

                        .requestMatchers("/api/coach-requests/*/accept")
                        .hasAnyAuthority("ROLE_COACH", "ROLE_ADMIN")

                        .requestMatchers("/api/coach-requests/*/reject")
                        .hasAnyAuthority("ROLE_COACH", "ROLE_ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/coach-requests", "/api/coach-requests/**")
                        .hasAnyAuthority("ROLE_CLIENT", "ROLE_COACH", "ROLE_ADMIN")

                        .requestMatchers("/api/coach-requests", "/api/coach-requests/**")
                        .hasAuthority("ROLE_ADMIN")

                        // NOTIFICATIONS
                        .requestMatchers(HttpMethod.GET, "/api/notifications/client/**")
                        .hasAuthority("ROLE_CLIENT")

                        .requestMatchers(HttpMethod.GET, "/api/notifications/coach/**")
                        .hasAuthority("ROLE_COACH")

                        .requestMatchers(HttpMethod.GET, "/api/notifications/admin")
                        .hasAuthority("ROLE_ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/notifications/*/read")
                        .hasAnyAuthority("ROLE_CLIENT", "ROLE_COACH", "ROLE_ADMIN")

                        // COACH LEAVES
                        .requestMatchers(HttpMethod.POST, "/api/coach-leaves", "/api/coach-leaves/**")
                        .hasAuthority("ROLE_COACH")

                        .requestMatchers(HttpMethod.PUT, "/api/coach-leaves/*/accept")
                        .hasAuthority("ROLE_ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/coach-leaves/*/reject")
                        .hasAuthority("ROLE_ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/coach-leaves", "/api/coach-leaves/**")
                        .hasAnyAuthority("ROLE_COACH", "ROLE_ADMIN")

                        .requestMatchers("/api/coach-leaves", "/api/coach-leaves/**")
                        .hasAuthority("ROLE_ADMIN")

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