// will protect routes like /dashboard and /videoplayer, ensuring that only authenticated users can access them.
import React from "react";
import { Route, Navigate, Outlet } from "react-router-dom";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const authToken = localStorage.getItem("authToken");

  // If there's no auth token, navigate to login
  if (!authToken) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
