import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";

const PrivateRoute: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await axios.post("http://localhost:8081/verifyToken", {
          token,
        });
        setIsAuthenticated(response.data.valid);
      } catch (error) {
        console.error("Token verification failed:", error);
        setIsAuthenticated(false);
      }
    };

    verifyToken();
  }, [token]);

  if (isAuthenticated === null) return <p>Loading...</p>;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
