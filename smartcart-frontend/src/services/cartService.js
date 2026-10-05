// =====================================================
// cartService.js
// Handles all API calls related to Shopping Cart
// =====================================================

import API from "../api/api";

// ---------- GET USER CART ----------
// GET /api/cart/{userId}
export const getCart = (userId) => {
  return API.get(`/cart/${userId}`);
};

// ---------- ADD PRODUCT TO CART ----------
// POST /api/cart/add?userId=X&productId=Y&quantity=Z
export const addToCart = (userId, productId, quantity = 1) => {
  return API.post(
    `/cart/add?userId=${userId}&productId=${productId}&quantity=${quantity}`
  );
};

// ---------- UPDATE CART QUANTITY ----------
// PUT /api/cart/{cartId}?quantity=X
export const updateCartQuantity = (cartId, quantity) => {
  return API.put(`/cart/${cartId}?quantity=${quantity}`);
};

// ---------- REMOVE ITEM FROM CART ----------
// DELETE /api/cart/{cartId}
export const removeFromCart = (cartId) => {
  return API.delete(`/cart/${cartId}`);
};
