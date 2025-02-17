import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bcrypt from "bcryptjs"; // For hashing passwords
import jwt from "jsonwebtoken"; // For generating tokens

const app = express();
const port = 8081;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Enable CORS
app.use(cors());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "engageuser",
  password: "engagepassword",
  database: "engage",
  port: 3306
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed: ", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Signup Route
app.post("/signup", (req, res) => {
  const { username, email, password } = req.body;

  // Basic input validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Selects queries to be checked for uniqueness
  const checkUsernameQuery = "SELECT * FROM users WHERE username = ?";
  const checkEmailQuery = "SELECT * FROM users WHERE email = ?";

  // Promise allows multiple checks in succession before an action
  Promise.all([
    new Promise((resolve, reject) => {
      db.query(checkUsernameQuery, [username], (err, results) => {  // Checks for unique username
        if (err) return reject(err);
        if (results.length > 0) {
          return reject({ status: 408, message: "Username already exists" });
        }
        resolve();  // Continue to the next step if username is unique
      });
    }),
    new Promise((resolve, reject) => {
      db.query(checkEmailQuery, [email], (err, results) => {  // Checks for unique email
        if (err) return reject(err);
        if (results.length > 0) {
          return reject({ status: 409, message: "Email already exists" });
        }
        resolve();  // Continue to the next step if email is unique
      });
    }),
  ])
  .then(() => {
    // If username and email are unique, hash the password before storing
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password: ", err);
        return res.status(500).json({ message: "Server error" });
      }

      // Insert new user into the database
      const insertQuery =
        "INSERT INTO users (username, email, password, role, dateCreated) VALUES (?, ?, ?, ?, CURDATE())";
      const values = [username, email, hashedPassword, "user"];

      db.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error("Error inserting data: ", err);
          return res.status(500).json({ message: "Database error", error: err });
        }
        return res.status(201).json({
          message: "User signed up successfully"
        });
      });
    });
  })
  .catch((error) => {
    // Handle errors from either username or email check
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    // For any other errors (e.g., database error)
    console.error("Error: ", error);
    return res.status(500).json({ message: "Database error", error });
  });
});


// Login Route
app.post("/login", (req, res) => {
  const { usernameOrEmail, password } = req.body;

  // Basic input validation
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Find user by username
  const query = "SELECT * FROM users WHERE username = ? OR email = ? ";

  db.query(query, [usernameOrEmail, usernameOrEmail], (err, results) => {
    if (err) {
      console.error("Error querying database: ", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      // User not found - return 404
      return res.status(404).json({ message: "User does not exist!" });
    }

    const user = results[0];

    // Compare passwords
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords: ", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // After successfully login, will generate JWT token for authentication in PrivateRoute
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        "secretkey", // Secret key for JWT
        { expiresIn: "1h" } // Token expiration time
      );

      return res.status(200).json({
        message: "Login successful",
        token: token,
      });
    });

  });
});

app.post("/reset-password", (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email and new password are required" });
  }

  const findUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(findUserQuery, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Email does not exist" });
    }

    // Hash the new password
    bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error("Error hashing password:", hashErr);
        return res.status(500).json({ message: "Server error" });
      }

      // Update the password in the database
      const updateQuery = "UPDATE users SET password = ? WHERE email = ?";
      db.query(updateQuery, [hashedPassword, email], (updateErr) => {
        if (updateErr) {
          console.error("Error updating password:", updateErr);
          return res.status(500).json({ message: "Database error" });
        }

        return res
          .status(200)
          .json({ message: "Password reset successfully! Redirecting..." });
      });
    });
  });
});

// Start the Server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
