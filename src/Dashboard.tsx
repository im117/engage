import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.scss";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the authentication token from localStorage
    localStorage.removeItem("authToken");
    // Navigate to login page
    navigate("/");
  };

  const handleGoToVideoPlayer = () => {
    navigate("/videoplayer");
  };

  return (
    <div className="dashboard-container">
      <h2>Welcome to your Dashboard!</h2>
      <div>
        <button onClick={handleLogout} className="btn btn-danger">
          Log out
        </button>
        <button onClick={handleGoToVideoPlayer} className="btn btn-primary">
          Go to Video Player
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
