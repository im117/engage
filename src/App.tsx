import './styles/App.scss';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import User from './User';

import path from 'path-browserify';

const videos = import.meta.glob('../media/*.mp4');

async function createVideoArray() {
  const vidPaths: Array<string | null> = [];
  for (const videoKey of Object.keys(videos)) {
    const ext = path.extname(videoKey).toLowerCase();
    if (ext === '.mp4') vidPaths.push(videoKey);
  }
  return vidPaths;
}

function randomizeArray(array: Array<string | null>) {
  let index = array.length;
  while (index != 0) {
    const randomIndex = Math.floor(Math.random() * index);
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
    index--;
  }
}

const array: Array<string | null> = await createVideoArray();
randomizeArray(array);

const filteredArray = array.filter((item) => item !== undefined);

function Home() {
  let initState = filteredArray.length < 2 ? 0 : 1;
  const [videoIndex, setVideoIndex] = useState(initState);
  const currentVideoRef = useRef(filteredArray[0] || '');

  useEffect(() => {
    currentVideoRef.current = filteredArray[videoIndex] || '';
  }, [videoIndex]);

  const handleNext = () => {
    setVideoIndex((prevIndex) => (prevIndex + initState) % filteredArray.length);
  };

  const navigate = useNavigate(); // React Router hook

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

      <div className="controls">
        <a className="control-button" href={currentVideoRef.current} download>
          <i className="fa-solid fa-download"></i> DOWNLOAD
        </a>

        {/* Navigate to User Page */}
        <button className="control-button user-button" onClick={() => navigate('/user')}>
          ENGAGER <i className="fa-solid fa-user"></i>
        </button>

        <button className="control-button" onClick={handleNext}>
          NEXT <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      <div className="upload-section">
        <button className="upload-button" onClick={() => window.location.href = '/upload.html'}>
          ENGAGE <i className="fa-solid fa-upload"></i>
        </button>
      </div>
    </div>
  );
}

function App() {
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
        <Route path="/" element={<Home />} />
        <Route path="/user" element={<User userVideos={userVideos} />} />
      </Routes>
    </Router>
  );
}

export default App;
