import "./styles/App.scss";
// import VideoPlayer from "./components/VideoPlayer.tsx"
import ReactPlayer from "react-player";
import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./login.tsx";
import Signup from "./signup.tsx";
import Dashboard from "./Dashboard";
import PrivateRoute from "./PrivateRoute"; //
import ResetPassword from "./resetPassword.tsx";
import { useNavigate } from "react-router-dom";
import path from "path-browserify";
import Upload from "./upload.tsx";
import axios from "axios";


const videos = import.meta.glob("../media/*.mp4");


async function createVideoArray() {

  const vidPaths: Array<string | null> = []; //video paths

  for (const videoKey of Object.keys(videos)) {
    const ext = path.extname(videoKey).toLowerCase();
    if (ext === ".mp4") vidPaths.push(videoKey);
  }
  return vidPaths;
}

function randomizeArray(array: Array<string | null>) {
  let index = array.length;

  // While loop to shuffle the array until the index is at zero
  while (index != 0) {
    // Generate a random index with Math.random(), and round it to the lowest int.
    const randomIndex = Math.floor(Math.random() * index);

    // Shuffle the positions
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];

    // Bring the index down by 1
    index--;
  }
}

const array: Array<string | null> = await createVideoArray();
randomizeArray(array);

const filteredArray = array.filter((item) => item !== undefined);
// console.log(filteredArray);

function VideoPlayer() {
  let initState = 1;
  if (filteredArray.length < 2) {
    initState = 0;
  }

  const [videoIndex, setVideoIndex] = useState(initState);
  const currentVideoRef = useRef(filteredArray[0] || "");
  useEffect(() => {
    currentVideoRef.current = filteredArray[videoIndex] || "";
  }, [videoIndex]);

  // function initializeVideoRef(){
  //   setVideoIndex(() => (0));
  // }
  const handleNext = () => {
    setVideoIndex(
      (prevIndex) => (prevIndex + initState) % filteredArray.length
    );
    console.log(videoIndex);
  };

  // Handle Back to Dashboard button
  const navigate = useNavigate();
  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  // const handlePrevious = () => {
  //   setVideoIndex((prevIndex) => (prevIndex - 1 + filteredArray.length) % filteredArray.length);
  //   console.log(videoIndex)
  // };
  // function initVideoIndex(){
  //   setVideoIndex((prevIndex) => (prevIndex + 1));
  //   console.log(videoIndex);
  // };
  // setVideoIndex(0);
  // initializeVideoRef();
// Function to get user info from API
  async function getUserInfo(userid: number){
    let creatorName = "";
    await axios.get("http://localhost:3001/user", {
      params:{
        userID: userid
      }
    })
    .then(response => {
      creatorName = response.data.name;
    })
    return creatorName as string;
  }
  // Function to grab video information from API
  async function getVideoInfo(){
    let title = "";
    let desc = "";
    let userid = 0;
    let creatorName = "";
    // Get the previousIndex and previousVideo, since index seeks ahead at the moment
    const previousIndex = (videoIndex - 1 + filteredArray.length) % filteredArray.length;
    const previousVideo = filteredArray[previousIndex] || "";

    // Get video info
    await axios.get("http://localhost:3001/video", {
      params: {
      fileName: previousVideo.substring(previousVideo.lastIndexOf('/') + 1)
      }
    })
    .then(response => {
      
      // get user info
      title = response.data.title;
      desc = response.data.description;
      userid = response.data.creator_id;
      
    })
    .catch(error => {
      alert(`There was an error fetching the video info!\n\n${error}`);
    });

    creatorName = await getUserInfo(userid);
    if(desc == "" || desc == undefined){
      desc = "No description provided";
    }
    alert(`Title: ${title}\n--------------------------\nDescription: ${desc}\n--------------------------\nCreator: ${creatorName}`);
  }

  

  return (
    <div className="app-container">
      <h1>Engage</h1>
      <div className="video-player">
        <h2>
          <div>
            <ReactPlayer
              id="video"
              url={currentVideoRef.current || ""}
              playing={true}
              muted={true}
              controls={true}
              loop={true}
              width="80vw"
              height="60vh"
            />
          </div>
        </h2>
      </div>
      <div className="controls">
        <a className="control-button" href={currentVideoRef.current} download>
          <i className="fa-solid fa-download"></i> DOWNLOAD
        </a>
        <button className="control-button" onClick={handleNext}>
          NEXT <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
      <div className="upload-section">
        <button className="upload-button" onClick={() => navigate("/upload")}>
          ENGAGE <i className="fa-solid fa-upload"></i>
        </button>
      </div>
      <div className="back-button-section">
        <button className="control-button" onClick={handleBackToDashboard}>
          Back to Dashboard <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div className="control-button" onClick={getVideoInfo}>
          INFO
        </div>
      </div>
    </div>
  );
}
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Protected Route for Dashboard and Video Player */}
        <Route element={<PrivateRoute />}>
          <Route path="/upload" element={<Upload />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/videoplayer" element={<VideoPlayer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
