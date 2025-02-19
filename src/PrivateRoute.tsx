import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
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
        const response = await axios.post(`${loginServer}/verifyToken`, {
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
