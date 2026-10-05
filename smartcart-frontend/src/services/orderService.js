import API from "../api/api";

// Place order
export const placeOrder = (userId, paymentMethod) => {
  return API.post(
    `/orders/place?userId=${userId}&paymentMethod=${paymentMethod}`
  );
};

// Get user orders
export const getUserOrders = (userId) => {
  return API.get(`/orders/user/${userId}`);
};

// Get order by ID
export const getOrderById = (orderId) => {
  return API.get(`/orders/${orderId}`);
};

// Update order status
export const updateOrderStatus = (orderId, status) => {
  return API.put(`/orders/${orderId}/status?status=${status}`);
};

// Get order items
export const getOrderItems = (orderId) => {
  return API.get(`/order-items/order/${orderId}`);
};