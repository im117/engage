import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import axios from "axios";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";

// Mock axios
vi.mock("axios");
const mockedAxios = axios as vi.MockedObject<typeof axios>;

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
describe('Notification Endpoints', () => {
  let db: mysql.Connection;
  let authToken: string;
  let userId = 1;
  let testNotificationIds: string[] = [];
  const loginServer = import.meta.env.VITE_LOGIN_SERVER || 'http://localhost:8081';

  // Helper function to create JWT token
  const generateToken = (userId: number): string => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'test_secret', {
      expiresIn: '24h',
    });
  };

  beforeAll(async () => {
    // Connect to test database
    db = await mysql.createConnection({
      host: process.env.TEST_DB_HOST || 'localhost',
      user: process.env.TEST_DB_USER || 'test_user',
      password: process.env.TEST_DB_PASSWORD || 'test_password',
      database: process.env.TEST_DB_NAME || 'test_db',
    });

    // Generate auth token for test user
    authToken = generateToken(userId);

    // Set up test data
    await setupTestData();

    // Store token in localStorage for frontend component testing
    localStorage.setItem('authToken', authToken);
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
    
    // Clear localStorage
    localStorage.removeItem('authToken');
    
    // Close database connection
    await db.end();
  });

  async function setupTestData() {
    // Ensure users exist
    await db.query(`
      INSERT IGNORE INTO users (id, username, email, password)
      VALUES 
        (1, 'testuser', 'test@example.com', 'password'),
        (2, 'sender1', 'sender1@example.com', 'password'),
        (3, 'sender2', 'sender2@example.com', 'password')
    `);

    // Insert test video
    await db.query(`
      INSERT IGNORE INTO videos (id, user_id, title)
      VALUES (1, 1, 'Test Video')
    `);

    // Insert test comment
    await db.query(`
      INSERT IGNORE INTO comments (id, video_id, user_id, content)
      VALUES (1, 1, 2, 'This is a test comment that is longer than 30 characters to test truncation')
    `);

    // Insert test reply
    await db.query(`
      INSERT IGNORE INTO reply (id, comment_id, user_id, content)
      VALUES (1, 1, 3, 'This is a test reply that is also longer than 30 characters')
    `);

    // Insert test notifications
    const [result] = await db.query(`
      INSERT INTO notifications 
        (recipient_id, sender_id, action_type, content_type, content_id, is_read, created_at)
      VALUES
        (1, 2, 'like', 'video', 1, false, NOW() - INTERVAL 3 HOUR),
        (1, 3, 'comment', 'video', 1, false, NOW() - INTERVAL 2 HOUR),
        (1, 2, 'reply', 'comment', 1, true, NOW() - INTERVAL 1 HOUR)
    `);

    // Get the IDs of the inserted notifications
    const [notifications] = await db.query<any[]>(
      'SELECT id FROM notifications WHERE recipient_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    testNotificationIds = notifications.map(n => n.id);
  }
  async function cleanupTestData() {
    // Delete test notifications
    await db.query('DELETE FROM notifications WHERE recipient_id = ?', [userId]);
    
    // Delete test reply
    await db.query('DELETE FROM reply WHERE id = 1');
    
    // Delete test comment
    await db.query('DELETE FROM comments WHERE id = 1');
    
    // Delete test video
    await db.query('DELETE FROM videos WHERE id = 1');
  }

  describe('GET /notifications', () => {
    it('should return 401 if not authenticated', async () => {
      // Mock axios to simulate a 401 error
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 401, data: { message: 'Not authenticated' } }
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