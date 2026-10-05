package com.smartcart.dto;

import lombok.Data;

@Data
public class RazorpayVerificationRequest {

    private Long orderId;

    private String razorpayPaymentId;

    private String razorpayOrderId;

    private String razorpaySignature;
}