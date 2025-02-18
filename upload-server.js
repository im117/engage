import express from "express";
import mysql from "mysql2";
import multer from "multer";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
const port = 3001;

app.use(express.json()); // Add this line to parse JSON bodies

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
  console.log("Upload Server Connected to MySQL database");
});

// Enable CORS for your React app (localhost:5173)
app.use(
  cors({
    origin: "*", // This is the origin of your React app
    // ! ORIGIN IS WILDCARD FOR DEV ONLY
    methods: ["GET", "POST"], // Allow only GET and POST methods (you can customize this)
    allowedHeaders: ["Content-Type", "Authorization"], // Allow necessary headers
  })
);

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./media"); // Set the folder where the files will be uploaded
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Name the file with a timestamp
  },
});

const upload = multer({ storage: storage });

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
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

// Upload video with authentication
app.post("/upload", authenticateToken, upload.single("file"), (req, res) => {
  console.log("File data:", req.file);
  console.log("Request body:", req.body);
  console.log("Decoded JWT:", req.user);

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { title, description } = req.body;
  const creatorId = req.user.userId; // Extract user ID from JWT
  if (!creatorId) {
    return res.status(400).json({ message: "Invalid creator ID" });
  }

  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Title and description are required" });
  }

  const insertQuery =
    "INSERT INTO videos (creator_id, title, description, fileName) VALUES (?, ?, ?, ?)";
  db.query(
    insertQuery,
    [creatorId, title, description, req.file.filename],
    (err, result) => {
      if (err) {
        console.error("Error inserting video into database: ", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      console.log("Insert result:", result);
      return res.status(200).json({ message: "File uploaded successfully!" });
    }
  );
});

app.listen(port, () => {
  console.log(`Upload Server is running at http://localhost:${port}`);
});
