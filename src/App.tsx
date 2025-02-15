import './styles/App.scss'; // Import global and App-specific styles

import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
// React Router for navigation between different pages (Home and User page)

import { useState, useEffect, useRef } from 'react';
// React hooks: useState (state), useEffect (side effects), useRef (persistent value)

import ReactPlayer from 'react-player'; // Library for embedding and playing videos
import User from './User'; 
import path from 'path-browserify'; // Path library to work with file paths in the browser

// Dynamically import all video files from the media folder
const videos = import.meta.glob('../media/*.mp4');

// Asynchronously create an array of video paths from imported media folder
async function createVideoArray() {
  const vidPaths: Array<string | null> = []; // Array to hold video paths

  // Loop through all imported videos
  for (const videoKey of Object.keys(videos)) {
    const ext = path.extname(videoKey).toLowerCase(); // Get the extension (e.g., .mp4)
    if (ext === '.mp4') vidPaths.push(videoKey); // Push video to array if it’s .mp4
  }
  return vidPaths;
}

//randomize the elements of an array
function randomizeArray(array: Array<string | null>) {
  let index = array.length;

  // While elements remain to shuffle
  while (index !== 0) {
    const randomIndex = Math.floor(Math.random() * index);
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
    index--;
  }
}

// Create a randomized array of video paths
const array: Array<string | null> = await createVideoArray();
randomizeArray(array);

// Remove any undefined items (extra safety)
const filteredArray = array.filter((item) => item !== undefined);

// Home Page Component - Displays random videos, "Next", "Engager", and "Download" buttons
function Home() {
  let initState = filteredArray.length < 2 ? 0 : 1; // Set initial video index depending on available videos

  const [videoIndex, setVideoIndex] = useState(initState); // State for current video index
  const currentVideoRef = useRef(filteredArray[0] || ''); // Reference to the current video path

  // Update current video path when videoIndex changes
  useEffect(() => {
    currentVideoRef.current = filteredArray[videoIndex] || '';
  }, [videoIndex]);

  // Switch to the next video in the array
  const handleNext = () => {
    setVideoIndex((prevIndex) => (prevIndex + initState) % filteredArray.length);
  };

  const navigate = useNavigate(); // Hook to navigate to other pages

  return (
    <div className="app-container">
      <h1>Engage</h1>
      <div className="video-player">
        <ReactPlayer
          id="video"
          url={currentVideoRef.current || ''}
          playing={true}
          muted={true}
          controls={true}
          loop={true}
          width="80vw"
          height="60vh"
        />
      </div>

      {/* 1. Video control buttons */}
      <div className="controls">
        {/* Download button */}
        <a className="control-button" href={currentVideoRef.current} download>
          <i className="fa-solid fa-download"></i> DOWNLOAD
        </a>

        {/* 2. Navigate to User page */}
        <button className="control-button user-button" onClick={() => navigate('/user')}>
          ENGAGER <i className="fa-solid fa-user"></i>
        </button>

        {/*3. Next video button */}
        <button className="control-button" onClick={handleNext}>
          NEXT <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      {/*4. Upload button */}
      <div className="upload-section">
        <button className="upload-button" onClick={() => (window.location.href = '/upload.html')}>
          ENGAGE <i className="fa-solid fa-upload"></i>
        </button>
      </div>
    </div>
  );
}

// Main App Component - Sets up routing between Home and User page
function App() {
  // Hardcoded paths to user videos (replace later with dynamic paths if needed)
  const userVideos = [
    '/media/video1.mp4',
    '/media/video2.mp4',
    '/media/video3.mp4',
    '/media/video4.mp4',
    '/media/video5.mp4',
    '/media/video6.mp4',
    '/media/video7.mp4',
    '/media/video8.mp4',
    '/media/video9.mp4',
  ];

  return (
    <Router>
      <Routes>
        {/* Home Page Route */}
        <Route path="/" element={<Home />} />
        {/* User Page Route */}
        <Route path="/user" element={<User userVideos={userVideos} />} />
      </Routes>
    </Router>
  );
}

export default App;
