import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import axios from "axios";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";

// Mock axios
vi.mock("axios");
const mockedAxios = axios as vi.MockedObject<typeof axios>;
