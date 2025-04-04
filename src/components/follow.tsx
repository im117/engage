import React, { useState, useEffect } from "react";
import axios from "axios";

interface FollowProps {
  fileName: string;
}

let uploadServer = "http://localhost:3001";
if (import.meta.env.VITE_UPLOAD_SERVER !== undefined) {
  uploadServer = import.meta.env.VITE_UPLOAD_SERVER;
}
let loginServer = "http://localhost:8081";
if (import.meta.env.VITE_LOGIN_SERVER !== undefined) {
  loginServer = import.meta.env.VITE_LOGIN_SERVER;
}

const Follow: React.FC<FollowProps> = ({ fileName }) => {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch follow status when the component mounts or when userId/fileName changes
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    console.log("Auth Token:", token); // Log the token for debugging
    if (!token) {
      console.error("No token found for useEffect.");
      setFollowing(false);
      return;
    }
    const fetchFollowStatus = async () => {
      try {
        const response = await axios.get(`${uploadServer}/get-follow-status`, {
          params: { fileName }, 
          headers: { Authorization: token }, // Send the token in the Authorization header
        });
        setFollowing(response.data.following);
        // alert(response.data.following);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error fetching follow status:", error.response?.data || error.message);
        } else {
          console.error("Error fetching follow status:", error);
        }
      }
    };

    fetchFollowStatus();
  }, [fileName]);

  // Handle follow action
  const handleFollow = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        "http://localhost:3001/follow-user",
        { fileName },
        { headers: { Authorization: token } } 
      );
      setFollowing(true);
    } catch (error) {
      console.error("Error following user:", error);
    }
    setLoading(false);
  };

  // Handle unfollow action
  const handleUnfollow = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        "http://localhost:3001/unfollow-user",
        // { userId },
        { headers: { Authorization: token } } 
      );
      setFollowing(false);
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={following ? handleUnfollow : handleFollow}
      disabled={loading}
      style={{
        backgroundColor: following ? "#4CAF50" : "#008CBA",
        color: "white",
        border: "none",
        padding: "8px 16px",
        cursor: "pointer",
      }}
    >
      {loading ? "Processing..." : following ? "Followed" : "Follow"}
    </button>
  );
};

export default Follow;
