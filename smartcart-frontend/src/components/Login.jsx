import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // Icons import cheyyuka
import { loginUser } from "../services/userService";
import "./Login.css";

function Login({ onRegister, onLoginSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            setMessage("Logging in...");

            console.log("Login Email:", email);

            const response = await loginUser({
                email: email.trim(),
                password: password
            });

            console.log("Login Response:", response.data);
            console.log("Logged User ID:", response.data.id);

            // SAVE JWT TOKEN
            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                console.log("JWT token saved successfully ✅");
            } else {
                console.error("JWT token not found in login response ❌");
            }

            // SAVE USER
            localStorage.setItem("user", JSON.stringify(response.data));

            setMessage("Login successful! ✅");

            if (onLoginSuccess) {
                onLoginSuccess(response.data);
            }

        } catch (error) {
            console.error("Login Error:", error);
            setMessage(
                error.response?.data?.error ||
                (typeof error.response?.data === "string"
                    ? error.response.data
                    : "Invalid email or password ❌")
            );
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h1>Login 🔐</h1>

                <form onSubmit={handleLogin}>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email"
                        required
                    />

                    <label>Password</label>

                    {/* PASSWORD FIELD WITH ICON */}
                    <div className="password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {/* Emoji-kku pakaram icon upayogikkunnu */}
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <button type="submit">Login</button>
                </form>

                {message && <p>{message}</p>}

                <p>
                    Don't have an account?{" "}
                    <button type="button" onClick={onRegister}>
                        Create Account
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Login;