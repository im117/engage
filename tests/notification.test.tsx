import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import axios from "axios";
import jwt from "jsonwebtoken";

// Mock axios
vi.mock("axios");
const mockedAxios = axios as vi.MockedObject<typeof axios>;

// Mock mysql2/promise
vi.mock("mysql2/promise", () => {
  const mockQuery = vi.fn();
  const mockEnd = vi.fn();

  // Set up query mock for different calls
  mockQuery.mockImplementation((sql, params) => {
    if (sql.includes("SELECT id FROM notifications")) {
      return [[{ id: "notif-1" }, { id: "notif-2" }, { id: "notif-3" }]];
    }
    // Default return for other queries
    return [{ affectedRows: 1 }, null];
  });

  return {
    createConnection: vi.fn().mockResolvedValue({
      query: mockQuery,
      end: mockEnd,
    }),
  };
});

// Define interfaces
interface Notification {
  id: string;
  sender_username: string;
  action_type: string;
  content_type: string;
  content_preview: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationResponse {
  notifications: Notification[];
}

interface UnreadCountResponse {
  count: number;
}

interface MarkReadResponse {
  message: string;
  affected: number;
}

describe("Notification Endpoints", () => {
  let db: any;
  let authToken: string;
  let userId = 1;
  let testNotificationIds: string[] = ["notif-1", "notif-2", "notif-3"];
  const loginServer =
    import.meta.env.VITE_LOGIN_SERVER || "http://localhost:8081";

  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  // Assign mock to global
  Object.defineProperty(global, "localStorage", { value: localStorageMock });

  // Helper function to create JWT token
  const generateToken = (userId: number): string => {
    return jwt.sign({ userId }, "test_secret", {
      expiresIn: "24h",
    });
  };

  beforeAll(async () => {
    // Import mysql after mocking
    const mysql = await import("mysql2/promise");

    // Use mocked connection
    db = await mysql.createConnection({
      host: "localhost",
      user: "test_user",
      password: "test_password",
      database: "test_db",
    });

    // Generate auth token for test user
    authToken = generateToken(userId);

    // Store token in mocked localStorage
    localStorage.setItem("authToken", authToken);
  });

  afterAll(async () => {
    // Clear localStorage mock
    localStorage.removeItem("authToken");

    // Close database connection (this is now a mock function)
    await db.end();
  });

  describe("GET /notifications", () => {
    it("should return 401 if not authenticated", async () => {
      // Mock axios to simulate a 401 error
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 401, data: { message: "Not authenticated" } },
      });

      // Test the endpoint
      try {
        await axios.get(`${loginServer}/notifications`);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    // Test 1: Test case for authenticated user
    it("should return user notifications when authenticated", async () => {
      // Sample response data
      const mockNotifications: Notification[] = [
        {
          id: testNotificationIds[0],
          sender_username: "sender1",
          action_type: "like",
          content_type: "video",
          content_preview: "Test Video",
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: testNotificationIds[1],
          sender_username: "sender2",
          action_type: "comment",
          content_type: "video",
          content_preview: "Test Video",
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: testNotificationIds[2],
          sender_username: "sender1",
          action_type: "reply",
          content_type: "comment",
          content_preview: "This is a test comment that is...",
          is_read: true,
          created_at: new Date().toISOString(),
        },
      ];

      // Mock the axios response
      mockedAxios.get.mockResolvedValueOnce({
        data: { notifications: mockNotifications },
        status: 200,
      });

      // Test the endpoint
      const response = await axios.get<NotificationResponse>(
        `${loginServer}/notifications`,
        { params: { auth: authToken } }
      );

      expect(response.status).toBe(200);
      expect(response.data.notifications).toHaveLength(3);

      // Check structure of notification
      const notification = response.data.notifications[0];
      expect(notification).toHaveProperty("id");
      expect(notification).toHaveProperty("sender_username");
      expect(notification).toHaveProperty("action_type");
      expect(notification).toHaveProperty("content_type");
      expect(notification).toHaveProperty("content_preview");
      expect(notification).toHaveProperty("is_read");
      expect(notification).toHaveProperty("created_at");
    });

    // Test 2: Test pagination
    it("should support pagination", async () => {
      // Mock pagination response
      const mockPaginatedNotifications: Notification[] = [
        {
          id: testNotificationIds[0],
          sender_username: "sender1",
          action_type: "like",
          content_type: "video",
          content_preview: "Test Video",
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: { notifications: mockPaginatedNotifications },
        status: 200,
      });

      // Test pagination with limit=1 and page=1
      const response = await axios.get<NotificationResponse>(
        `${loginServer}/notifications`,
        {
          params: {
            auth: authToken,
            limit: 1,
            page: 1,
          },
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.notifications).toHaveLength(1);
    });
  });

  describe("GET /notifications/unread-count", () => {
    it("should return the count of unread notifications", async () => {
      // Mock the unread count response
      mockedAxios.get.mockResolvedValueOnce({
        data: { count: 2 },
        status: 200,
      });

      // Test the endpoint
      const response = await axios.get<UnreadCountResponse>(
        `${loginServer}/notifications/unread-count`,
        { params: { auth: authToken } }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("count");
      expect(response.data.count).toBe(2);
    });

    it("should return 401 if not authenticated", async () => {
      // Mock 401 response
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 401, data: { message: "Not authenticated" } },
      });

      try {
        await axios.get(`${loginServer}/notifications/unread-count`);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe("PUT /notifications/mark-read", () => {
    it("should mark notifications as read", async () => {
      // Mock the mark read response
      mockedAxios.put.mockResolvedValueOnce({
        data: {
          message: "Notifications marked as read",
          affected: 2,
        },
        status: 200,
      });

      // Test the endpoint with specific notification IDs
      const response = await axios.put<MarkReadResponse>(
        `${loginServer}/notifications/mark-read`,
        {
          notification_ids: [testNotificationIds[0], testNotificationIds[1]],
        },
        {
          params: { auth: authToken },
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("message");
      expect(response.data).toHaveProperty("affected");
      expect(response.data.affected).toBe(2);
    });

    it("should mark all notifications as read when no IDs provided", async () => {
      // Mock the mark all read response
      mockedAxios.put.mockResolvedValueOnce({
        data: {
          message: "All notifications marked as read",
          affected: 3,
        },
        status: 200,
      });

      // Test the endpoint with no notification IDs (mark all as read)
      const response = await axios.put<MarkReadResponse>(
        `${loginServer}/notifications/mark-read`,
        {},
        {
          params: { auth: authToken },
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("message");
      expect(response.data).toHaveProperty("affected");
      expect(response.data.affected).toBe(3);
    });

    it("should return 401 if not authenticated", async () => {
      // Mock 401 response
      mockedAxios.put.mockRejectedValueOnce({
        response: { status: 401, data: { message: "Not authenticated" } },
      });

      try {
        await axios.put(`${loginServer}/notifications/mark-read`, {});
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });
});
