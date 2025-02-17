import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.scss";
import validation from "./loginValidation";
import axios from "axios";

interface FormValues {
  usernameOrEmail: string;
  password: string;
}

interface FormErrors {
  usernameOrEmail?: string;
  password?: string;
}

const Login: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [values, setValues] = useState<FormValues>({ usernameOrEmail: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>(""); // New state for success message
  const navigate = useNavigate();

  const handleUsernameOrEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsernameOrEmail(e.target.value);
    setValues({ ...values, usernameOrEmail: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setValues({ ...values, password: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Run validation on the values
    const validationErrors = validation(values);
    setErrors(validationErrors);

    // Check if there are no validation errors
    if (Object.keys(validationErrors).length === 0) {
      // Make API call if no validation errors
      axios
        .post("http://localhost:8081/login", values)
        .then((response) => {
          // Check if the response has a token or success message
          console.log(response.data);
          const token = response.data.token; // Get JWT from response
          if (token) {
            localStorage.setItem("authToken", token); // Store JWT token in localStorage
            setSuccessMessage("Login successful! Redirecting..."); // Display success message
            setTimeout(() => {
              navigate("/videoplayer"); // Redirect to VideoPlayer after success message
            }, 1500); // Redirect after 1.5 seconds
          } else {
            setErrors({ ...errors, password: "Invalid username/email or password" });
          }
        })
        .catch((error) => {
          console.error("There was an error during login", error);
          if (error.response && error.response.status === 404) {
            // Username or email not found error
            setErrors({ usernameOrEmail: "User Id does not exist! Please sign up!" });
          } else if (error.response && error.response.status === 401) {
            // Invalid password
            setErrors({ password: "Incorrect password! Please try again!" });
          } else {
            // General error
            setErrors({ password: "An error occurred during login" });
          }
        });
    }
  };

  return (
    <div className="login__body">
      <div className="login__form">
        <h2>Login</h2>
        {successMessage && (
          <div className="login__success-message">{successMessage}</div> // Show success message
        )}
        <form onSubmit={handleSubmit}>
          <div className="login__container">
            <label htmlFor="usernameOrEmail" className="login__label">
              <strong>User Id</strong>
            </label>
            <input
              type="usernameOrEmail"
              id="usernameOrEmail"
              value={usernameOrEmail} // Can be username OR email
              onChange={handleUsernameOrEmailChange}
              placeholder="Enter Username OR Email"
              className="login__form-control"
            />
            {errors.usernameOrEmail && (
              <span className="login__text-danger">{errors.usernameOrEmail}</span>
            )}
          </div>
          <div className="login__container">
            <label htmlFor="password" className="login__label">
              <strong>Password</strong>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter Password"
              className="login__form-control"
            />
            {errors.password && (
              <span className="login__text-danger">{errors.password}</span>
            )}
          </div>
          <div className="login__buttons-container">
            <button type="submit" className="login__btn login__btn--success">
              Login
            </button>
            <Link to="/reset-password" className="login__button">
              Reset Password
            </Link>
            <Link to="/signup" className="login__button">
              Create Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
