package com.smartcart.controller;

import com.smartcart.dto.LoginRequestDTO;
import com.smartcart.dto.OtpRequestDTO;
import com.smartcart.dto.UserResponseDTO;
import com.smartcart.dto.VerifyOtpRequestDTO;
import com.smartcart.entity.User;
import com.smartcart.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ================= REGISTER =================

    @PostMapping("/register")
    public UserResponseDTO register(@RequestBody User user) {

        User savedUser = userService.registerUser(user);

        return new UserResponseDTO(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getAddress(),
                savedUser.getVerified(),
                savedUser.getRole()
        );
    }

    // ================= VERIFY OTP =================

    @PostMapping("/verify-otp")
    public Map<String, String> verifyOtp(
            @RequestBody VerifyOtpRequestDTO request) {

        User user = userService.verifyOtp(
                request.getEmail(),
                request.getOtp()
        );

        return Map.of(
                "message", "OTP verified successfully",
                "email", user.getEmail(),
                "status", "VERIFIED"
        );
    }

    // ================= LOGIN =================

    @PostMapping("/login")
    public Map<String, Object> login(
            @RequestBody LoginRequestDTO loginRequest) {

        User user = userService.loginUser(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );

        String token = userService.generateToken(user);

        return Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "phone", user.getPhone(),
                "address", user.getAddress(),
                "verified", user.getVerified(),
                "role", user.getRole(),
                "token", token
        );
    }

    // ================= SEND OTP =================

    @PostMapping("/send-otp")
    public Map<String, String> sendOtp(
            @RequestBody OtpRequestDTO request) {

        User user = userService.generateOtp(
                request.getEmail()
        );

        return Map.of(
                "message", "OTP generated successfully",
                "email", user.getEmail(),
                "otp", user.getOtp()
        );
    }
}