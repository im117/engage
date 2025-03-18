import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bcrypt from "bcryptjs"; // For hashing passwords
import jwt from "jsonwebtoken"; // For generating tokens
import nodemailer from "nodemailer";

const app = express();
const port = 8081;

let dbHost = "localhost";
if (process.env.DATABASE_HOST) {
  dbHost = process.env.DATABASE_HOST;
}

let frontendUrl = "http://localhost:3000"; // Default for development
if (process.env.FRONTEND_URL) {
  frontendUrl = process.env.FRONTEND_URL; // Use environment variable in production
}

// Middleware to parse incoming JSON requests
app.use(express.json());

// Enable CORS
app.use(cors());

// MySQL connection
const db = mysql.createConnection({
  host: dbHost,
  user: "engageuser",
  password: "engagepassword",
  database: "engage",
  port: 3306,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed: ", err);
    return;
  }
  console.log("Login Server Connected to MySQL database");
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ngagellc@gmail.com", // Replace with your email
    pass: "tqas lqmp flxb dqin", // Replace with your app password( watch the video to know how to get app password)
  },
});

// Signup Route
export const signup = async (req, res) => {
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
      db.query(checkUsernameQuery, [username], (err, results) => {
        // Checks for unique username
        if (err) return reject(err);
        if (results.length > 0) {
          return reject({ status: 409, message: "Username already exists" });
        }
        resolve(); // Continue to the next step if username is unique
      });
    }),
    new Promise((resolve, reject) => {
      db.query(checkEmailQuery, [email], (err, results) => {
        // Checks for unique email
        if (err) return reject(err);
        if (results.length > 0) {
          return reject({ status: 409, message: "Email already exists" });
        }
        resolve(); // Continue to the next step if email is unique
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

        // Generate a verification token
        const verificationToken = jwt.sign({ email }, "secretkey", {
          expiresIn: "1d",
        });

        // Insert new user into the database
        const query =
          "INSERT INTO users (username, email, password, role, isVerified, verificationToken) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [
          username,
          email,
          hashedPassword,
          "user",
          false,
          verificationToken,
        ];

        db.query(query, values, (err, result) => {
          if (err) {
            console.error("Error inserting data: ", err);
            return res
              .status(500)
              .json({ message: "Database error", error: err });
          }
          // Send verification email
          const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`; // Change to your frontend URL when deploying
          const mailOptions = {
            from: "ngagellc@gmail.com", // your email
            to: email,
            subject: "Verify Your Email",
            text: `Click this link to verify your email: ${verificationLink}`,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error sending email: ", error);
              return res.status(500).json({ message: "Error sending email" });
            }
            return res.status(201).json({
              message:
                "User signed up successfully. Please check your email to verify your account.",
            });
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
};
// Email Verification Route
app.get("/verify-email", (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Missing token" });
  }

  jwt.verify(token, "secretkey", (err, decoded) => {
    if (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const email = decoded.email;
    const updateQuery =
      "UPDATE users SET isVerified = true, verificationToken = NULL WHERE email = ?";

    db.query(updateQuery, [email], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      return res
        .status(200)
        .json({ message: "Email verified successfully! You can now log in." });
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
  const { usernameOrEmail, password } = req.body;

  // Basic input validation
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Find user by username or email
  const query = "SELECT * FROM users WHERE username = ? OR email = ? ";
  // UsernameOrEmail fills in for both ?
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

    // Check if user is verified
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });
    }

    // Compare passwords
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords: ", err);
        return res.status(500).json({ message: "Server error" });
      }
      // Passwords don't match
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

app.get("/current-user-id", authenticateTokenGet, (req, res) => {
  // req user for requests
  return res.status(200).json({ userId: req.user.userId });
});

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

app.post("/verifyToken", (req, res) => {
  const { token } = req.body;
  if (!token) return res.json({ valid: false });

  jwt.verify(token, "secretkey", (err, decoded) => {
    if (err) return res.json({ valid: false });
    res.json({ valid: true });
  });
});

// Register routes
app.post("/signup", signup);
// app.post("/login", login);

// Start the Server
app.listen(port, () => {
  console.log(`Login Server is running at http://localhost:${port}`);
});
