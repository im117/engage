// NotificationContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface NotificationContextType {
  notifications: CustomNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationIds: string[] | null) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  fetchNotifications: async () => {},
  fetchUnreadCount: async () => {},
  markAsRead: async () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  interface CustomNotification {
    id: string;
    is_read: boolean;
    [key: string]: any; // Add other properties as needed
  }

  const [notifications, setNotifications] = useState<CustomNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/notifications");
      setNotifications(response.data.notifications);
      setError(null);
    } catch (err) {
      setError("Failed to fetch notifications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get("/notifications/unread-count");
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const markAsRead = async (notificationIds: string[] | null = null) => {
    try {
      const response = await axios.post("/notifications/mark-read", {
        notificationIds,
      });

      if (notificationIds) {
        // Mark specific notifications as read
        setNotifications((prev) =>
          prev.map((notification) =>
            notificationIds.includes(notification.id)
              ? { ...notification, is_read: true }
              : notification
          )
        );
      } else {
        // Mark all as read
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, is_read: true }))
        );
      }

      await fetchUnreadCount();
      return response.data;
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
      throw err;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Set up interval to refresh notification count every minute
    const interval = setInterval(fetchUnreadCount, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
