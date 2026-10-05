package com.smartcart.service;

import com.smartcart.entity.Cart;
import com.smartcart.entity.Order;
import com.smartcart.entity.OrderItem;
import com.smartcart.entity.Product;
import com.smartcart.entity.User;
import com.smartcart.repository.*;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import com.smartcart.entity.Payment;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartRepository cartRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            PaymentRepository paymentRepository) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public Order placeOrder(Long userId, String paymentMethod) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Cart> cartItems = cartRepository.findByUser(user);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        double totalAmount = 0;

        for (Cart cart : cartItems) {
            Product product = cart.getProduct();

            if (product.getQuantity() < cart.getQuantity()) {
                throw new RuntimeException(
                        "Insufficient stock for product: " + product.getName()
                );
            }
            totalAmount += product.getPrice() * cart.getQuantity();
        }

        // Create Order
        Order order = new Order();

        order.setUser(user);
        order.setTotalAmount(totalAmount);
        order.setStatus("PLACED");
        order.setPaymentMethod(paymentMethod);
        order.setOrderDate(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        // Create Order Items
        for (Cart cart : cartItems) {

            Product product = cart.getProduct();

            OrderItem orderItem = new OrderItem();

            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setQuantity(cart.getQuantity());
            orderItem.setPrice(product.getPrice());

            orderItemRepository.save(orderItem);

            product.setQuantity(product.getQuantity() - cart.getQuantity());

            productRepository.save(product);
        }

        // Clear Cart
        cartRepository.deleteAll(cartItems);

        return savedOrder;
    }

    public List<Order> getUserOrders(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return orderRepository.findByUser(user);
    }

    // Get ALL orders - Admin
    public List<Order> getAllOrders() {

        return orderRepository.findAll();
    }

    public Order getOrderById(Long orderId) {

        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public Order updateOrderStatus(Long orderId, String status) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        String newStatus = status.toUpperCase();

        if (!newStatus.equals("PLACED")
                && !newStatus.equals("SHIPPED")
                && !newStatus.equals("DELIVERED")
                && !newStatus.equals("CANCELLED")) {

            throw new RuntimeException(
                    "Invalid order status. Use PLACED, SHIPPED, DELIVERED or CANCELLED"
            );
        }

        if (order.getStatus().equals("DELIVERED")) {
            throw new RuntimeException("Delivered order cannot be updated");
        }

        // ONLINE payment validation
        if (newStatus.equals("DELIVERED")
                && order.getPaymentMethod().equalsIgnoreCase("ONLINE")) {

            Payment payment = paymentRepository.findByOrder(order)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Cannot deliver order. ONLINE payment is not completed"
                            ));

            if (!payment.getPaymentStatus().equalsIgnoreCase("SUCCESS")) {
                throw new RuntimeException(
                        "ONLINE payment must be SUCCESS before order can be DELIVERED"
                );
            }
        }

        if (order.getStatus().equals("CANCELLED")) {
            throw new RuntimeException("Cancelled order cannot be updated");
        }

        // Restore stock when order is cancelled
        if (newStatus.equals("CANCELLED")) {

            List<OrderItem> orderItems =
                    orderItemRepository.findByOrder(order);

            for (OrderItem item : orderItems) {

                Product product = item.getProduct();

                product.setQuantity(
                        product.getQuantity() + item.getQuantity()
                );

                productRepository.save(product);
            }
        }

        order.setStatus(newStatus);

        return orderRepository.save(order);
    }
}