// This is a simple implementation to protect routes that require authentication.
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// This is a simple implementation to check for auth token in localStorage
const PrivateRoute: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem("authToken");

  return isAuthenticated ? (
    <Outlet /> // Renders the child routes if authenticated
  ) : (
    <Navigate to="/" /> // Redirect to login if not authenticated
  );
};

export default PrivateRoute;
