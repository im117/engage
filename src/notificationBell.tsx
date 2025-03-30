// src/notificationBell.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import "./styles/notification.scss"; // Create this file for styling

// Get the login server URL from environment variables
let loginServer = "http://localhost:8081";
if (import.meta.env.VITE_LOGIN_SERVER !== undefined) {
  loginServer = import.meta.env.VITE_LOGIN_SERVER;
}

function formatNotificationMessage(notification: never) {
  const { sender_username, action_type, content_type, content_preview } =
    notification;

  switch (action_type) {
    case "like":
      if (content_type === "video") {
        return `${sender_username} liked your video "${content_preview}"`;
      } else if (content_type === "comment") {
        return `${sender_username} liked your comment "${content_preview}..."`;
      } else if (content_type === "reply") {
        return `${sender_username} liked your reply "${content_preview}..."`;
      }
      break;
    case "comment":
      return `${sender_username} commented on your video "${content_preview}"`;
    case "reply":
      return `${sender_username} replied to your comment "${content_preview}..."`;
    default:
      return `${sender_username} interacted with your content`;
  }
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch notifications and unread count
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Set up polling interval to check for new notifications
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 1000); // Check every 1 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return; // Don't fetch if not logged in

      const response = await axios.get(`${loginServer}/notifications`, {
        params: { auth: token },
      });
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return; // Don't fetch if not logged in

      const response = await axios.get(
        `${loginServer}/notifications/unread-count`,
        {
          params: { auth: token },
        }
      );
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const markAsRead = async (notificationIds = null) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      await axios.post(
        `${loginServer}/notifications/mark-read`,
        { notificationIds },
        { params: { auth: token } }
      );
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  return (
    <div className="notification-bell">
      <button
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (!showDropdown) fetchNotifications();
        }}
      >
        <i className="fa-solid fa-bell"></i>
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button onClick={() => markAsRead()}>Mark all as read</button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p>No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    !notification.is_read ? "unread" : ""
                  }`}
                  onClick={() => markAsRead([notification.id])}
                >
                  <p>{formatNotificationMessage(notification)}</p>
                  <span className="notification-time">
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
