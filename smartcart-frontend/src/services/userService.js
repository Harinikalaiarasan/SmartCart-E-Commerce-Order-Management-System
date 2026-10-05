// =====================================================
// userService.js
// Handles all API calls related to User Authentication:
//   - Register
//   - Send OTP
//   - Verify OTP
//   - Login
// =====================================================

import API from "../api/api";

// ---------- REGISTER ----------
// POST /api/users/register
// Body: { name, email, phone, password, address }
// Returns: registered user object
export const registerUser = (userData) => {
  return API.post("/users/register", userData);
};

// ---------- SEND OTP ----------
// POST /api/users/send-otp
// Body: { email }
// Returns: { message, otp (dev only) }
export const sendOtp = (email) => {
  return API.post("/users/send-otp", { email });
};

// ---------- VERIFY OTP ----------
// POST /api/users/verify-otp
// Body: { email, otp }
// Returns: success message string
export const verifyOtp = (email, otp) => {
  return API.post("/users/verify-otp", { email, otp });
};

// ---------- LOGIN ----------
// POST /api/users/login
// Body: { email, password }
// Returns: UserResponseDTO { id, name, email, phone, address, verified, role }
export const loginUser = (credentials) => {
  return API.post("/users/login", credentials);
};
