import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';

const app = express();
const port = 3000;

// Enable CORS for your React app (localhost:5173)
app.use(cors({
  origin: 'http://localhost:5173',  // This is the origin of your React app
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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
