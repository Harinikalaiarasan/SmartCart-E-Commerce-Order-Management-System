package com.smartcart.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String email, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(email);
        message.setSubject("SmartCart - Email Verification OTP");

        message.setText(
                "Hello,\n\n" +
                        "Your SmartCart verification OTP is: " + otp + "\n\n" +
                        "This OTP is valid for 5 minutes.\n\n" +
                        "Thank you,\n" +
                        "SmartCart Team"
        );

        try {
            mailSender.send(message);
            System.out.println("OTP successfully sent via email to: " + email);
        } catch (Exception e) {
            System.err.println("SMTP delivery failed (" + e.getMessage() + "). [SmartCart Dev Mode] Verification OTP is: " + otp);
        }
    }
}
