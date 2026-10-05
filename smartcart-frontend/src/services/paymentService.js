import API from "../api/api";

// ==========================================
// Existing COD Payment
// ==========================================

export const processPayment = (
    orderId,
    paymentMethod
) => {

    return API.post(
        `/payments/process?orderId=${orderId}&paymentMethod=${paymentMethod}`
    );
};


// ==========================================
// Create Razorpay Order
// ==========================================

export const createRazorpayOrder = (
    orderId
) => {

    return API.post(
        `/payments/razorpay/create-order?orderId=${orderId}`
    );
};


// ==========================================
// Verify Razorpay Payment
// ==========================================

export const verifyRazorpayPayment = (
    paymentData
) => {

    return API.post(
        "/payments/razorpay/verify",
        paymentData
    );
};


// ==========================================
// Get Payment by Order
// ==========================================

export const getPaymentByOrder = (
    orderId
) => {

    return API.get(
        `/payments/order/${orderId}`
    );
};


// ==========================================
// Update Payment Status
// ==========================================

export const updatePaymentStatus = (
    paymentId,
    status
) => {

    return API.put(
        `/payments/${paymentId}/status?status=${status}`
    );
};

