package com.smartcart.config;

import com.smartcart.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }

    // ================= PASSWORD ENCODER =================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    // ================= CORS =================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173",
                        "https://smartcart-e-commerce-order-management.netlify.app"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    // ================= SECURITY =================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

                // CORS
                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                // CSRF disabled for REST API
                .csrf(AbstractHttpConfigurer::disable)

                // Stateless JWT authentication
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // Authorization rules
                .authorizeHttpRequests(auth -> auth

                        // ================= PUBLIC =================

                        .requestMatchers(
                                "/api/users/register",
                                "/api/users/login",
                                "/api/users/send-otp",
                                "/api/users/verify-otp"
                        ).permitAll()

                        // Products are public
                        .requestMatchers(
                                "/api/products/**"
                        ).permitAll()


                        // ================= CART =================

                        // Cart requires login
                        .requestMatchers(
                                "/api/cart/**"
                        ).authenticated()


                        // ================= ORDERS =================

                        // Customer can place order
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/orders/place"
                        ).authenticated()

                        // Customer can view their orders
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/user/**"
                        ).authenticated()

                        // Customer/Admin can view individual order
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/*"
                        ).authenticated()

                        // ONLY ADMIN can view ALL orders
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders"
                        ).hasRole("ADMIN")

                        // ONLY ADMIN can change order status
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/orders/*/status"
                        ).hasRole("ADMIN")


                        // ================= PAYMENTS =================

                        // Logged-in users can use payment APIs
                        .requestMatchers(
                                "/api/payments/**"
                        ).authenticated()


                        // ================= ORDER ITEMS =================

                        .requestMatchers(
                                "/api/order-items/**"
                        ).authenticated()


                        // ================= EVERYTHING ELSE =================

                        .anyRequest().authenticated()
                )

                // JWT filter
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}