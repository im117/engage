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