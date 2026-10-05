package com.smartcart.service;

import com.smartcart.entity.User;
import com.smartcart.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       EmailService emailService,
                       JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.jwtService = jwtService;
    }

    // ================= REGISTER =================

    public User registerUser(User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        user.setVerified(false);

        // Every normal registration is USER
        user.setRole("USER");

        return userRepository.save(user);
    }

    // ================= LOGIN =================

    public User loginUser(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            throw new RuntimeException("Invalid password");
        }

        if (!Boolean.TRUE.equals(user.getVerified())) {

            throw new RuntimeException(
                    "Please verify your email using OTP before login"
            );
        }

        return user;
    }

    // ================= JWT TOKEN =================

    public String generateToken(User user) {

        return jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole()
        );
    }

    // ================= GENERATE OTP =================

    public User generateOtp(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        SecureRandom random = new SecureRandom();

        String otp = String.format(
                "%06d",
                random.nextInt(1_000_000)
        );

        user.setOtp(otp);

        user.setOtpExpiry(
                LocalDateTime.now().plusMinutes(5)
        );

        emailService.sendOtpEmail(email, otp);

        return userRepository.save(user);
    }

    // ================= VERIFY OTP =================

    public User verifyOtp(String email, String otp) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getOtp() == null) {

            throw new RuntimeException(
                    "OTP not generated"
            );
        }

        if (!user.getOtp().equals(otp)) {

            throw new RuntimeException(
                    "Invalid OTP"
            );
        }

        if (user.getOtpExpiry() == null ||
                user.getOtpExpiry()
                        .isBefore(LocalDateTime.now())) {

            throw new RuntimeException(
                    "OTP expired"
            );
        }

        user.setVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);

        return userRepository.save(user);
    }
}