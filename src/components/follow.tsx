import React, { useState } from "react";
import axios from "axios";

interface FollowProps {
  userId: number;
  initialFollowing: boolean;
}

const Follow: React.FC<FollowProps> = ({ userId, initialFollowing }) => {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      // console.log("Auth Token:", token);
      // console.log("User ID:", userId);
      
      const response = await axios.post(
        "http://localhost:3001/follow-user",
        { userId },
        { headers: { Authorization: token || "" } }
      );
      setFollowing(true);
      console.log("Follow response:", response.data);
    
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error following user:", error.response?.data || error.message);
      } else {
        console.error("Error following user:", error);
      }
    }
    setLoading(false);
  };

  const handleUnfollow = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        "http://localhost:3001/unfollow-user",
        { userId },
        { headers: { Authorization: token || "" } }
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
