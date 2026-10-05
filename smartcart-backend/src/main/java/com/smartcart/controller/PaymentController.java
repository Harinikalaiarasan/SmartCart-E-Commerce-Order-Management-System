package com.smartcart.controller;

import com.razorpay.RazorpayException;
import com.smartcart.dto.RazorpayVerificationRequest;
import com.smartcart.entity.Payment;
import com.smartcart.service.PaymentService;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(
            PaymentService paymentService) {

        this.paymentService =
                paymentService;
    }


    // ============================
    // Existing COD Payment
    // ============================

    @PostMapping("/process")
    public ResponseEntity<Payment> processPayment(
            @RequestParam Long orderId,
            @RequestParam String paymentMethod) {

        return ResponseEntity.ok(
                paymentService.processPayment(
                        orderId,
                        paymentMethod
                )
        );
    }


    // ============================
    // Create Razorpay Order
    // ============================

    @PostMapping("/razorpay/create-order")
    public ResponseEntity<?> createRazorpayOrder(
            @RequestParam Long orderId) {

        try {

            JSONObject response =
                    paymentService.createRazorpayOrder(
                            orderId
                    );

            return ResponseEntity.ok(
                    response.toMap()
            );

        } catch (RazorpayException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Razorpay order creation failed: "
                                    + e.getMessage()
                    );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Order creation failed: "
                                    + e.getMessage()
                    );
        }
    }


    // ============================
    // Verify Razorpay Payment
    // ============================

    @PostMapping("/razorpay/verify")
    public ResponseEntity<?> verifyRazorpayPayment(
            @RequestBody RazorpayVerificationRequest request) {

        try {

            Payment payment =
                    paymentService.verifyRazorpayPayment(
                            request.getOrderId(),
                            request.getRazorpayPaymentId(),
                            request.getRazorpayOrderId(),
                            request.getRazorpaySignature()
                    );

            return ResponseEntity.ok(payment);

        } catch (RazorpayException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Razorpay verification failed: "
                                    + e.getMessage()
                    );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Payment verification failed: "
                                    + e.getMessage()
                    );
        }
    }


    // ============================
    // Get Payment
    // ============================

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Payment> getPaymentByOrderId(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                paymentService.getPaymentByOrderId(
                        orderId
                )
        );
    }


    // ============================
    // Update Payment Status
    // ============================

    @PutMapping("/{paymentId}/status")
    public ResponseEntity<Payment> updatePaymentStatus(
            @PathVariable Long paymentId,
            @RequestParam String status) {

        return ResponseEntity.ok(
                paymentService.updatePaymentStatus(
                        paymentId,
                        status
                )
        );
    }
}