import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface Notification {
  id: string;
  is_read: boolean;
  // Add other notification properties as needed
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationIds?: string[] | null) => Promise<any>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async (): Promise<void> => {
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

  const fetchUnreadCount = async (): Promise<void> => {
    try {
      const response = await axios.get("/notifications/unread-count");
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const markAsRead = async (
    notificationIds: string[] | null = null
  ): Promise<any> => {
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

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
