import React, { useState } from "react";
import axios from "axios";
import "./styles/auth.scss";
import { Link, useNavigate } from "react-router-dom";

// let uploadServer = "http://localhost:3001";
// if (import.meta.env.VITE_UPLOAD_SERVER !== undefined) {
//   // console.log(import.meta.env.VITE_UPLOAD_SERVER);
//   uploadServer = import.meta.env.VITE_UPLOAD_SERVER;
// }
let loginServer = "http://localhost:8081"

if (import.meta.env.VITE_LOGIN_SERVER !== undefined) {
  // console.log(import.meta.env.VITE_UPLOAD_SERVER);
  loginServer = import.meta.env.VITE_LOGIN_SERVER;
}



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
        `${loginServer}/reset-password`,
        {
          email,
          newPassword,
        }
      );
      setMessage(response.data.message);
      setTimeout(() => {
        navigate("/login"); // Redirect to Login after success message
      }, 1500); // Redirect after 1.5 seconds
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="auth__body">
      <div className="auth__form">
        <h2>Reset Password</h2>
        {message && <div className="auth__success">{message}</div>}
        {error && <div className="auth__error">{error}</div>}
        <form onSubmit={handleSubmit}>

          <div className="auth__container">

          <label>
            <strong>Email:</strong>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="auth__form-control"
          />
          </div>

<div className="auth__container">

          <label>
            <strong>New Password:</strong>
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
            className="auth__form-control"
          />
</div>

<div className="auth__container">

          <label>
            <strong>Confirm Password:</strong>
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            className="auth__form-control"
          />
</div>

          
        <button type="submit" className="button danger">Reset Password</button>
        <br /> <br />
          <Link to="/login">
            <button className="button primary">Go to Login</button>
          </Link>
          
        </form>

        <div>
          
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
