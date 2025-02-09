import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate for redirection
import "./login.scss";
import validation from "./loginValidation";
import axios from "axios";

interface FormValues {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [values, setValues] = useState<FormValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate(); // Initialize navigate function for redirection

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setValues({ ...values, email: e.target.value });
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
          console.log(response.data); // Add logging here for debugging
          // Check if login was successful and redirect
          if (response.data.token) {
            localStorage.setItem("authToken", response.data.token); // Save token if needed
            navigate("/videoplayer"); // Redirect to VideoPlayer
          } else {
            setErrors({ ...errors, password: "Invalid email or password" });
          }
        })
        .catch((error) => {
          console.error("There was an error during login", error);
          setErrors({ ...errors, password: "An error occurred during login" });
        });
    }
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
            {errors.email && (
              <span className="text-danger">{errors.email}</span>
            )}
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
            {errors.password && (
              <span className="text-danger">{errors.password}</span>
            )}
          </div>
          <button type="submit" className="btn btn-success w-100">
            Login
          </button>
          <p>You agree to our terms and policies</p>
          <Link
            to="/signup"
            className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none"
          >
            Create Account
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Login;
