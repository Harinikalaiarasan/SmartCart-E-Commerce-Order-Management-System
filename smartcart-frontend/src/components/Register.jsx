import { useState } from "react";
import {
    registerUser,
    sendOtp
} from "../services/userService";
import "./Register.css";

function Register({ onLogin, onOTP }) {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [address, setAddress] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [message, setMessage] = useState("");

    const handleRegister = async (e) => {

        e.preventDefault();

        try {

            setMessage("Creating account...");

            const response = await registerUser({
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                password: password,
                address: address.trim()
            });

            console.log(
                "Register Response:",
                response.data
            );

            await sendOtp(email.trim());

            setMessage(
                "Registration successful! OTP sent 📧"
            );

            onOTP(email.trim());

        } catch (error) {

            console.error(
                "Register Error:",
                error
            );

            setMessage(
                error.response?.data?.error ||
                (
                    typeof error.response?.data === "string"
                        ? error.response.data
                        : "Registration failed ❌"
                )
            );
        }
    };

    return (

        <div className="register-page">

            <div className="register-card">

                <h1>
                    Create Account 👤
                </h1>

                <form onSubmit={handleRegister}>

                    <label>
                        Name
                    </label>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        placeholder="Enter your name"
                        required
                    />

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        placeholder="Enter email"
                        required
                    />

                    <label>
                        Phone
                    </label>

                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) =>
                            setPhone(e.target.value)
                        }
                        placeholder="Enter phone number"
                        required
                    />

                    <label>
                        Password
                    </label>

                    {/* PASSWORD FIELD */}

                    <div className="password-wrapper">

                        <input
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Enter password"
                            required
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() =>
                                setShowPassword(!showPassword)
                            }
                            aria-label={
                                showPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </button>

                    </div>

                    <label>
                        Address
                    </label>

                    <input
                        type="text"
                        value={address}
                        onChange={(e) =>
                            setAddress(e.target.value)
                        }
                        placeholder="Enter delivery address"
                        required
                    />

                    <button type="submit">
                        Register
                    </button>

                </form>

                {message && (
                    <p>
                        {message}
                    </p>
                )}

                <p>
                    Already have an account?{" "}

                    <button
                        type="button"
                        onClick={onLogin}
                    >
                        Login
                    </button>

                </p>

            </div>

        </div>
    );
}

export default Register;
