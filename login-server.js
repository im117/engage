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
  user: "root",
  password: "pass123",
  database: "engage",
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed: ", err);
    return;
  }
  console.log("Login Server Connected to MySQL database");
});

// Signup Route
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  // Basic input validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if the email already exists
  const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      console.error("Error checking email existence: ", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // If email is unique, hash the password before storing
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password: ", err);
        return res.status(500).json({ message: "Server error" });
      }

      // Insert new user into the database
      const insertQuery =
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
      const values = [name, email, hashedPassword];

      db.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error("Error inserting data: ", err);
          return res
            .status(500)
            .json({ message: "Database error", error: err });
        }
        return res.status(201).json({
          message: "User signed up successfully",
          userId: result.insertId,
        });
      });
    });
  });
});


const authenticateTokenGet = (req, res, next) => {
  const { auth: token } = req.query;
  console.log("Token received:", token);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  jwt.verify(token, "secretkey", (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = decoded; // Attach decoded user info to request
    next();
  });
};

// Login Route (Unchanged)
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Basic input validation
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Find user by email
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Error querying database: ", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      // Email not found - return 404
      return res.status(404).json({ message: "Email does not exist!" });
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
        { userId: user.id, email: user.email },
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

app.get("/current-user", authenticateTokenGet, (req, res) => {
  // req user for requests
  return res.status(200).json({ userId: req.user.userId });
})

app.get("/get-user-videos", authenticateTokenGet, (req, res) => {
  const userid = req.user.userId;
  const getVideosQuery = "SELECT * FROM videos WHERE creator_id = ?";
  db.query(getVideosQuery, [userid], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json({ videos: results });
  });
})

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

app.post("/verifyToken", (req, res) => {
  const { token } = req.body;
  if (!token) return res.json({ valid: false });

  jwt.verify(token, "secretkey", (err, decoded) => {
    if (err) return res.json({ valid: false });
    res.json({ valid: true });
  });
});

// Start the Server
app.listen(port, () => {
  console.log(`Login Server is running at http://localhost:${port}`);
});
