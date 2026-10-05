import { useEffect, useRef, useState } from "react";

import {
    createRazorpayOrder,
    processPayment,
    getPaymentByOrder,
    verifyRazorpayPayment
} from "../services/paymentService";

import "./Payment.css";

function Payment({
    orderId,
    paymentMethod = "COD"
}) {

    const [payment, setPayment] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const paymentStarted = useRef(false);

    useEffect(() => {

        if (!orderId) {
            setMessage("Order ID not found ❌");
            return;
        }

        if (paymentStarted.current) {
            return;
        }

        paymentStarted.current = true;

        if (paymentMethod === "COD") {
            handleCODPayment();
        } else if (paymentMethod === "ONLINE") {
            handleOnlinePayment();
        }

    }, [orderId, paymentMethod]);


    // ==========================================
    // COD PAYMENT
    // ==========================================

    const handleCODPayment = async () => {

        try {

            setLoading(true);

            setMessage(
                "Processing Cash on Delivery..."
            );

            const response =
                await processPayment(
                    orderId,
                    "COD"
                );

            console.log(
                "COD Payment Response:",
                response.data
            );

            setPayment(response.data);

            setMessage(
                "Payment processed successfully! ✅"
            );

        } catch (error) {

            console.error(
                "COD Payment Error:",
                error
            );

            console.log(
                "Backend Response:",
                error.response?.data
            );

            try {

                const response =
                    await getPaymentByOrder(
                        orderId
                    );

                setPayment(
                    response.data
                );

            } catch (paymentError) {

                console.error(
                    paymentError
                );

                setMessage(
                    "Payment failed ❌"
                );
            }

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // ONLINE PAYMENT
    // ==========================================

    const handleOnlinePayment = async () => {

        try {

            setLoading(true);

            setMessage(
                "Creating Razorpay payment..."
            );

            // Create Razorpay Order
            const response =
                await createRazorpayOrder(
                    orderId
                );

            console.log(
                "Razorpay Order Response:",
                response.data
            );

            const razorpayData =
                response.data;

            // Check Razorpay script
            if (!window.Razorpay) {

                setMessage(
                    "Razorpay Checkout script not loaded ❌"
                );

                console.error(
                    "window.Razorpay is not available"
                );

                return;
            }

            // Razorpay Checkout Options
            const options = {

                key:
                    razorpayData.keyId,

                amount:
                    razorpayData.amount,

                currency:
                    razorpayData.currency,

                name:
                    "SmartCart",

                description:
                    "SmartCart Order #" +
                    orderId,

                order_id:
                    razorpayData.razorpayOrderId,

                handler:
                    async function (
                        razorpayResponse
                    ) {

                        console.log(
                            "Razorpay Payment Response:",
                            razorpayResponse
                        );

                        try {

                            setMessage(
                                "Verifying payment..."
                            );

                            // Send Razorpay details
                            // to Spring Boot
                            const verifyResponse =
                                await verifyRazorpayPayment(
                                    {
                                        orderId:
                                            orderId,

                                        razorpayPaymentId:
                                            razorpayResponse
                                                .razorpay_payment_id,

                                        razorpayOrderId:
                                            razorpayResponse
                                                .razorpay_order_id,

                                        razorpaySignature:
                                            razorpayResponse
                                                .razorpay_signature
                                    }
                                );

                            console.log(
                                "Verification Response:",
                                verifyResponse.data
                            );

                            setPayment(
                                verifyResponse.data
                            );

                            setMessage(
                                "Online payment successful! ✅"
                            );

                        } catch (error) {

                            console.error(
                                "Payment verification error:",
                                error
                            );

                            console.log(
                                "Verification Backend Response:",
                                error.response?.data
                            );

                            setMessage(
                                "Payment verification failed ❌"
                            );
                        }
                    },

                prefill: {

                    name:
                        JSON.parse(
                            localStorage.getItem(
                                "user"
                            ) || "null"
                        )?.name || "",

                    email:
                        JSON.parse(
                            localStorage.getItem(
                                "user"
                            ) || "null"
                        )?.email || "",

                    contact:
                        JSON.parse(
                            localStorage.getItem(
                                "user"
                            ) || "null"
                        )?.phone || ""
                },

                notes: {

                    smartcart_order_id:
                        String(orderId)
                },

                theme: {

                    color: "#2874f0"
                },

                modal: {

                    ondismiss:
                        function () {

                            console.log(
                                "Razorpay popup closed"
                            );

                            setMessage(
                                "Payment cancelled ❌"
                            );

                            setLoading(false);
                        }
                }
            };

            console.log(
                "Opening Razorpay Checkout..."
            );

            const razorpay =
                new window.Razorpay(
                    options
                );

            razorpay.on(
                "payment.failed",
                function (response) {

                    console.error(
                        "Razorpay Payment Failed:",
                        response
                    );

                    setMessage(
                        "Payment failed ❌"
                    );

                    setLoading(false);
                }
            );

            razorpay.open();

            setMessage(
                "Razorpay Checkout opened..."
            );

        } catch (error) {

            console.error(
                "Razorpay Error:",
                error
            );

            console.log(
                "Backend Response:",
                error.response?.data
            );

            setMessage(
                error.response?.data ||
                "Unable to create Razorpay payment ❌"
            );

            setLoading(false);
        }
    };


    // ==========================================
    // LOADING SCREEN
    // ==========================================

    if (loading && !payment) {

        return (
            <div className="payment-page">

                <div className="payment-card">

                    <h2>
                        {message}
                    </h2>

                    <p>
                        Please wait...
                    </p>

                </div>

            </div>
        );
    }


    // ==========================================
    // PAYMENT RESULT
    // ==========================================

    if (!payment) {

        return (
            <div className="payment-page">

                <div className="payment-card">

                    <h2>
                        {message}
                    </h2>

                </div>

            </div>
        );
    }


    // ==========================================
    // SUCCESS
    // ==========================================

    return (

        <div className="payment-page">

            <h1>
                Payment Successful ✅
            </h1>

            <div className="payment-card">

                <h2>
                    Payment Successful ✅
                </h2>

                <p>
                    Payment ID:
                    <strong>
                        {payment.id}
                    </strong>
                </p>

                <p>
                    Order ID:
                    <strong>
                        {payment.order?.id}
                    </strong>
                </p>

                <p>
                    Amount:
                    ₹{payment.amount}
                </p>

                <p>
                    Payment Method:
                    <strong>
                        {payment.paymentMethod}
                    </strong>
                </p>

                <p>
                    Payment Status:
                    <strong>
                        {payment.paymentStatus}
                    </strong>
                </p>

                {payment.razorpayPaymentId && (

                    <p>
                        Razorpay Payment ID:
                        <strong>
                            {payment.razorpayPaymentId}
                        </strong>
                    </p>

                )}

                {payment.razorpayOrderId && (

                    <p>
                        Razorpay Order ID:
                        <strong>
                            {payment.razorpayOrderId}
                        </strong>
                    </p>

                )}

                <p>
                    Payment Date:
                    {payment.paymentDate
                        ? new Date(
                            payment.paymentDate
                        ).toLocaleString()
                        : "N/A"}
                </p>

            </div>

        </div>
    );
}

export default Payment;
