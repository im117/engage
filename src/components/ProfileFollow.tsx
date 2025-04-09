import React, { useState, useEffect } from "react";
import axios from "axios";

interface ProfileFollowProps {
  targetUsername: string;
}

let uploadServer = "http://localhost:3001";
if (import.meta.env.VITE_UPLOAD_SERVER !== undefined) {
  uploadServer = import.meta.env.VITE_UPLOAD_SERVER;
}
let loginServer = "http://localhost:8081";
if (import.meta.env.VITE_LOGIN_SERVER !== undefined) {
  loginServer = import.meta.env.VITE_LOGIN_SERVER;
}

const ProfileFollow: React.FC<ProfileFollowProps> = ({ targetUsername }) => {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSelf, setIsSelf] = useState(false); // Track if the user is trying to follow themselves
  const [followCount, setFollowCount] = useState(0); // Track the follow count
  const [targetUserId, setTargetUserId] = useState<number | null>(null); // Track the target user ID    
  const [loggedIn, setLoggedIn] = useState(false); // Track if the user is logged in

  useEffect(() => {
    if (!targetUsername) {
      console.error("targetUser is missing or empty in Follow component.");
      return;
    }

    const fetchLoggedInStatus = async () => {
        const token = localStorage.getItem("authToken");
        if (token){
            setLoggedIn(true); // Set loggedIn to true if token exists
        } else {
            setLoggedIn(false); // Set loggedIn to false if token doesn't exist
        }
    };

    const fetchTargetUserId = async () => {
      try {
        const response = await axios.get(`${loginServer}/user-by-username/${targetUsername}`);
        setTargetUserId(response.data.user.id); // Set the target user ID
      } catch (error) {
        if ((error as any).response?.status === 404) {
          console.error("User not found:", targetUsername);
        } else {
          console.error("Error fetching target user ID:", (error as any).response?.data || (error as any).message);
        }
      }
    };

    fetchLoggedInStatus(); // Fetch logged-in status
    fetchTargetUserId();
  }, [targetUsername]);

  useEffect(() => {
    if (targetUserId === null) return; // Wait until targetUserId is set

    const fetchFollowCount = async () => {
      try {
        const response = await axios.get(`${uploadServer}/get-follow-count`, {
          params: { targetUserId },
        });
        setFollowCount(response.data.follow_count || 0);
      } catch (error) {
        console.error("Error fetching follow count:", (error as any).response?.data || (error as any).message);
      }
    };

    const fetchIsSelfStatus = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found for fetching isSelf status.");
        setIsSelf(false);
        return;
      }
      try {
        const response = await axios.get(`${uploadServer}/get-is-self`, {
          params: { targetUserId },
          headers: { Authorization: token },
        });
        setIsSelf(response.data.isSelf);
      } catch (error) {
        console.error("Error fetching isSelf status:", (error as any).response?.data || (error as any).message);
      }
    };

    const fetchFollowStatus = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found for fetching follow status.");
        setFollowing(false);
        return;
      }
      try {
        const response = await axios.get(`${uploadServer}/get-follow-status`, {
          params: { targetUserId },
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
  }, [targetUserId, loggedIn]);

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
        `${uploadServer}/follow-user-profile`,
        { targetUserId }, // Send fileName in the body
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
        { targetUserId }, // Send fileName in the body
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
    <div>
      <button
        onClick={following ? handleUnfollow : handleFollow}
        className={following ? "button following" : "button not-following"}
        disabled={loading || isSelf}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          cursor: loading || isSelf ? "default" : "pointer",
          color: following ? "green" : "white",
          textDecoration: "none",
          padding: "4px 8px",
          fontSize: "0.9em",
          float: "left", // Float the button to the left
        }}
      >
        <i
          className={`fa-solid ${following ? "fa-user-check" : "fa-user-plus"}`}
          style={{ fontSize: "1em" }} 
        ></i>
        {/* Display the follow count */}
        <span style={{ fontWeight: "bold", marginRight: "4px" }}>
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
    </div>
  );
};

export default ProfileFollow;
