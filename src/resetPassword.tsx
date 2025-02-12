import React, { useState } from "react";
import axios from "axios";
import "./styles/resetPassword.scss";
import { Link, useNavigate } from "react-router-dom";

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    // Frontend validation for matching passwords
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8081/reset-password",
        {
          email,
          newPassword,
        }
      );
      setMessage(response.data.message);
      setTimeout(() => {
        navigate("/"); // Redirect to Login after success message
      }, 1500); // Redirect after 1.5 seconds
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="reset-password__body">
      <div className="reset-password__form">
        <h2>Reset Password</h2>
        {message && <div className="reset-password__success">{message}</div>}
        {error && <div className="reset-password__error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>
            <strong>Email:</strong>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <label>
            <strong>New Password:</strong>
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />

          <label>
            <strong>Confirm Password:</strong>
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />

          <button type="submit">Reset Password</button>
        </form>

        <div className="reset__buttons-container">
          <Link to="/">
            <button className="reset__button">Go to Login</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
