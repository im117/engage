import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter
import Login from "./login.tsx";

describe("Login Component", () => {
  it("should display validation errors for empty email and password", () => {
    // Step 1: Render the component wrapped in BrowserRouter
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Step 2: Simulate form submission without filling in the fields
    const loginButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(loginButton);

    // Step 3: Check for email validation error
    const emailError = screen.getByText(/email is required/i);
    expect(emailError).toBeInTheDocument();

    // Step 4: Check for password validation error
    const passwordError = screen.getByText(/password is required/i);
    expect(passwordError).toBeInTheDocument();
  });
});
