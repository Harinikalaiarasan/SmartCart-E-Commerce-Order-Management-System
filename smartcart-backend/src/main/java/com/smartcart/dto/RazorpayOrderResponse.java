package com.smartcart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RazorpayOrderResponse {

    private String razorpayOrderId;
    private Long smartCartOrderId;
    private Double amount;
    private String currency;
    private String keyId;
}
