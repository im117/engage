import React, { useState, useEffect } from "react";
import axios from "axios";

interface FollowProps {
  fileName: string;
  loggedIn: boolean;
}

let uploadServer = "http://localhost:3001";
if (import.meta.env.VITE_UPLOAD_SERVER !== undefined) {
  uploadServer = import.meta.env.VITE_UPLOAD_SERVER;
}
let loginServer = "http://localhost:8081";
if (import.meta.env.VITE_LOGIN_SERVER !== undefined) {
  loginServer = import.meta.env.VITE_LOGIN_SERVER;
}

const Follow: React.FC<FollowProps> = ({ fileName, loggedIn }) => {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSelf, setIsSelf] = useState(false); // Track if the user is trying to follow themselves
  const [followCount, setFollowCount] = useState(0); // Track the follow count

  // Consolidated useEffect
  useEffect(() => {
    if (!fileName) {
      console.error("fileName is missing or empty in Follow component.");
      return;
    }

    // Fetch follow count
    const fetchFollowCount = async () => {
      
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found for fetching follow count.");
        return;
      }
      try {
        
        const response = await axios.get(`${uploadServer}/get-follow-count`, {
          params: { fileName },
          headers: { Authorization: token },
        });
        // console.log("Follow count response:", response.data); // Debugging log

        setFollowCount(response.data.follow_count || 0); 
        // alert(followCount); // Display the follow count in an alert
      } catch (error) {
        console.error("Error fetching follow count:", (error as any).response?.data || (error as any).message);
      }
    };

    // Fetch isSelf status
    const fetchIsSelfStatus = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found for fetching isSelf status.");
        setIsSelf(false);
        return;
      }
      try {
        const response = await axios.get(`${uploadServer}/get-is-self`, {
          params: { fileName },
          headers: { Authorization: token },
        });
        setIsSelf(response.data.isSelf);
      } catch (error) {
        console.error("Error fetching isSelf status:", (error as any).response?.data || (error as any).message);
      }
    };

    // Fetch follow status
    const fetchFollowStatus = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found for fetching follow status.");
        setFollowing(false);
        return;
      }
      try {
        const response = await axios.get(`${uploadServer}/get-follow-status`, {
          params: { fileName },
          headers: { Authorization: token },
        });
        setFollowing(response.data.following);
      } catch (error) {
        console.error("Error fetching follow status:", (error as any).response?.data || (error as any).message);
      }
    };

    // Call all fetch functions
    fetchFollowCount();
    fetchIsSelfStatus();
    fetchFollowStatus();
  }, [fileName]);

  // Handle follow action
  const handleFollow = async () => {
    if (!loggedIn) {
      alert("You must be logged in to follow.");
      return;
    }
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Authentication error. Please log in again.");
      return;
    }


    setLoading(true);
    try {

      await axios.post(
        `${uploadServer}/follow-user`,
        { fileName }, // Send fileName in the body
        {
          headers: { Authorization: token }, // Send token in the Authorization header
        }
      );
      setFollowing(true);
      setFollowCount((prev) => prev + 1); // Increment follow count
    } catch (error) {
      console.error("Error following user:", (error as any).response?.data || (error as any).message);
    }
    setLoading(false);
  };

  // Handle unfollow action
  const handleUnfollow = async () => {
    if (!loggedIn) {
      alert("You must be logged in to follow.");
      return;
    }
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Authentication error. Please log in again.");
      return;
    }

    setLoading(true);
    try {

      await axios.post(
        `${uploadServer}/unfollow-user`,
        { fileName }, // Send fileName in the body
        {
          headers: { Authorization: token }, // Send token in the Authorization header
        }
      );
      setFollowing(false);
      setFollowCount((prev) => Math.max(prev - 1, 0)); // Decrement follow count, ensuring it doesn't go below 0
    } catch (error) {
      console.error("Error unfollowing user:", (error as any).response?.data || (error as any).message);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={following ? handleUnfollow : handleFollow}
      className={following ? "button following" : "button not-following"}
      disabled={loading || isSelf}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: loading || isSelf ? "default" : "pointer",
        color: following ? "green" : "white",
        textDecoration: "none",
        width: "fit-content",
        margin: "0 auto",
      }}
    >
      <i
        className={`fa-solid ${following ? "fa-user-check" : "fa-user-plus"}`}
        style={{ fontSize: "1.2em" }}
      ></i>
      {/* Display the follow count */}
      <span style={{ fontWeight: "bold", marginRight: "8px" }}>
        {followCount} {/* Follow count */}
      </span>
      {/* Display the button text */}
      <span>
        {isSelf
          ? "You"
          : loading
          ? "Processing..."
          : following
          ? "Unfollow"
          : "Follow"}
      </span>
    </button>
  );
};

export default Follow;
