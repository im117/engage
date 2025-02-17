import supertest from "supertest";
import { beforeEach,beforeAll, afterEach, describe, it, expect, vi } from "vitest";
import { signup , login } from "../mysqlserver.js"
import mysql from "mysql2";
import bcrypt from "bcryptjs"; // For hashing passwords

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "engageuser",
  password: "engagepassword",
  database: "engagetest",
  port: 3306
});


const date = new Date();  // Current date and time
// Convert JavaScript Date object to MySQL format (YYYY-MM-DD)
const formattedDate = date.toISOString().split('T')[0]; 

beforeAll(() => {

  // Clear table values
  const query1 =
        "TRUNCATE TABLE users";
  db.query(query1, (err, res) => {
    if (err) {
      console.error('Error clearing user:', err.stack);
    } else {
      console.log('Table cleared successfully');
    }
  });
});

beforeEach(() => {
  // Reset table before each test (deletes all users except the one with id = 1)
  const query = "DELETE FROM users WHERE id != 1";
  db.query(query, (err,res) => {
    if (err) {
      console.error('Error reseting user:', err.stack);
    } else {
      console.log('Table reset successfully');
    }
  });
});

describe("Signup function - Existing username", () => {
  it("Should return error if the same username already exists", async () => {
    // Simulate the request and response objects
    const req = {
      body: {
        username: "user", // The username that already exists
        email: "newuser@email.com",
        password: "Password1",
      }
    };

    const res = {
      status: vi.fn().mockReturnThis(), // Mock status method
      json: vi.fn().mockReturnThis(),   // Mock json method
    };

    // Call the signup function
    await signup(req, res);

    // Assert the error response
    expect(res.status).toHaveBeenCalledWith(409); // Expect 409 for conflict
    expect(res.json).toHaveBeenCalledWith({ message: "Username already exists" });
  });
});
