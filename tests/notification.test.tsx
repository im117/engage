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
