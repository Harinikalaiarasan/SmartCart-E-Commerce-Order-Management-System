
import { useEffect, useState } from "react";
import "./AdminOrders.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080/api"
).replace(/\/+$/, "");

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 403
            ? "Access denied. Please check admin permissions."
            : `Failed to fetch orders. HTTP ${response.status}`
        );
      }

      const data = await response.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.content)
          ? data.content
          : [];

      setOrders(list);
    } catch (err) {
      console.error("Error fetching admin orders:", err);
      setError(err.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);


const updateOrderStatus = async (orderId, status) => {
  setUpdatingOrderId(orderId);
  setError("");

  try {
    const response = await fetch(
      `${API_BASE_URL}/orders/${orderId}/status?status=${encodeURIComponent(status)}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Status update response:", response.status, errorText);

      throw new Error(
        `Failed to update order status. HTTP ${response.status}`
      );
    }

    await fetchOrders();
  } catch (err) {
    console.error("Error updating order status:", err);
    setError(err.message || "Unable to update order status.");
  } finally {
    setUpdatingOrderId(null);
  }
};


  if (loading) {
    return <div className="admin-loading">Loading orders...</div>;
  }

  const totalSales = orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce(
      (sum, order) =>
        sum +
        Number(
          order.totalAmount ?? order.totalPrice ?? order.amount ?? 0
        ),
      0
    );

  const placedCount = orders.filter(
    (order) => order.status === "PLACED"
  ).length;

  const shippedCount = orders.filter(
    (order) => order.status === "SHIPPED"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  const cancelledCount = orders.filter(
    (order) => order.status === "CANCELLED"
  ).length;

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-header">
        <div>
          <h1>Admin Orders</h1>
          <p>Manage customer orders and track deliveries.</p>
        </div>

        <div className="order-count">
          Total Orders: <strong>{orders.length}</strong>
          <button type="button" onClick={fetchOrders}>
            Refresh Orders
          </button>
        </div>
      </div>

      <div className="admin-dashboard">
        <div className="dashboard-card">
          <span>Total Orders</span>
          <strong>{orders.length}</strong>
        </div>

        <div className="dashboard-card">
          <span>Placed</span>
          <strong>{placedCount}</strong>
        </div>

        <div className="dashboard-card">
          <span>Shipped</span>
          <strong>{shippedCount}</strong>
        </div>

        <div className="dashboard-card">
          <span>Delivered</span>
          <strong>{deliveredCount}</strong>
        </div>

        <div className="dashboard-card">
          <span>Cancelled</span>
          <strong>{cancelledCount}</strong>
        </div>

        <div className="dashboard-card sales-card">
          <span>Order Value</span>
          <strong>
            ₹{totalSales.toLocaleString("en-IN")}
          </strong>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {!error && orders.length === 0 && (
        <div className="no-orders">
          <h2>No Orders Found</h2>
          <p>Customer orders will appear here.</p>
        </div>
      )}

      <div className="orders-container">
        {orders.map((order) => {
          const orderId = order.id ?? order.orderId;
          const user = order.user ?? order.customer ?? {};

          const customerName =
            user.name ?? order.customerName ?? order.name ?? "N/A";

          const customerEmail =
            user.email ?? order.customerEmail ?? order.email ?? "N/A";

          const customerPhone =
            user.phone ?? order.phone ?? "N/A";

          const address =
            user.address ?? order.address ?? "N/A";

          const paymentMethod = order.paymentMethod ?? "N/A";
          const status = order.status ?? "PLACED";

          const totalAmount = Number(
            order.totalAmount ?? order.totalPrice ?? order.amount ?? 0
          );

          const orderItems =
            order.orderItems ?? order.items ?? order.orderDetails ?? [];

          const orderDate = order.createdAt ?? order.orderDate;

          return (
            <div className="admin-order-card" key={orderId}>
              <div className="order-card-header">
                <div>
                  <h2>Order #{orderId}</h2>
                  <p>
                    {orderDate
                      ? new Date(orderDate).toLocaleString("en-IN")
                      : "Order details"}
                  </p>
                </div>

                <span
                  className={`status-badge ${String(status).toLowerCase()}`}
                >
                  {status}
                </span>
              </div>

              <div className="customer-section">
                <h3>Customer Details</h3>

                <div className="customer-info">
                  <div>
                    <span>Customer Name</span>
                    <strong>{customerName}</strong>
                  </div>

                  <div>
                    <span>Email Address</span>
                    <strong>{customerEmail}</strong>
                  </div>

                  <div>
                    <span>Phone Number</span>
                    <strong>{customerPhone}</strong>
                  </div>

                  <div>
                    <span>Delivery Address</span>
                    <strong>{address}</strong>
                  </div>
                </div>
              </div>

              <div className="products-section">
                <h3>Ordered Products</h3>

                {orderItems.length > 0 ? (
                  orderItems.map((item, index) => {
                    const product = item.product ?? item;
                    const productName =
                      product.name ?? item.productName ?? "Product";

                    const imageUrl =
                      product.imageUrl ??
                      product.imageURL ??
                      item.imageUrl;

                    const quantity = Number(item.quantity ?? 1);
                    const price = Number(
                      item.price ?? product.price ?? item.unitPrice ?? 0
                    );

                    return (
                      <div
                        className="admin-product-item"
                        key={item.id ?? product.id ?? index}
                      >
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt={productName}
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        )}

                        <div className="product-details">
                          <h4>{productName}</h4>
                          <p>Quantity: {quantity}</p>
                          <p>
                            Unit Price: ₹
                            {price.toLocaleString("en-IN")}
                          </p>
                        </div>

                        <div className="product-price">
                          ₹{(price * quantity).toLocaleString("en-IN")}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>
                    Product item details are not included in the order API
                    response.
                  </p>
                )}
              </div>

              <div className="order-card-footer">
                <div className="payment-info">
                  <span>Payment Method</span>
                  <strong>{paymentMethod}</strong>
                  {order.paymentStatus && (
                    <>
                      <span>Payment Status</span>
                      <strong>{order.paymentStatus}</strong>
                    </>
                  )}
                </div>

                <div className="total-info">
                  <span>Total Amount</span>
                  <strong>
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="status-update">
                  <label htmlFor={`status-${orderId}`}>
                    Update Status
                  </label>

                  <select
                    id={`status-${orderId}`}
                    value={status}
                    disabled={updatingOrderId === orderId}
                    onChange={(event) =>
                      updateOrderStatus(orderId, event.target.value)
                    }
                  >
                    <option value="PLACED">PLACED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                {updatingOrderId === orderId && (
                  <span>Updating...</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminOrders;

