import React, { useEffect, useState } from "react";
import "./AdminOrders.css";

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const totalOrders = orders.length;

    const placedOrders = orders.filter(
        (order) => order.status === "PLACED"
    ).length;

    const shippedOrders = orders.filter(
        (order) => order.status === "SHIPPED"
    ).length;

    const deliveredOrders = orders.filter(
        (order) => order.status === "DELIVERED"
    ).length;

    const cancelledOrders = orders.filter(
        (order) => order.status === "CANCELLED"
    ).length;

    const totalSales = orders
        .filter((order) => order.status !== "CANCELLED")
        .reduce(
            (total, order) => total + Number(order.totalAmount || 0),
            0
        );

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                "https://smartcart-backend-lm1p.onrender.com/api/orders",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch orders");
            }

            const data = await response.json();
            setOrders(data);
        } catch (err) {
            console.error(err);
            setError("Unable to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `https://smartcart-backend-lm1p.onrender.com/api/orders/${orderId}/status?status=${newStatus}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update order status");
            }

            // Refresh orders after update
            fetchOrders();

        } catch (err) {
            console.error(err);
            alert("Failed to update order status");
        }
    };

    if (loading) {
        return (
            <div className="admin-orders-page">
                <div className="admin-loading">
                    Loading orders...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-orders-page">
                <div className="admin-error">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="admin-orders-page">
          <div className="admin-dashboard">

              <div className="dashboard-card">
                  <span>Total Orders</span>
                  <strong>{totalOrders}</strong>
              </div>

              <div className="dashboard-card">
                  <span>Placed</span>
                  <strong>{placedOrders}</strong>
              </div>

              <div className="dashboard-card">
                  <span>Shipped</span>
                  <strong>{shippedOrders}</strong>
              </div>

              <div className="dashboard-card">
                  <span>Delivered</span>
                  <strong>{deliveredOrders}</strong>
              </div>

              <div className="dashboard-card">
                  <span>Cancelled</span>
                  <strong>{cancelledOrders}</strong>
              </div>

              <div className="dashboard-card sales-card">
                  <span>Total Sales</span>
                  <strong>
                      ₹{totalSales.toLocaleString("en-IN")}
                  </strong>
              </div>

          </div>

            <div className="admin-orders-header">
                <div>
                    <h1>Admin Orders</h1>
                    <p>Manage and monitor all customer orders</p>
                </div>

                <div className="order-count">
                    Total Orders: <strong>{orders.length}</strong>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="no-orders">
                    <h2>No Orders Found</h2>
                    <p>There are no orders available yet.</p>
                </div>
            ) : (
                <div className="orders-container">

                    {orders.map((order) => (

                        <div className="admin-order-card" key={order.id}>

                            {/* Order Header */}
                            <div className="order-card-header">

                                <div>
                                    <h2>Order #{order.id}</h2>
                                    <p>
                                        {new Date(order.orderDate).toLocaleString()}
                                    </p>
                                </div>

                                <span
                                    className={`status-badge ${order.status
                                        ?.toLowerCase()
                                        .replace(" ", "-")}`}
                                >
                                    {order.status}
                                </span>

                            </div>

                            {/* Customer Details */}
                            <div className="customer-section">

                                <h3>Customer Details</h3>

                                <div className="customer-info">

                                    <div>
                                        <span>Name</span>
                                        <strong>{order.user?.name}</strong>
                                    </div>

                                    <div>
                                        <span>Email</span>
                                        <strong>{order.user?.email}</strong>
                                    </div>

                                    <div>
                                        <span>Phone</span>
                                        <strong>{order.user?.phone}</strong>
                                    </div>

                                    <div>
                                        <span>Address</span>
                                        <strong>{order.user?.address}</strong>
                                    </div>

                                </div>

                            </div>

                            {/* Products */}
                            <div className="products-section">

                                <h3>Order Items</h3>

                                {order.orderItems?.map((item) => (

                                    <div
                                        className="admin-product-item"
                                        key={item.id}
                                    >

                                        <img
                                            src={item.product?.imageUrl}
                                            alt={item.product?.name}
                                        />

                                        <div className="product-details">

                                            <h4>
                                                {item.product?.name}
                                            </h4>

                                            <p>
                                                Category:{" "}
                                                {item.product?.category}
                                            </p>

                                            <p>
                                                Quantity: {item.quantity}
                                            </p>

                                        </div>

                                        <div className="product-price">
                                            ₹{Number(item.price).toLocaleString("en-IN")}
                                        </div>

                                    </div>

                                ))}

                            </div>

                            {/* Order Footer */}
                            <div className="order-card-footer">

                                <div className="payment-info">

                                    <span>Payment</span>
                                    <strong>
                                        {order.paymentMethod}
                                    </strong>

                                </div>

                                <div className="total-info">

                                    <span>Total Amount</span>

                                    <strong>
                                        ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                                    </strong>

                                </div>

                                {/* Status Update */}
                                <div className="status-update">

                                    <label>Update Status</label>

                                    <select
                                        value={order.status}
                                        onChange={(e) =>
                                            updateStatus(
                                                order.id,
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="PLACED">
                                            PLACED
                                        </option>

                                        <option value="SHIPPED">
                                            SHIPPED
                                        </option>

                                        <option value="DELIVERED">
                                            DELIVERED
                                        </option>

                                        <option value="CANCELLED">
                                            CANCELLED
                                        </option>
                                    </select>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>
            )}

        </div>
    );
}

export default AdminOrders;

