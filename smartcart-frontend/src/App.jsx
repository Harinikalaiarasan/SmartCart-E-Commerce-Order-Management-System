import { useEffect, useState } from "react";

import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Login from "./components/Login";
import Register from "./components/Register";
import VerifyOTP from "./components/VerifyOTP";
import MyOrders from "./components/MyOrders";
import OrderDetails from "./components/OrderDetails";
import Payment from "./components/Payment";
import AdminOrders from "./components/AdminOrders";
import ProductList from "./components/ProductList";

import { addToCart, getCart } from "./services/cartService";

import "./App.css";

function App() {

  // =========================
  // ACTIVE VIEW
  // =========================

  const [activeView, setActiveView] = useState("home");

  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Payment method of selected order
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("COD");

  const [otpEmail, setOtpEmail] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);

  // =========================
  // CART COUNT
  // =========================

  const [cartCount, setCartCount] = useState(0);

  // =========================
  // CURRENT USER
  // =========================

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch {
      return null;
    }
  });

  // =========================
  // NAVIGATE
  // =========================

  const navigate = (view) => {
    setActiveView(view);
    setMenuOpen(false);
  };

  // =========================
  // LOAD CART COUNT
  // =========================

  const loadCartCount = async (userId) => {

    if (!userId) {
      setCartCount(0);
      return;
    }

    try {

      const response = await getCart(userId);

      const items = response.data || [];

      const totalQuantity = items.reduce(
        (total, item) => {
          return total + Number(item.quantity || 0);
        },
        0
      );

      console.log(
        "APP CART COUNT:",
        totalQuantity
      );

      setCartCount(totalQuantity);

    } catch (error) {

      console.error(
        "App cart count error:",
        error
      );

      setCartCount(0);
    }
  };

  // =========================
  // LOAD CART WHEN USER CHANGES
  // =========================

  useEffect(() => {

    if (currentUser?.id) {
      loadCartCount(currentUser.id);
    } else {
      setCartCount(0);
    }

  }, [currentUser]);

  // =========================
  // ADD TO CART
  // =========================

  const handleAddToCart = async (product) => {

    if (!currentUser) {

      alert(
        "Please log in to add items to your cart."
      );

      setActiveView("login");

      return;
    }

    try {

      await addToCart(
        currentUser.id,
        product.id,
        1
      );

      await loadCartCount(
        currentUser.id
      );

      alert("Product added to cart 🛒");

    } catch (error) {

      console.error(
        "Add to cart error:",
        error
      );

      alert(
        error.response?.data?.error ||
        "Unable to add product"
      );
    }
  };

  // =========================
  // LOGIN SUCCESS
  // =========================

  const handleLoginSuccess = (user) => {

    setCurrentUser(user);

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    setActiveView("home");

    setMenuOpen(false);
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {

    localStorage.removeItem("user");

    localStorage.removeItem("token");

    setCurrentUser(null);

    setCartCount(0);

    setActiveView("home");

    setMenuOpen(false);
  };

  // =========================
  // OTP
  // =========================

  const handleOTP = (email) => {

    setOtpEmail(email);

    setActiveView("verify-otp");

    setMenuOpen(false);
  };

  const handleOTPVerified = () => {

    setActiveView("login");

    setMenuOpen(false);
  };

  // =========================
  // SCROLL TO PRODUCTS
  // =========================

  const goToProducts = () => {

    setActiveView("home");

    setMenuOpen(false);

    setTimeout(() => {

      const productSection =
        document.getElementById("products");

      if (productSection) {

        productSection.scrollIntoView({
          behavior: "smooth"
        });

      }

    }, 100);
  };

  // =========================
  // CHECKOUT COMPLETE
  // =========================

  const handleCheckoutComplete = (
    orderId,
    paymentMethod
  ) => {

    console.log(
      "Checkout Order ID:",
      orderId
    );

    console.log(
      "Checkout Payment Method:",
      paymentMethod
    );

    setSelectedOrderId(orderId);

    setSelectedPaymentMethod(
      paymentMethod
    );

    setActiveView("payment");

  };

  // =========================
  // HOME PAGE
  // =========================

  const renderHome = () => {

    return (
      <>

        <section className="hero-section">

          <div className="hero-content">

            <span className="hero-badge">
              ✨ Welcome to SmartCart
            </span>

            <h1>
              Everything You Need,
              <br />
              All in One Place
            </h1>

            <p>
              Discover quality products at great prices
              and enjoy a simple shopping experience.
            </p>

            <button
              className="shop-btn"
              onClick={goToProducts}
            >
              Shop Now →
            </button>

          </div>

        </section>

        <section
          id="products"
          className="products-section"
        >

          <ProductList
            onAddToCart={handleAddToCart}
          />

        </section>

      </>
    );
  };

  // =========================
  // ACTIVE VIEW
  // =========================

  const renderView = () => {

    switch (activeView) {

      case "login":

        return (
          <Login
            onRegister={() =>
              setActiveView("register")
            }
            onLoginSuccess={
              handleLoginSuccess
            }
          />
        );

      case "register":

        return (
          <Register
            onLogin={() =>
              setActiveView("login")
            }
            onOTP={handleOTP}
          />
        );

      case "verify-otp":

        return (
          <VerifyOTP
            email={otpEmail}
            onVerified={
              handleOTPVerified
            }
          />
        );

      case "cart":

        return (
          <Cart
            userId={currentUser?.id}

            onNavigateLogin={() =>
              navigate("login")
            }

            onNavigateCheckout={() =>
              navigate("checkout")
            }

            onCartCountChange={
              setCartCount
            }
          />
        );

      case "checkout":

        return (
          <Checkout
            userId={currentUser?.id}

            onOrderPlaced={
              handleCheckoutComplete
            }
          />
        );

      case "orders":

        return (
          <MyOrders
            userId={currentUser?.id}

            onViewOrder={(orderId) => {

              setSelectedOrderId(orderId);

              setActiveView(
                "order-details"
              );

            }}
          />
        );

      case "order-details":

        return (
          <OrderDetails
            orderId={selectedOrderId}

            onPayment={() =>
              setActiveView("payment")
            }
          />
        );

      case "payment":

        return (
          <Payment
            orderId={selectedOrderId}
            paymentMethod={
              selectedPaymentMethod
            }
          />
        );

      case "admin-orders":

        return <AdminOrders />;

      case "home":
      default:

        return renderHome();
    }
  };

  // =========================
  // MAIN
  // =========================

  return (
    <div className="app">

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="navbar">

        <div
          className="logo"
          onClick={() => {
            setActiveView("home");
            setMenuOpen(false);
          }}
        >

          <span className="logo-icon">
            🛒
          </span>

          <span>
            SmartCart
          </span>

        </div>

        <button
          className="mobile-menu-btn"
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div
          className={
            menuOpen
              ? "mobile-nav open"
              : "mobile-nav"
          }
        >

          <div className="nav-links">

            <button
              className={
                activeView === "home"
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => {
                setActiveView("home");
                setMenuOpen(false);
              }}
            >
              Home
            </button>

            <button
              className="nav-item"
              onClick={goToProducts}
            >
              Products
            </button>

            <button
              className={
                activeView === "cart"
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => {
                setActiveView("cart");
                setMenuOpen(false);
              }}
            >
              Cart ({cartCount})
            </button>

            {currentUser && (
              <button
                className={
                  activeView === "orders"
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() => {
                  setActiveView("orders");
                  setMenuOpen(false);
                }}
              >
                My Orders 📦
              </button>
            )}

            {currentUser?.role === "ADMIN" && (
              <button
                className={
                  activeView === "admin-orders"
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() => {
                  setActiveView(
                    "admin-orders"
                  );
                  setMenuOpen(false);
                }}
              >
                Admin Orders ⚙️
              </button>
            )}

          </div>

          <div className="nav-right">

            {currentUser ? (

              <>

                <span className="welcome-user">
                  Hi,{" "}
                  {currentUser.name?.split(" ")[0]}
                  {" "}👋
                </span>

                <button
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>

              </>

            ) : (

              <div className="auth-buttons">

                <button
                  className="login-btn"
                  onClick={() => {
                    setActiveView("login");
                    setMenuOpen(false);
                  }}
                >
                  Login
                </button>

                <button
                  className="register-btn"
                  onClick={() => {
                    setActiveView("register");
                    setMenuOpen(false);
                  }}
                >
                  Register
                </button>

              </div>

            )}

          </div>

        </div>

      </nav>

      <main className="page-content">
        {renderView()}
      </main>

    </div>
  );
}

export default App;