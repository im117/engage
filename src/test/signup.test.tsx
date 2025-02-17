import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter
import Signup from "../signup"; // Adjust path if necessary

describe("Signup Component", () => {
  it("should display validation error for missing name", () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    // Simulate checking the "I agree to the Terms" checkbox to enable the submit button
    const checkbox = screen.getByLabelText(
      /i agree to the terms and conditions/i
    );
    fireEvent.click(checkbox);

    // Simulate form submission without entering a name
    const submitButton = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(submitButton);

    // Check for name validation error
    const nameError = screen.getByText(/name is required/i);
    expect(nameError).toBeInTheDocument();
  });
  it("should display validation error for password not meeting the requirements", () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    // Simulate checking the checkbox to enable the submit button
    const checkbox = screen.getByLabelText(
      /i agree to the terms and conditions/i
    );
    fireEvent.click(checkbox);

    // Enter a password that doesn't meet the requirements
    const passwordInput = screen.getByPlaceholderText(/enter password/i);
    fireEvent.change(passwordInput, { target: { value: "password" } });

    // Simulate form submission
    const submitButton = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(submitButton);

    // Check for password validation error
    const passwordError = screen.getByText(
      /password must be at least 8 characters long/i
    );
    expect(passwordError).toBeInTheDocument();
  });
});
