import React from "react";
import { render, screen } from "@testing-library/react";
import Login from "./login";

describe("Login Page", () => {
  test("renders Login heading", () => {
    render(<Login />);
    const headingElement = screen.getByText(/Login/i);
    expect(headingElement).toBeInTheDocument();
  });

  test("renders email and password input fields", () => {
    render(<Login />);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  test("renders Login button", () => {
    render(<Login />);
    const loginButton = screen.getByRole("button", { name: /login/i });
    expect(loginButton).toBeInTheDocument();
  });
});
