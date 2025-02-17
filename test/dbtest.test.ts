import supertest from "supertest";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { signup , login } from "../mysqlserver.js"
import mysql from "mysql2";

// Create a request instance using supertest to test signup
const signupReq = supertest(signup);

// Create a request instance using supertest to test login
const loginReq = supertest(login);


// Mocking mysql2.createConnection
vi.mock("mysql2", () => ({
  createConnection: vi.fn(() => ({
    query: vi.fn(),
    end: vi.fn(),
  })),
}));

beforeEach(() => {
    // Reset mocks before each test
    vi.fn().mockReset();
  });

  describe("Signup function - Existing username", () => {
    it("Should return error if the same username already exists", async () => {
        const req = { body: { username: 'user', email: 'user@email.com', password: 'Pass1234' }};
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn()
    };
    // Mock the query to simulate an existing email
    vi.fn().mockImplementationOnce((query, values, callback) => {
        if (query.includes("SELECT * FROM users WHERE email = ?")) {
          callback(null, [{ id: 1, username: "user", email: "user1@email.com" }]); // Simulate existing user, different email
        } else {
          callback(null, []); // Return empty for other queries
        }
    })
    await signup(req, res);

    // Check that a 408 error is returned with the "Username already exists" message
    expect(res.status).toHaveBeenCalledWith(408);
    expect(res.json).toHaveBeenCalledWith({ message: "Username already exists"});
    });
  });