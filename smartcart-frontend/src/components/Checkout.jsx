import { useState } from "react";
import "./Checkout.css";

import { placeOrder } from "../services/orderService";

function Checkout({
  userId: propUserId,
  onOrderPlaced
}) {

  const savedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const userId =
    propUserId || savedUser?.id;

  const [paymentMethod, setPaymentMethod] =
    useState("COD");

  const [address, setAddress] =
    useState(savedUser?.address || "");

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const handlePlaceOrder = async () => {

    if (!address.trim()) {

      alert(
        "Please enter your delivery address"
      );

      return;
    }

    if (!userId) {

      alert(
        "Please log in before placing an order"
      );

      return;
    }

    try {

      setPlacingOrder(true);

      const response =
        await placeOrder(
          userId,
          paymentMethod
        );

      const newOrderId =
        response.data.id;

      console.log(
        "SmartCart Order ID:",
        newOrderId
      );

      console.log(
        "Payment Method:",
        paymentMethod
      );

      if (onOrderPlaced) {

        onOrderPlaced(
          newOrderId,
          paymentMethod
        );

      }

    } catch (error) {

      console.error(
        "Order error:",
        error
      );

      alert(
        error.response?.data ||
        "Unable to place order"
      );

    } finally {

      setPlacingOrder(false);

    }
  };

  return (

    <div className="checkout-page">

      <div className="checkout-header">

        <h1>
          Checkout 🛒
        </h1>

        <p>
          Complete your order
        </p>

      </div>


      <div className="checkout-layout">

        <div className="checkout-left">

          {/* DELIVERY ADDRESS */}

          <div className="checkout-card">

            <h2>
              1. Delivery Address 📍
            </h2>

            <label>
              Address
            </label>

            <textarea
              value={address}
              onChange={(e) =>
                setAddress(e.target.value)
              }
              placeholder="Enter your complete delivery address"
              rows="5"
            />

          </div>


          {/* PAYMENT METHOD */}

          <div className="checkout-card">

            <h2>
              2. Payment Method 💳
            </h2>

            <div className="payment-options">

              {/* COD */}

              <label
                className={
                  paymentMethod === "COD"
                    ? "payment-option selected"
                    : "payment-option"
                }
              >

                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={
                    paymentMethod === "COD"
                  }
                  onChange={() =>
                    setPaymentMethod("COD")
                  }
                />

                <div>

                  <strong>
                    Cash on Delivery
                  </strong>

                  <p>
                    Pay when your order arrives
                  </p>

                </div>

              </label>


              {/* ONLINE */}

              <label
                className={
                  paymentMethod === "ONLINE"
                    ? "payment-option selected"
                    : "payment-option"
                }
              >

                <input
                  type="radio"
                  name="payment"
                  value="ONLINE"
                  checked={
                    paymentMethod === "ONLINE"
                  }
                  onChange={() =>
                    setPaymentMethod("ONLINE")
                  }
                />

                <div>

                  <strong>
                    Online Payment
                  </strong>

                  <p>
                    Pay securely using Razorpay
                  </p>

                </div>

              </label>

            </div>

          </div>

        </div>


        {/* SUMMARY */}

        <div className="checkout-summary">

          <h2>
            Order Summary
          </h2>

          <div className="checkout-row">

            <span>
              Items
            </span>

            <span>
              Cart Items
            </span>

          </div>

          <div className="checkout-row">

            <span>
              Delivery
            </span>

            <span className="free">
              FREE
            </span>

          </div>

          <hr />

          <div className="checkout-total">

            <span>
              Payment
            </span>

            <strong>
              {paymentMethod === "COD"
                ? "Cash on Delivery"
                : "Razorpay Online"}
            </strong>

          </div>

          <button
            className="place-order-btn"
            onClick={handlePlaceOrder}
            disabled={placingOrder}
          >

            {placingOrder
              ? "Creating Order..."
              : paymentMethod === "COD"
                ? "Place Order - COD"
                : "Continue to Online Payment →"}

          </button>

        </div>

      </div>

    </div>
  );
}

export default Checkout;