package com.smartcart.controller;

import com.smartcart.entity.Cart;
import com.smartcart.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // Add Product to Cart
    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(
            @RequestParam Long userId,
            @RequestParam Long productId,
            @RequestParam Integer quantity) {

        return ResponseEntity.ok(
                cartService.addToCart(userId, productId, quantity)
        );
    }

    // Get User Cart
    @GetMapping("/{userId}")
    public ResponseEntity<List<Cart>> getUserCart(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                cartService.getUserCart(userId)
        );
    }

    // Update Quantity
    @PutMapping("/{cartId}")
    public ResponseEntity<Cart> updateQuantity(
            @PathVariable Long cartId,
            @RequestParam Integer quantity) {

        return ResponseEntity.ok(
                cartService.updateQuantity(cartId, quantity)
        );
    }

    // Remove from Cart
    @DeleteMapping("/{cartId}")
    public ResponseEntity<String> removeFromCart(
            @PathVariable Long cartId) {

        cartService.removeFromCart(cartId);

        return ResponseEntity.ok("Product removed from cart successfully");
    }
}
