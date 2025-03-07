import express from "express";

import cors from "cors";
import bcrypt from "bcryptjs"; // For hashing passwords
import jwt from "jsonwebtoken"; // For generating tokens

const app = express();
const port = 8081;

let dbHost = "localhost";
if (process.env.DATABASE_HOST) {
  dbHost = process.env.DATABASE_HOST;
}

// Middleware to parse incoming JSON requests
app.use(express.json());

// Enable CORS
app.use(cors());

import dbRequest from "./db.js";

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

  const db = dbRequest(dbHost);
  // Promise allows multiple checks in succession before an action
  Promise.all([
    new Promise((resolve, reject) => {
      db.query(checkUsernameQuery, [username], (err, results) => {
        // Checks for unique username
        if (err) return reject(err);
        if (results.length > 0) {
          return reject({ status: 409, message: "Username already exists" });
        }
        db.destroy();
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
        db.destroy();
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

        // Insert new user into the database
        const query =
          "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)";
        const values = [username, email, hashedPassword, "user"];

        db.query(query, values, (err, result) => {
          if (err) {
            console.error("Error inserting data: ", err);
            db.destroy();
            return res
              .status(500)
              .json({ message: "Database error", error: err });
          }
          db.destroy();
          return res.status(201).json({
            message: "User signed up successfully",
          });
        });
      });
    })
    .catch((error) => {
      // Handle errors from either username or email check
      if (error.status) {
        db.destroy();
        return res.status(error.status).json({ message: error.message });
      }
      // For any other errors (e.g., database error)
      console.error("Error: ", error);
      db.destroy();
      return res.status(500).json({ message: "Database error", error });
    });
};

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
  const db = dbRequest(dbHost);
  const { usernameOrEmail, password } = req.body;

  // Basic input validation
  if (!usernameOrEmail || !password) {
    db.destroy();
    return res.status(400).json({ message: "All fields are required" });
  }

  // Find user by username or email
  const query = "SELECT * FROM users WHERE username = ? OR email = ? ";
  // UsernameOrEmail fills in for both ?
  db.query(query, [usernameOrEmail, usernameOrEmail], (err, results) => {
    if (err) {
      console.error("Error querying database: ", err);
      db.destroy();
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      // User not found - return 404
      db.destroy();
      return res.status(404).json({ message: "User does not exist!" });
    }

    const user = results[0];

    // Compare passwords
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords: ", err);
        db.destroy();
        return res.status(500).json({ message: "Server error" });
      }
      // Passwords don't match
      if (!isMatch) {
        db.destroy();
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
  const db = dbRequest(dbHost);
  const userid = req.user.userId;
  const getVideosQuery = "SELECT * FROM videos WHERE creator_id = ?";
  db.query(getVideosQuery, [userid], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      db.destroy();
      return res.status(500).json({ message: "Database error" });
    }
    db.destroy();
    return res.status(200).json({ videos: results });
  });
});

app.post("/reset-password", (req, res) => {
  const db = dbRequest(dbHost);
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    db.destroy();
    return res
      .status(400)
      .json({ message: "Email and new password are required" });
  }

  const findUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(findUserQuery, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      db.destroy();
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      db.destroy();
      return res.status(404).json({ message: "Email does not exist" });
    }

    // Hash the new password
    bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error("Error hashing password:", hashErr);
        db.destroy();
        return res.status(500).json({ message: "Server error" });
      }

      // Update the password in the database
      const updateQuery = "UPDATE users SET password = ? WHERE email = ?";
      db.query(updateQuery, [hashedPassword, email], (updateErr) => {
        if (updateErr) {
          console.error("Error updating password:", updateErr);
          db.destroy();
          return res.status(500).json({ message: "Database error" });
        }
        db.destroy();
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

// Like or Unlike a Video
app.post("/like-video", authenticateTokenGet, (req, res) => {
  const { videoId } = req.body; // This is now the file name, not the numeric ID
  const userId = req.user.userId;

  // Add this line to create the database connection
  const db = dbRequest(dbHost);

  console.log("User ID:", userId);
  console.log("Video ID (fileName):", videoId);

  if (!videoId) {
    db.destroy();
    return res.status(400).json({ message: "Video file name is required" });
  }

  // Query to get the numeric video_id based on the video file name
  const getVideoIdQuery = "SELECT id FROM videos WHERE fileName = ?";
  db.query(getVideoIdQuery, [videoId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Video not found" });
    }

    const videoIdFromDb = results[0].id; // Get the numeric video_id from the query result
    console.log("Found videoId:", videoIdFromDb);

    // Check if user already liked the video
    const checkLikeQuery =
      "SELECT * FROM likes WHERE user_id = ? AND video_id = ?";
    db.query(checkLikeQuery, [userId, videoIdFromDb], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length > 0) {
        // User already liked the video -> Unlike it
        const unlikeQuery =
          "DELETE FROM likes WHERE user_id = ? AND video_id = ?";
        db.query(unlikeQuery, [userId, videoIdFromDb], (err) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
          }
          return res
            .status(200)
            .json({ message: "Video unliked successfully" });
        });
      } else {
        // User hasn't liked the video -> Like it
        const likeQuery = "INSERT INTO likes (user_id, video_id) VALUES (?, ?)";
        db.query(likeQuery, [userId, videoIdFromDb], (err) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
          }
          return res.status(200).json({ message: "Video liked successfully" });
        });
      }
    });
  });
});

// Get Like Count for a Video
app.get("/video-likes/:videoId", (req, res) => {
  const { videoId } = req.params;

  const db = dbRequest(dbHost);

  const likeCountQuery =
    "SELECT COUNT(*) AS likeCount FROM likes WHERE video_id = ?";
  db.query(likeCountQuery, [videoId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json({ likeCount: results[0].likeCount });
  });
});

// Register routes
app.post("/signup", signup);
// app.post("/login", login);

// Start the Server
app.listen(port, () => {
  console.log(`Login Server is running at http://localhost:${port}`);
});
