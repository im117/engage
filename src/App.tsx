import "./styles/App.scss"; // Import global and App-specific styles
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./login.tsx";
import Signup from "./signup.tsx";
import PrivateRoute from "./PrivateRoute";
import ResetPassword from "./resetPassword.tsx";
import ReactPlayer from "react-player";
import User from "./User";
import path from "path-browserify";
import Upload from "./upload.tsx";
import VerifyEmail from "./VerifyEmail.tsx";
import axios from "axios";
import Terms from "./terms.tsx";
import LikeButton from "./components/likeButton.tsx";
import TopBar from "./components/TopBar.tsx";
import RecoverAccount from "./recoverAccount.tsx";
import UserProfile from "./userProfile.tsx";
import CombinedSearch from "./combinedSearch.tsx";
import About from "./About.tsx";
import Follow from "./components/follow.tsx"; // Import the Follow component
import CommentSection, { CommentType } from "./components/CommentSection.tsx";



// Dynamically import all video files from the media folder
const videos = import.meta.glob("../media/*trans.mp4");

export let uploadServer = "http://localhost:3001";
if (import.meta.env.VITE_UPLOAD_SERVER !== undefined) {
  uploadServer = import.meta.env.VITE_UPLOAD_SERVER;
}
export let loginServer = "http://localhost:8081";
if (import.meta.env.VITE_LOGIN_SERVER !== undefined) {
  loginServer = import.meta.env.VITE_LOGIN_SERVER;
}

// Asynchronously create an array of video paths from imported media folder
async function createVideoArray() {
  const vidPaths: Array<string | null> = [];
  const dbPaths: Array<string> = [];
  try {
    const response = await axios.get(`${uploadServer}/video-list`);
    response.data.forEach((video: { fileName: string }) => {
      dbPaths.push(video.fileName);
    });
  } catch (error) {
    console.error(`Error fetching video info:`, error);
    return [];
  }
  for (const videoKey of Object.keys(videos)) {
    const ext = path.extname(videoKey).toLowerCase();
    if (ext === ".mp4") {
      const videoFileName: string = path.posix.basename(videoKey);
      if (dbPaths.includes(videoFileName)) {
        vidPaths.push(videoKey);
      }
    }
  }
  return vidPaths;
}

function randomizeArray(array: Array<string | null>) {
  let index = array.length;
  while (index !== 0) {
    const randomIndex = Math.floor(Math.random() * index);
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
    index--;
  }
}

const array: Array<string | null> = await createVideoArray();
randomizeArray(array);
const filteredArray = array.filter((item) => item !== undefined);

// Function to check if the auth token is expired
function isTokenExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiry = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    return now >= expiry;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
}

// Remove authToken if it's expired
const token = localStorage.getItem("authToken");
if (token && isTokenExpired(token)) {
  localStorage.removeItem("authToken");
}

