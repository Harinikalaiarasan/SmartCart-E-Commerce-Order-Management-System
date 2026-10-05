import { useState } from "react";
import {
    verifyOtp,
    sendOtp
} from "../services/userService";
import "./VerifyOTP.css";

function VerifyOTP({ email, onVerified }) {

    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        try {
            setMessage("Verifying OTP...");

            const response = await verifyOtp(
                email.trim(),
                otp.trim()
            );

            console.log("OTP Response:", response.data);

            setMessage(
                "OTP verified successfully! ✅"
            );

            setTimeout(() => {
                onVerified();
            }, 800);

        } catch (error) {
            console.error("OTP Error:", error);

            setMessage(
                error.response?.data?.error ||
                (
                    typeof error.response?.data === "string"
                        ? error.response.data
                        : "Invalid OTP ❌"
                )
            );
        }
    };

    const handleResendOTP = async () => {
        try {
            setMessage("Resending OTP...");

            await sendOtp(email.trim());

            setMessage(
                "New OTP sent successfully! 📧"
            );

        } catch (error) {
            console.error("Resend OTP Error:", error);

            setMessage(
                error.response?.data?.error ||
                (
                    typeof error.response?.data === "string"
                        ? error.response.data
                        : "Failed to resend OTP ❌"
                )
            );
        }
    };

    return (
        <div className="otp-page">

            <div className="otp-card">

                <h1>Verify OTP 📧</h1>

                <p>
                    OTP sent to:
                    <strong> {email}</strong>
                </p>

                <form onSubmit={handleVerifyOTP}>

                    <label>Enter OTP</label>

                    <input
                        type="text"
                        value={otp}
                        onChange={(e) =>
                            setOtp(e.target.value)
                        }
                        placeholder="Enter 6 digit OTP"
                        maxLength="6"
                        required
                    />

                    <button type="submit">
                        Verify OTP
                    </button>

                </form>

                <div className="otp-actions">

                    <p>Didn't receive code?</p>

                    <button
                        type="button"
                        className="resend-otp-btn"
                        onClick={handleResendOTP}
                    >
                        Resend OTP
                    </button>

                </div>

                {message && (
                    <p className="otp-message">
                        {message}
                    </p>
                )}

            </div>

        </div>
    );
}

export default VerifyOTP;