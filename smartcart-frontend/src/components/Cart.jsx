import { useEffect, useState } from "react";
import "./Cart.css";

import {
  getCart,
  updateCartQuantity,
  removeFromCart
} from "../services/cartService";

function Cart({
           userId: propUserId,
           onNavigateLogin,
           onNavigateCheckout,
           onCartCountChange
         }) {

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const savedUser = JSON.parse(localStorage.getItem("user") || "null");
  const userId = propUserId || savedUser?.id;

  useEffect(() => {
    if (userId) {
      loadCart();
    } else {
      setLoading(false);
    }
  }, [userId]);

  // Load Cart
  const loadCart = async () => {
    try {
      const response = await getCart(userId);

      const items = response.data;

      setCartItems(items);

      // Calculate total quantity
      const totalQuantity = items.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      );

      console.log("CART TOTAL QUANTITY:", totalQuantity);

      // Send count to App.jsx
      if (onCartCountChange) {
        onCartCountChange(totalQuantity);
      }

    } catch (error) {
      console.log("Cart loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update Quantity
  const updateQuantity = async (cartId, quantity) => {
    if (quantity < 1) {
      return;
    }

    try {
      await updateCartQuantity(cartId, quantity);

      loadCart();
    } catch (error) {
      console.log("Quantity update error:", error);
      alert("Unable to update quantity");
    }
  };

  // Remove Item
  const removeItem = async (cartId) => {
    const confirmRemove = window.confirm(
      "Remove this product from cart?"
    );

    if (!confirmRemove) {
      return;
    }

    try {
      await removeFromCart(cartId);

      loadCart();
    } catch (error) {
      console.log("Remove error:", error);
      alert("Unable to remove product");
    }
  };

  // Get Product
  const getProduct = (item) => {
    return item.product || item;
  };

  // Total
  const totalAmount = cartItems.reduce((total, item) => {
    const product = getProduct(item);

    return total + product.price * item.quantity;
  }, 0);

  // Loading
  if (loading) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <h2>Loading Cart... 🛒</h2>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!userId) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <div>🔐</div>

          <h2>Please Log In</h2>

          <p>
            Please log in to view and manage your SmartCart.
          </p>

          {onNavigateLogin && (
            <button
              className="checkout-btn"
              onClick={onNavigateLogin}
            >
              Log In Now →
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">

      {/* HEADER */}

      <div className="cart-header">

        <div>
          <h1>My Cart 🛒</h1>

          <p>
            {cartItems.length} product(s) in your cart
          </p>
        </div>

      </div>


      {/* EMPTY CART */}

      {cartItems.length === 0 ? (

        <div className="empty-cart">

          <div>🛒</div>

          <h2>Your Cart is Empty</h2>

          <p>
            Add products to your cart and continue shopping.
          </p>

          <button
            className="continue-shopping-btn"
            onClick={() => window.location.reload()}
          >
            Continue Shopping →
          </button>

        </div>

      ) : (

        <div className="cart-layout">

          {/* LEFT SIDE - CART PRODUCTS */}

          <div className="cart-items">

            {cartItems.map((item) => {

              const product = getProduct(item);

              return (

                <div
                  className="cart-item"
                  key={item.id}
                >

                  {/* PRODUCT IMAGE */}

                  <div className="cart-product-image">

                    {product.imageUrl ? (

                      <img
                        src={product.imageUrl}
                        alt={product.name}
                      />

                    ) : (

                      <span>📦</span>

                    )}

                  </div>


                  {/* PRODUCT DETAILS */}

                  <div className="cart-product-info">

                    <h3>
                      {product.name}
                    </h3>

                    <p className="cart-category">
                      {product.category}
                    </p>

                    <p className="cart-price">
                      ₹{product.price}
                    </p>


                    {/* QUANTITY */}

                    <div className="quantity-control">

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity - 1
                          )
                        }
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </button>

                    </div>


                    {/* REMOVE */}

                    <button
                      className="remove-btn"
                      onClick={() =>
                        removeItem(item.id)
                      }
                    >
                      🗑 Remove
                    </button>

                  </div>


                  {/* ITEM TOTAL */}

                  <div className="cart-item-total">

                    <span>
                      Item Total
                    </span>

                    <strong>
                      ₹
                      {product.price *
                        item.quantity}
                    </strong>

                  </div>

                </div>

              );
            })}

          </div>


          {/* RIGHT SIDE - SUMMARY */}

          <div className="cart-summary">

            <h2>
              Order Summary
            </h2>


            <div className="summary-row">

              <span>
                Products
              </span>

              <span>
                {cartItems.length}
              </span>

            </div>


            <div className="summary-row">

              <span>
                Subtotal
              </span>

              <span>
                ₹{totalAmount}
              </span>

            </div>


            <div className="summary-row">

              <span>
                Delivery
              </span>

              <span className="free">
                FREE
              </span>

            </div>


            <hr />


            <div className="summary-total">

              <span>
                Total
              </span>

              <strong>
                ₹{totalAmount}
              </strong>

            </div>


            {/* CHECKOUT */}

            <button
              className="checkout-btn"
              onClick={onNavigateCheckout}
            >
              Proceed to Checkout →
            </button>


            {/* CONTINUE */}

            <button
              className="continue-shopping-btn"
              onClick={() =>
                window.location.reload()
              }
            >
              ← Continue Shopping
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Cart;

