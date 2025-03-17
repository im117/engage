import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import App from "../src/App";

// Mock the React Router hooks
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock axios
vi.mock("axios");

// Mock ReactPlayer
vi.mock("react-player", () => ({
  default: vi.fn(({ onStart }) => {
    // Call onStart to simulate video starting
    setTimeout(() => onStart && onStart(), 0);
    return <div data-testid="react-player" />;
  }),
}));
