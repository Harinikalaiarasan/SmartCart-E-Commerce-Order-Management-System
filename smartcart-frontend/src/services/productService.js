// =====================================================
// productService.js
// Handles all API calls related to Products:
//   - Fetch all products
//   - Add to cart (product action initiated from home page)
// =====================================================

import API from "../api/api";

// ---------- GET ALL PRODUCTS ----------
// GET /api/products
// Returns: list of all products
export const getAllProducts = () => {
  return API.get("/products");
};


