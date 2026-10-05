import { useEffect, useState } from "react";
import { getOrderById } from "../services/orderService";
import "./OrderDetails.css";

function OrderDetails({ orderId, onPayment }) {

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        if (!orderId) {
            setLoading(false);
            return;
        }

        getOrderById(orderId)
            .then((response) => {

                console.log(
                    "Order Details:",
                    response.data
                );

                setOrder(response.data);
                setLoading(false);
            })
            .catch((error) => {

                console.error(
                    "Order details error:",
                    error
                );

                setLoading(false);
            });

    }, [orderId]);

    if (loading) {
        return <h2>Loading order details...</h2>;
    }

    if (!order) {
        return <h2>Order not found</h2>;
    }

    return (
        <div className="order-details">

            <h1>Order Details 📦</h1>

            <div className="order-success">

                <h2>
                    Order Placed Successfully! ✅
                </h2>

                <p>
                    Order ID:{" "}
                    <strong>{order.id}</strong>
                </p>

            </div>

            <div className="order-info">

                <h2>
                    Customer Details 👤
                </h2>

                <p>
                    Name: {order.user.name}
                </p>

                <p>
                    Email: {order.user.email}
                </p>

                <p>
                    Phone: {order.user.phone}
                </p>

                <p>
                    Address: {order.user.address}
                </p>

            </div>

            <div className="order-info">

                <h2>
                    Order Information 📋
                </h2>

                <p>
                    Order Status:{" "}
                    <strong>{order.status}</strong>
                </p>

                <p>
                    Payment Method:{" "}
                    <strong>{order.paymentMethod}</strong>
                </p>

                <p>
                    Order Date:{" "}
                    {new Date(
                        order.orderDate
                    ).toLocaleString()}
                </p>

            </div>

            <div className="order-items">

                <h2>
                    Ordered Products 🛍️
                </h2>

                {order.orderItems.map((item) => (

                    <div
                        className="order-item"
                        key={item.id}
                    >

                        <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                        />

                        <div>

                            <h3>
                                {item.product.name}
                            </h3>

                            <p>
                                Price: ₹{item.price}
                            </p>

                            <p>
                                Quantity: {item.quantity}
                            </p>

                            <p>
                                Item Total: ₹
                                {item.price * item.quantity}
                            </p>

                        </div>

                    </div>

                ))}

            </div>

            <div className="order-total">

                <h2>
                    Total Amount: ₹{order.totalAmount}
                </h2>

                <button onClick={onPayment}>
                    Continue to Payment 💳
                </button>

            </div>

        </div>
    );
}

export default OrderDetails;