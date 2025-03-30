import React from "react";
import { useNotifications } from "./NotificationContext";
import NotificationItem from "./NotificationItem";

const NotificationPanel = ({ onClose }) => {
  const { notifications, loading, error, markAsRead } = useNotifications();

  const handleMarkAllAsRead = () => {
    markAsRead();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-lg">Notifications</h3>
        <button
          className="text-sm text-blue-500 hover:text-blue-600"
          onClick={handleMarkAllAsRead}
        >
          Mark all as read
        </button>
      </div>

      <div className="overflow-y-auto flex-grow">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Loading notifications...
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No notifications</div>
        ) : (
          <ul>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 text-center">
        <button
          className="text-sm text-blue-500 hover:text-blue-600"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};
