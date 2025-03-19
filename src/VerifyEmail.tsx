import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

let loginServer = "http://localhost:8081";
if (import.meta.env.VITE_LOGIN_SERVER !== undefined) {
  // console.log(import.meta.env.VITE_UPLOAD_SERVER);
  loginServer = import.meta.env.VITE_LOGIN_SERVER;
}

const VerifyEmail: React.FC = () => {
  const [message, setMessage] = useState<string>("Verifying...");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      axios
        .get(`${loginServer}/verify-email?token=${token}`)
        .then((res) => {
          setMessage(res.data.message);
          setTimeout(() => navigate("/login"), 3000); // Redirect after 3 seconds
        })
        .catch((err) => {
          setMessage(
            err.response?.data?.message || "Invalid or expired token."
          );
        });
    } else {
      setMessage("Invalid request.");
    }
  }, [location, navigate]);

  return (
    <div className="verify-email__container">
      <h2>Email Verification</h2>
      <p>{message}</p>
    </div>
  );
};

export default VerifyEmail;
