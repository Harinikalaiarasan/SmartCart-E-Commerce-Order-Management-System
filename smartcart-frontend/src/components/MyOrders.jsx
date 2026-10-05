import { useEffect, useState } from "react";
import { getUserOrders } from "../services/orderService";
import "./MyOrders.css";

function MyOrders({ onViewOrder, userId }) {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    // ================= LOAD USER ORDERS =================

    const loadOrders = async () => {

        if (!userId) {

            setMessage(
                "Please login to view your orders 🔐"
            );

            setLoading(false);

            return;
        }

        try {

            const response = await getUserOrders(userId);

            console.log(
                "My Orders:",
                response.data
            );

            setOrders(response.data);

            setLoading(false);

        } catch (error) {

            console.error(
                "Orders error:",
                error
            );

            setMessage(
                "Failed to load orders ❌"
            );

            setLoading(false);
        }
    };

    // ================= LOAD WHEN USER ID CHANGES =================

    useEffect(() => {

        loadOrders();

    }, [userId]);

    // ================= LOADING =================

    if (loading) {

        return (
            <div className="my-orders">

                <h2>
                    Loading orders... 📦
                </h2>

            </div>
        );

    }

    // ================= LOGIN CHECK =================

    if (!userId) {

        return (
            <div className="my-orders">

                <h1>
                    My Orders 📦
                </h1>

                <h2>
                    Please login to view your orders 🔐
                </h2>

            </div>
        );

    }

    // ================= GET TRACKING STEP =================

    const getStatusStep = (status) => {

        if (status === "PLACED") {
            return 1;
        }

        if (status === "SHIPPED") {
            return 2;
        }

        if (status === "DELIVERED") {
            return 3;
        }

        return 0;
    };

    // ================= ORDERS PAGE =================

    return (

        <div className="my-orders">

            <h1>
                My Orders 📦
            </h1>

            {message && (

                <p>
                    {message}
                </p>

            )}

            {/* ================= NO ORDERS ================= */}

            {orders.length === 0 ? (

                <h2>
                    No orders found
                </h2>

            ) : (

                /* ================= ORDER LIST ================= */

                orders.map((order) => {

                    const currentStep =
                        getStatusStep(order.status);

                    return (

                        <div
                            className="order-card"
                            key={order.id}
                        >

                            <h2>
                                Order #{order.id}
                            </h2>

                            <p>
                                Order Date:
                                {" "}
                                {new Date(
                                    order.orderDate
                                ).toLocaleString()}
                            </p>

                            <p>
                                Total Amount:
                                {" "}
                                ₹{Number(
                                    order.totalAmount
                                ).toLocaleString("en-IN")}
                            </p>

                            <p>
                                Payment Method:
                                {" "}
                                <strong>
                                    {order.paymentMethod}
                                </strong>
                            </p>


                            {/* ================= ORDER TRACKING ================= */}

                            <div className="order-tracking">

                                <h3>
                                    Order Tracking
                                </h3>

                                {order.status === "CANCELLED" ? (

                                    <div className="cancelled-tracking">

                                        <div className="tracking-step completed">
                                            <div className="tracking-circle">
                                                ✓
                                            </div>

                                            <span>
                                                Order Placed
                                            </span>
                                        </div>

                                        <div className="tracking-line"></div>

                                        <div className="tracking-step cancelled">

                                            <div className="tracking-circle">
                                                ✕
                                            </div>

                                            <span>
                                                Cancelled
                                            </span>

                                        </div>

                                    </div>

                                ) : (

                                    <div className="tracking-container">

                                        <div
                                            className={
                                                currentStep >= 1
                                                    ? "tracking-step completed"
                                                    : "tracking-step"
                                            }
                                        >

                                            <div className="tracking-circle">
                                                {currentStep >= 1
                                                    ? "✓"
                                                    : "1"}
                                            </div>

                                            <span>
                                                Order Placed
                                            </span>

                                        </div>


                                        <div
                                            className={
                                                currentStep >= 2
                                                    ? "tracking-line active"
                                                    : "tracking-line"
                                            }
                                        ></div>


                                        <div
                                            className={
                                                currentStep >= 2
                                                    ? "tracking-step completed"
                                                    : "tracking-step"
                                            }
                                        >

                                            <div className="tracking-circle">
                                                {currentStep >= 2
                                                    ? "✓"
                                                    : "2"}
                                            </div>

                                            <span>
                                                Shipped
                                            </span>

                                        </div>


                                        <div
                                            className={
                                                currentStep >= 3
                                                    ? "tracking-line active"
                                                    : "tracking-line"
                                            }
                                        ></div>


                                        <div
                                            className={
                                                currentStep >= 3
                                                    ? "tracking-step completed"
                                                    : "tracking-step"
                                            }
                                        >

                                            <div className="tracking-circle">
                                                {currentStep >= 3
                                                    ? "✓"
                                                    : "3"}
                                            </div>

                                            <span>
                                                Delivered
                                            </span>

                                        </div>

                                    </div>

                                )}

                            </div>


                            {/* ================= CURRENT STATUS ================= */}

                            <p className="current-status">

                                Current Status:

                                {" "}

                                <strong
                                    className={
                                        `status-${order.status?.toLowerCase()}`
                                    }
                                >
                                    {order.status}
                                </strong>

                            </p>


                            <p>
                                Products:
                                {" "}
                                {order.orderItems?.length || 0}
                            </p>


                            <button
                                onClick={() =>
                                    onViewOrder(order.id)
                                }
                            >
                                View Order Details
                            </button>

                        </div>

                    );

                })

            )}

        </div>

    );

}

export default MyOrders;