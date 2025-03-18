import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/auth.scss";
import validation from "./loginValidation";
import axios from "axios";

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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // New state to track authentication check

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/"); // If token exists, navigate to the videoplayer
    } else {
      setIsCheckingAuth(false); // Allow the login page to render if no token
    }
  }, [navigate]);

  if (isCheckingAuth) {
    return <div>Loading...</div>; // Prevent flickering by showing a temporary loading message
  }

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
        .post(`${loginServer}/login`, values)
        .then((response) => {
          // Check if the response has a token or success message
          // console.log(response.data);
          const token = response.data.token; // Get JWT from response
          if (token) {
            localStorage.setItem("authToken", token); // Store JWT token in localStorage
            setSuccessMessage("Login successful! Redirecting..."); // Display success message
            setTimeout(() => {
              navigate("/"); // Redirect to VideoPlayer after success message
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
    <div className="auth__body">
      <div className="auth__form">
        <h2 className="auth__title">Login</h2>
        {successMessage && (
          <div className="auth__success-message">{successMessage}</div> // Show success message
        )}
        <form onSubmit={handleSubmit}>
          <div className="auth__container">
            <label htmlFor="usernameOrEmail">
              <strong>User Id</strong>
            </label>
            <input
              type="usernameOrEmail"
              id="usernameOrEmail"
              value={usernameOrEmail} // Can be username OR email
              onChange={handleUsernameOrEmailChange}
              placeholder="Enter Username OR Email"
              className="auth__form-control"
            />
            {errors.usernameOrEmail && (
              <span className="auth__text-danger">{errors.usernameOrEmail}</span>
            )}
          </div>
          <div className="auth__container">
            <label htmlFor="password">
              <strong>Password</strong>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter Password"
              className="auth__form-control"
            />
            {errors.password && (
              <span className="auth__text-danger">{errors.password}</span>
            )}
          </div>
          <div className="auth__buttons-container">
            <button type="submit" className="button success">
              Login
            </button>
            <Link to="/reset-password" className="button danger">
              Reset Password
            </Link>
            <Link to="/signup" className="button primary">
              Create Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
