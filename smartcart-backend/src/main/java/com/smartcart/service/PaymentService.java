package com.smartcart.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.smartcart.entity.Payment;
import com.smartcart.repository.OrderRepository;
import com.smartcart.repository.PaymentRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            RazorpayClient razorpayClient) {

        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.razorpayClient = razorpayClient;
    }

    // ============================
    // COD / Existing Payment
    // ============================
    public Payment processPayment(
            Long orderId,
            String paymentMethod) {

        com.smartcart.entity.Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException("Order not found"));

        // Only COD should use this endpoint
        if (!"COD".equalsIgnoreCase(paymentMethod)) {
            throw new RuntimeException(
                    "This endpoint is only for COD payments"
            );
        }

        // Check order payment method
        if (!"COD".equalsIgnoreCase(order.getPaymentMethod())) {
            throw new RuntimeException(
                    "Order payment method is not COD"
            );
        }

        if (paymentRepository.findByOrder(order).isPresent()) {
            throw new RuntimeException(
                    "Payment already exists for this order"
            );
        }

        Payment payment = new Payment();

        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod("COD");
        payment.setPaymentStatus("SUCCESS");
        payment.setPaymentDate(LocalDateTime.now());

        return paymentRepository.save(payment);
    }


    // ============================
    // Create Razorpay Order
    // ============================

    public JSONObject createRazorpayOrder(Long orderId)
            throws RazorpayException {

        com.smartcart.entity.Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"
                                ));

        long amountInPaise =
                Math.round(
                        order.getTotalAmount() * 100
                );

        JSONObject razorpayOrderRequest =
                new JSONObject();

        razorpayOrderRequest.put(
                "amount",
                amountInPaise
        );

        razorpayOrderRequest.put(
                "currency",
                "INR"
        );

        razorpayOrderRequest.put(
                "receipt",
                "SC_ORDER_" + orderId
        );

        Order razorpayOrder =
                razorpayClient.orders.create(
                        razorpayOrderRequest
                );

        String razorpayOrderId =
                razorpayOrder
                        .get("id")
                        .toString();

        JSONObject response =
                new JSONObject();

        response.put(
                "razorpayOrderId",
                razorpayOrderId
        );

        response.put(
                "smartCartOrderId",
                orderId
        );

        response.put(
                "amount",
                amountInPaise
        );

        response.put(
                "currency",
                "INR"
        );

        response.put(
                "keyId",
                razorpayKeyId
        );

        return response;
    }


    // ============================
    // Verify Razorpay Payment
    // ============================

    public Payment verifyRazorpayPayment(
            Long orderId,
            String razorpayPaymentId,
            String razorpayOrderId,
            String razorpaySignature)
            throws RazorpayException {

        com.smartcart.entity.Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException("Order not found"));

        // Make sure this order is actually ONLINE
        if (!"ONLINE".equalsIgnoreCase(order.getPaymentMethod())) {
            throw new RuntimeException(
                    "This order is not an ONLINE payment order"
            );
        }

        // ============================
        // Razorpay Signature Verification
        // ============================

        JSONObject attributes = new JSONObject();

        attributes.put(
                "razorpay_payment_id",
                razorpayPaymentId
        );

        attributes.put(
                "razorpay_order_id",
                razorpayOrderId
        );

        attributes.put(
                "razorpay_signature",
                razorpaySignature
        );

        boolean isValid =
                Utils.verifyPaymentSignature(
                        attributes,
                        razorpayKeySecret
                );

        if (!isValid) {
            throw new RuntimeException(
                    "Razorpay payment signature verification failed"
            );
        }

        // ============================
        // Find Existing Payment
        // ============================

        Payment payment =
                paymentRepository
                        .findByOrder(order)
                        .orElse(null);

        // ============================
        // Create Payment if not exists
        // ============================

        if (payment == null) {

            payment = new Payment();

            payment.setOrder(order);

            payment.setAmount(
                    order.getTotalAmount()
            );
        }

        // ============================
        // Save Razorpay Details
        // ============================

        payment.setRazorpayPaymentId(
                razorpayPaymentId
        );

        payment.setRazorpayOrderId(
                razorpayOrderId
        );

        payment.setRazorpaySignature(
                razorpaySignature
        );

        // IMPORTANT
        payment.setPaymentMethod("ONLINE");

        payment.setPaymentStatus("SUCCESS");

        payment.setPaymentDate(
                LocalDateTime.now()
        );

        return paymentRepository.save(payment);
    }

    // ============================
    // Get Payment
    // ============================

    public Payment getPaymentByOrderId(
            Long orderId) {

        com.smartcart.entity.Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"
                                ));

        return paymentRepository
                .findByOrder(order)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payment not found"
                        ));
    }


    // ============================
    // Update Payment Status
    // ============================

    public Payment updatePaymentStatus(
            Long paymentId,
            String status) {

        Payment payment =
                paymentRepository
                        .findById(paymentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found"
                                ));

        String newStatus =
                status.toUpperCase();

        if (!newStatus.equals("PENDING")
                && !newStatus.equals("SUCCESS")
                && !newStatus.equals("FAILED")) {

            throw new RuntimeException(
                    "Invalid payment status. Use PENDING, SUCCESS or FAILED"
            );
        }

        if (payment.getPaymentStatus()
                .equals("SUCCESS")) {

            throw new RuntimeException(
                    "Successful payment cannot be updated"
            );
        }

        payment.setPaymentStatus(
                newStatus
        );

        return paymentRepository.save(
                payment
        );
    }
}