import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import "./login.scss";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your login logic here
    console.log("Logging in with", email, password);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center bg-primary"
      style={{ height: "100vh" }}
    >
      <div className="bg-white p-5 rounded" style={{ width: 400 }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email">
              <strong>Email</strong>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter Email"
              className="form-control rounded-0"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password">
              <strong>Password</strong>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter Password"
              className="form-control"
            />
          </div>
          <button type="submit" className="btn btn-success w-100">
            Login
          </button>
          <p>You agree to our terms and policies</p>
          <button type="button" className="btn btn-default border w-100">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Login />
  </StrictMode>
);
