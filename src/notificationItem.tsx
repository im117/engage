import React from "react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  sender_username: string;
  action_type: "like" | "comment" | "reply" | "follow";
  content_type?: "video" | "comment" | "reply";
  content_preview?: string;
  created_at: string;
  is_read: boolean;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (ids: string[]) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const formatMessage = (notification: Notification) => {
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
      case "follow":
        return `${sender_username} followed you`;
      default:
        return `${sender_username} interacted with your content`;
    }
  };

  const getIcon = (actionType: string) => {
    switch (actionType) {
      case "like":
        return "❤️";
      case "comment":
        return "💬";
      case "reply":
        return "↩️";
      case "follow":
        return "👤";
      default:
        return "🔔";
    }
  };

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead([notification.id]);
    }

    // Handle navigation based on notification type
    // This is where you would implement navigation to the relevant content
    console.log("Navigate to content:", notification);
  };

  return (
    <li
      className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.is_read ? "bg-blue-50" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-1">
          <span className="text-xl">{getIcon(notification.action_type)}</span>
        </div>
        <div className="flex-grow">
          <p className="text-sm">{formatMessage(notification)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
            })}
          </p>
        </div>
        {!notification.is_read && (
          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
        )}
      </div>
    </li>
  );
};

export default NotificationItem;
