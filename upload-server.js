import express from 'express';
import mysql from "mysql2";
import multer from 'multer';
import path from 'path';
import cors from 'cors';

const app = express();
const port = 3000;

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
app.use(cors({
  origin: '*',  // This is the origin of your React app 
  // ! ORIGIN IS WILDCARD FOR DEV ONLY
  methods: ['GET', 'POST'],  // Allow only GET and POST methods (you can customize this)
  allowedHeaders: ['Content-Type', 'Authorization']  // Allow necessary headers
}));

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './media'); // Set the folder where the files will be uploaded
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Name the file with a timestamp
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  res.status(200).send({ message: 'File uploaded successfully!' });
});

app.post("/record", (req, res) => {
  // console.log(req.body);
  const { title, desc, fileName } = req.body;

  const insertQuery =
  "INSERT INTO videos (title, description, fileName) VALUES (?, ?, ?)"
  const values = [title, desc, fileName]
  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error("Error inserting data: ", err);
      return res
        .status(500)
        .json({ message: "Database error", error: err });
    }
    return res.status(201).json({
      message: "Video stored successfully",
      videoId: result.insertId,
    });
  })
})

app.listen(port, () => {
  console.log(`Upload Server is running at http://localhost:${port}`);
});