function Home() {
  const initState = filteredArray.length < 2 ? 0 : 1;
  const [videoIndex, setVideoIndex] = useState(initState);
  const [currentVideo, setCurrentVideo] = useState("");
  const [notification, setNotification] = useState("");
  // Add a new state for showing/hiding comments
  const [showComments, setShowComments] = useState(false);

  
  // Comment type now includes an id, username, comment text, created_at, and optional replies.
  
  const [comments, setComments] = useState<CommentType[]>([]);
  

  const [userID, setUserID] = useState<number>(0);
  const [role, setRole] = useState("user")
  const [liked, setLiked] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [viewRecorded, setViewRecorded] = useState(false);

  
  const [replyLiked, setReplyLiked] = useState<{ [key: number]: boolean }>({});

  const [commentCount, setCommentCount] = useState(0);

  const navigate = useNavigate();

  // current video use states
  const [currentVideoTitle, setCurrentVideoTitle] = useState("");
  const [currentVideoDesc, setCurrentVideoDesc] = useState("");
  const [currentVideoDate, setCurrentVideoDate] = useState("");
  const [currentVideoCreatorName, setCurrentVideoCreatorName] = useState("");

  // Extract fileName from currentVideo
  const fileName = currentVideo.split("/").pop() || "";

  function DeleteVideo() {
    async function handleDelete() {
      if (!userID) {
        alert("You must be logged in to delete videos.");
        return;
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Authentication error. Please log in again.");
        setUserID(0);
        return;
      }

      const fileName = currentVideo.split("/").pop();
      if (!fileName) {
        alert("Error: No video selected for deletion.");
        return;
      }

      const confirmDelete = window.confirm(
        "Are you sure you want to delete this video? This action cannot be undone."
      );
      if (!confirmDelete) return;

      // const fileNameWithoutExtension = fileName.split(".").slice(0, -1).join(".");
      const videoIdResponse = await axios.get(`${uploadServer}/video-id-from-filename`, {
        params: { fileName: fileName },
      });
      const videoId = videoIdResponse.data.videoId;
      try {
        await axios.delete(`${uploadServer}/delete-video-admin`, {
          headers: { Authorization: token },
          data: { videoId },
        });

        alert("Video deleted successfully.");
        setVideoIndex((prevIndex) => (prevIndex + 1) % filteredArray.length);
      } catch (error) {
        console.error("Error deleting video:", error);
        alert("Failed to delete video. Please try again.");
      }
    }

    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <a
          onClick={handleDelete}
          className="button danger delete-button"
          style={{ maxWidth: "200px" }}
        >
          <i className="fas fa-trash"></i> Delete Video
        </a>
      </div>
    );
  }
  // Function to grab video information from API
  async function setVideoInfo() {
    try {
      const response = await axios.get(`${uploadServer}/video`, {
        params: {
          fileName: fileName, // Use extracted fileName
        },
      });
      setCurrentVideoTitle(response.data.title);
      setCurrentVideoDesc(response.data.description);
      const username = await getUsername(response.data.creator_id);
      setCurrentVideoCreatorName(username);
      const date = new Date(response.data.created_at).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );
      const time = new Date(response.data.created_at).toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
      setCurrentVideoDate(`${date} at ${time}`);
    } catch (error) {
      alert(`There was an error fetching the video info!\n\n${error}`);
    }
  }

  useEffect(() => {
    setLiked(false);
    setViewRecorded(false);
    setCurrentVideo(filteredArray[videoIndex] || "");
  }, [videoIndex]);

  useEffect(() => {
    if (currentVideo) {
      // console.log("Video changed to:", currentVideo.split("/").pop());
      getViewCount();
      getCommentCount();
      if (userID) {
        checkIfLiked();
      }
      displayComments();
    }
  }, [currentVideo]);

  

  

  const handleNext = () => {
    setVideoIndex(
      (prevIndex) => (prevIndex + initState) % filteredArray.length
    );
  };

  async function getUsername(userid: number) {
    let creatorName = "";
    await axios
      .get(`${uploadServer}/user`, {
        params: { userID: userid },
      })
      .then((response) => {
        creatorName = response.data.username;
      });
    return creatorName as string;
  }

  async function getLoggedInUserId() {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const response = await axios.get(`${loginServer}/current-user-id`, {
          params: { auth: token },
        });
        setUserID(response.data.userId);
        return response.data.userId;
      } catch (error) {
        console.error("Error fetching user ID:", error);
        return null;
      }
    } else {
      return null;
    }
  }
  getLoggedInUserId();

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await axios.get(
          `${loginServer}/user-profile/${userID}`
        );
        setRole(response.data.profile.role);
        // console.log(role);
      } catch (err) {
        console.error("Error fetching role:", err);
      }
    };

    if (userID) {
      fetchRole();
    }
  }, [userID]);

  async function checkIfLiked() {
    if (!userID) {
      setLiked(false);
      return;
    }
    const token = localStorage.getItem("authToken");
    if (!token) {
      setLiked(false);
      return;
    }
    const fileName = currentVideo.split("/").pop();
    if (!fileName) {
      setLiked(false);
      return;
    }
    try {
      // console.log("Making API request to check like status for:", fileName);
      const response = await axios.get(`${loginServer}/check-like-status`, {
        params: { auth: token, fileName: fileName },
      });
      // console.log("Like status response:", response.data);
      setLiked(response.data.liked);
    } catch (error) {
      console.error("Error checking like status:", error);
      setLiked(false);
    }
  }

  async function getViewCount() {
    try {
      const fileName = currentVideo.split("/").pop();
      if (!fileName) {
        console.error("Error: fileName is missing.");
        return;
      }
      const response = await axios.get(
        `${loginServer}/video-views/${fileName}`
      );
      setViewCount(response.data.viewCount);
    } catch (error) {
      console.error("Error fetching view count:", error);
      setViewCount(0);
    }
  }

  async function getCommentCount() {
    try {
      const fileName = currentVideo.split("/").pop();
      if (!fileName) {
        console.error("Error: fileName is missing.");
        return;
      }
      const response = await axios.get(
        `${loginServer}/comment-count/${fileName}`
      );
      setCommentCount(response.data.commentCount);
    } catch (error) {
      console.error("Error fetching comment count:", error);
      setCommentCount(0);
    }
  }

  async function recordView() {
    try {
      if (viewRecorded) return;
      const fileName = currentVideo.split("/").pop();
      if (!fileName) {
        console.error("Error: fileName is missing.");
        return;
      }
      if (userID) {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        await axios.post(
          `${loginServer}/record-view`,
          { fileName },
          { params: { auth: token } }
        );
      } else {
        await axios.post(`${loginServer}/record-anonymous-view`, { fileName });
      }
      setViewCount((prev) => prev + 1);
      setViewRecorded(true);
    } catch (error) {
      console.error("Error recording view:", error);
    }
  }

  

  

  const handleVideoStart = () => {
    recordView();
  };

  async function fetchReplyCount(commentId: number) {
    try {
      const response = await axios.get(
        `${loginServer}/reply-count/${commentId}`
      );
      return response.data.replyCount;
    } catch (error) {
      console.error("Error fetching reply count:", error);
      return 0;
    }
  }

  async function displayComments() {
    try {
      const fileName = currentVideo.split("/").pop();
      if (!fileName) return;
      const response = await axios.get(`${uploadServer}/get-comments`, {
        params: { fileName },
      });
      const fetchedComments = response.data;
      const commentsWithUsernames = await Promise.all(
        fetchedComments.map(async (comment: any) => {
          const userResponse = await axios.get(`${uploadServer}/user`, {
            params: { userID: comment.user_id },
          });
          let replies: any[] = [];
          try {
            const repliesResponse = await axios.get(
              `${uploadServer}/get-replies`,
              { params: { comment_id: comment.id } }
            );
            replies = await Promise.all(
              repliesResponse.data.map(async (reply: any) => {
                const replyUserResponse = await axios.get(
                  `${uploadServer}/user`,
                  { params: { userID: reply.creator_id } }
                );
                return {
                  id: reply.id,
                  username: replyUserResponse.data.username,
                  reply: reply.content,
                  created_at: reply.created_at,
                };
              })
            );
          } catch (e) {
            console.error("Error fetching replies for comment", comment.id, e);
          }
          return {
            id: comment.id,
            username: userResponse.data.username,
            comment: comment.content,
            created_at: comment.created_at,
            replies: replies,
          };
        })
      );
      const commentsWithReplyCounts = await Promise.all(
        commentsWithUsernames.map(async (comment) => {
          const replyCount = await fetchReplyCount(comment.id);
          return { ...comment, replyCount: replyCount };
        })
      );
      setComments(commentsWithReplyCounts);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }

  useEffect(() => {
    if (currentVideo) {
      setVideoInfo();
      displayComments();
    }
  }, [currentVideo]);

  const toggleComments = () => {
    setShowComments((prev) => !prev);
  };

  // Function to handle search result selection
  const handleSearchResultSelect = (fileName: string) => {
    // Find the video index in array
    const index = filteredArray.findIndex(
      (path) => path && path.includes(fileName)
    );

    if (index !== -1) {
      setVideoIndex(index);
      // If needed, navigate to home page showing the video
      if (window.location.pathname !== "/") {
        navigate("/");
      }
    }
  };
  

  return (
    <div className="app">
      {/* Search container here */}
      {/* <VideoSearch onResultSelect={handleSearchResultSelect} /> */}
      <CombinedSearch onVideoSelect={handleSearchResultSelect} />
      <div className="app-container">
        <div className="video-player">
          <ReactPlayer
            id="video"
            url={currentVideo || ""}
            playing={true}
            muted={true}
            controls={true}
            loop={true}
            playsinline={true}
            width="90vw"
            height="60vh"
            onStart={handleVideoStart}
          />
          <div className="controls">
            <div className="video-stats">
              <LikeButton
                fileName={
                  currentVideo ? currentVideo.split("/").pop() || "" : ""
                }
                loggedIn={userID != 0}
                userId={userID}
                initialLiked={liked}
                loginServer={loginServer}
              />
              <span className="views">
                <i className="fa-solid fa-eye"></i> {viewCount}
                <span className="desktop__text"> Views</span>
              </span>
              <span
                className={`comment-button ${
                  showComments ? "clicked" : "not-clicked"
                }`}
              >
                <button onClick={toggleComments} className="comment-btn">
                  <i className="fa-solid fa-comment"></i>
                  <span>{commentCount}</span>
                  <span className="comment-text">
                    {commentCount === 1 ? "Comment" : "Comments"}
                  </span>
                </button>
              </span>
            </div>
            <div className="download-next">
              {filteredArray.length > 0 && (
                <a className="button" href={currentVideo} download>
                  <i className="fa-solid fa-download"></i>
                  <span className="desktop__text"> DOWNLOAD</span>
                </a>
              )}
              {filteredArray.length === 0 && (
                <a className="button greyed">
                  <i className="fa-solid fa-download"></i>
                  <span className="desktop__text"> DOWNLOAD</span>
                </a>
              )}
              <a
                className={
                  filteredArray.length < 2 ? "button greyed" : "button"
                }
                onClick={() => {
                  const videoElement = document.getElementById("video");
                  if (videoElement && filteredArray.length >= 2) {
                    videoElement.classList.remove("fade-in");
                    videoElement.classList.add("fade-out");
                    setTimeout(() => {
                      handleNext();
                      videoElement.classList.remove("fade-out");
                      videoElement.classList.add("fade-in");
                    }, 200);
                  }
                }}
              >
                <span className="desktop__text">NEXT </span>
                <i className="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="video-details">
          <div className="details-metadata">
            {filteredArray.length > 0 && (
              <>
              
                <Follow
                  fileName={currentVideo.split("/").pop() || ""}
                  loggedIn={userID !== 0}
                />
                {(userID != 0) && (role != "user") &&(
                <>
                <DeleteVideo />
                </>
              )}
                <h1>{currentVideoTitle}</h1>
                <h2>
                  Engager:{" "}
                  <a
                    onClick={() =>
                      navigate(`/profile/${currentVideoCreatorName}`)
                    }
                    className="engager-link"
                  >
                    {currentVideoCreatorName}
                  </a>
                </h2>
                <h3>Uploaded: {currentVideoDate}</h3>
                <p>
                  {currentVideoDesc !== ""
                    ? currentVideoDesc
                    : "No Description Provided"}
                </p>
              </>
            )}
            {filteredArray.length === 0 && (
              <>
                <h2>There are no videos available</h2>
                <h3>Upload one to kick things off.</h3>
              </>
            )}
            {showComments && (
              <CommentSection
              userID={userID}
              setUserID={setUserID}
              comments={comments}
              handleUsernameClick={(username) => navigate(`/profile/${username}`)}
              displayComments={displayComments}
              currentVideo={currentVideo}
              setNotification={setNotification}
              replyLiked={replyLiked}
              setReplyLiked={setReplyLiked}
              />
            )}
            {notification && (
              <div
                className="notification"
                style={{
                  position: "fixed",
                  bottom: "80px",
                  right: "20px",
                  background: "#28a745",
                  color: "white",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                {notification}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
function App() {
  return (
    <BrowserRouter>
      <TopBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/recover-account/:token" element={<RecoverAccount />} />
        <Route path="/profile/:userName" element={<UserProfile />} />
        <Route path="/about" element={<About />} />
        {/* User Page Route */}

        {/* Protected Route for Dashboard and Video Player */}
        <Route element={<PrivateRoute />}>
          <Route path="/user" element={<User />} />
          <Route path="/upload" element={<Upload />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
