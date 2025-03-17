import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import LikeButton from "../src/likeButton";

// Mock axios
vi.mock("axios");

describe("Like Functionality", () => {
  const originalEnv = process.env;
  const mockLoginServer = "http://test-login-server";

  beforeEach(() => {
    // Mock environment variables
    vi.stubEnv("VITE_UPLOAD_SERVER", "http://test-upload-server");
    vi.stubEnv("VITE_LOGIN_SERVER", mockLoginServer);

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });