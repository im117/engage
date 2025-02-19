import './styles/App.scss'; // Import global and App-specific styles

import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
// React Router for navigation between different pages (Home and User page)

import { useState, useEffect } from 'react';
// React hooks: useState (state), useEffect (side effects), useRef (persistent value)
import Login from "./login.tsx";
import Signup from "./signup.tsx";
// import Dashboard from "./Dashboard";
import PrivateRoute from "./PrivateRoute"; //
import ResetPassword from "./resetPassword.tsx";
import ReactPlayer from 'react-player'; // Library for embedding and playing videos
import User from './User'; 
import path from 'path-browserify'; // Path library to work with file paths in the browser
import Upload from "./upload.tsx";
import axios from "axios";
// import { createContext, useContext } from 'react';
// import VideoPlayer from './components/VideoPlayerUser.tsx';

// Dynamically import all video files from the media folder
const videos = import.meta.glob('../media/*.mp4');

let uploadServer = "http://localhost:3001";
if (import.meta.env.VITE_UPLOAD_SERVER !== undefined) {
  // console.log(import.meta.env.VITE_UPLOAD_SERVER);
  uploadServer = import.meta.env.VITE_UPLOAD_SERVER;
}
let loginServer = "http://localhost:8081"

if (import.meta.env.VITE_LOGIN_SERVER !== undefined) {
  // console.log(import.meta.env.VITE_UPLOAD_SERVER);
  loginServer = import.meta.env.VITE_LOGIN_SERVER;
}


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

    // Shuffle the positions
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];

    // Bring the index down by 1
    index--;
  }
}

// Create a randomized array of video paths
const array: Array<string | null> = await createVideoArray();
randomizeArray(array);

// Remove any undefined items (extra safety)
const filteredArray = array.filter((item) => item !== undefined);


// let userChanged:boolean = false;


function Home(){
// Home Page Component - Displays random videos, "Next", "Engager", and "Download" buttons

  const initState = filteredArray.length < 2 ? 0 : 1; // Set initial video 

  const [videoIndex, setVideoIndex] = useState(initState); // State for current video index
  const [currentVideo, setCurrentVideo] = useState("");
  // const currentVideoRef = useRef(filteredArray[0] || ''); // Reference to the current video path

  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userID, setUserID] = useState(0);

  // Update current video path when videoIndex changes
  useEffect(() => {
    setCurrentVideo(filteredArray[videoIndex] || "");
    console.log(currentVideo)
  }, [videoIndex]);

  // Switch to the next video in the array
  const handleNext = () => {
    setVideoIndex((prevIndex) => (prevIndex + initState) % filteredArray.length);
    console.log(videoIndex);
  };

  const navigate = useNavigate(); // Hook to navigate to other pages
  // const handleBackToDashboard = () => {
  //   navigate("/dashboard");
  // };
  const handleBackToLogin = () => {
    navigate("/login");
  };

// Function to get user info from API
async function getUsername(userid: number){
  let creatorName = "";
  await axios.get(`${uploadServer}/user`, {
    params:{
      userID: userid
    }
  })
  .then(response => {
    creatorName = response.data.username;
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
  // const previousIndex = (videoIndex - 1 + filteredArray.length) % filteredArray.length;
  // const previousVideo = filteredArray[previousIndex] || "";

  // Get video info
  await axios.get(`${uploadServer}/video`, {
    params: {
    fileName: currentVideo.substring(currentVideo.lastIndexOf('/') + 1)
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

  creatorName = await getUsername(userid);
  if(desc == "" || desc == undefined){
    desc = "No description provided";
  }
  alert(`Title: ${title}\n--------------------------\nDescription: ${desc}\n--------------------------\nCreator: ${creatorName}`);
}

// const token = localStorage.getItem("authToken");
// useEffect(() => {
//   setLoggedIn(!!token);
// }, []);


async function getLoggedInUserId(){
  const token = localStorage.getItem("authToken");
  if (token) {
    try {
      const response = await axios.get(`${loginServer}/current-user-id`, {
        params: {
          auth: token ? token : "",
        }
      });
      setUserID(response.data.userId);
      setLoggedIn(true);
      // userChanged = true;
      return response.data.userId;
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }
  } else {
    return null;
  }
}


// const authButtons = async ()=>{
//   let button = "";
//   const userId = await getLoggedInUserId()
  
//    if (userId !== null) {

//     const username = await getUsername(userId);
//     button = "<button className='control-button' onClick={() => navigate('/user')}" + username + " <i className='fa-solid fa-user'></i> </button>"

//   } else {
//     button = "<button className='control-button' onClick={handleBackToLogin}>Log In <i className='fa solid fa-right-to-bracket'></i></button>"
//   }
//   const sanitizedHTML = DOMPurify.sanitize(button);
//   return (
//     <div className="login-button-section" dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
//   ) 
    
// }

getLoggedInUserId()

async function assignUsername() {
  if(loggedIn){
    const username = await getUsername(userID);
    setUsername(username);
    // console.log(username);
  }
}
assignUsername();




  return (
    <div className="app-container">
      <h1>Engage</h1>
      <div className="video-player">
        <ReactPlayer
          id="video"
          url={currentVideo || ''}
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
        <a className="control-button" href={currentVideo} download>
          <i className="fa-solid fa-download"></i> DOWNLOAD
        </a>

        {/* 2. Navigate to User page */}
        {/* <button className="control-button user-button" onClick={() => navigate('/user')}>
          ENGAGER <i className="fa-solid fa-user"></i>
        </button> */}

        {/*3. Next video button */}
        <button className="control-button" onClick={handleNext}>
          NEXT <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      {/*4. Upload button */}
      <div className="upload-section">
        <button className="upload-button" onClick={() => navigate("/upload")}>
          ENGAGE <i className="fa-solid fa-upload"></i>
        </button>
      </div>
      <div className="back-button-section">
        {/* <button className="control-button" onClick={handleBackToDashboard}>
          Back to Dashboard <i className="fa-solid fa-arrow-left"></i>
        </button> */}
        <div className="control-button" onClick={getVideoInfo}>
        <i className="fas fa-info-circle"></i> VIDEO INFO
        </div>
      </div>
      <div className="login-button-section">
      <button className="control-button" onClick={loggedIn ? () => navigate('/user') : handleBackToLogin}>


        {loggedIn ? (
          <>
            <i className="fa-solid fa-user"></i> {username} 
          </>
        ) : (
          <>
            <i className="fa solid fa-right-to-bracket"></i> Log In
          </>
        )}
          
        </button>
        {/* <button className="control-button" onClick={async () => {
          const userId = await getLoggedInUserId();
          if (userId !== null) {
            const username = await getUsername(userId);
            alert(username);
          } else {
            alert("User is not logged in.");
          }
        }}>
          Engager <i className="fa-solid fa-user"></i>
        </button>  */}
        {
          
        }
        {/* <button className="control-button" onClick={handleBackToLogin}>
          
          Log In <i className="fa solid fa-right-to-bracket"></i>
        </button>
        <button className="control-button" onClick={async () => {
          const userId = await getLoggedInUserId();
          if (userId !== null) {
            const username = await getUsername(userId);
            alert(username);
          } else {
            alert("User is not logged in.");
          }
        }}>
          Engager <i className="fa-solid fa-user"></i>
        </button>  */}
      </div>
    </div>
  );
}




// Main App Component - Sets up routing between Home and User page

function App() {
  
  // const [userVideos, setUserVideos] = useState<string[]>([]);
  
  // useEffect(() => {
    
  // }, []);
  

  
//   return (
//     <Router>
//       <Routes>
//         {/* Home Page Route */}
//         <Route path="/" element={<Home />} />
//         {/* User Page Route */}
//         <Route path="/user" element={<User userVideos={userVideos} />} />
//       </Routes>
//     </Router>
//   );
// }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<App />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* User Page Route */}
        
        {/* Protected Route for Dashboard and Video Player */}
        <Route element={<PrivateRoute />}>
        <Route path="/user" element={<User />} />
          <Route path="/upload" element={<Upload />} />
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
