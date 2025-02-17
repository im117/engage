import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.scss";
import validation from "./loginValidation";
import axios from "axios";

interface FormValues {
  username: string;
  password: string;
}

interface FormErrors {
  username?: string;
  password?: string;
}

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [values, setValues] = useState<FormValues>({ username: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>(""); // New state for success message
  const navigate = useNavigate();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setValues({ ...values, username: e.target.value });
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
      console.log(values); //
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
            setErrors({ ...errors, password: "Invalid username or password" });
          }
        })
        .catch((error) => {
          console.error("There was an error during login", error);
          if (error.response && error.response.status === 404) {
            // Username not found error
            setErrors({ username: "Username does not exist! Please sign up!" });
          } else if (error.response && error.response.status === 401) {
            // Invalid password
            setErrors({ password: "Incorrect password! Please try again!" });
          } else {
            // General error
            setErrors({ password: "An error occurred during login" });
            // console.log(error);
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
            <label htmlFor="username" className="login__label">
              <strong>Username</strong>
            </label>
            <input
              type="username"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter Username"
              className="login__form-control"
            />
            {errors.username && (
              <span className="login__text-danger">{errors.username}</span>
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
