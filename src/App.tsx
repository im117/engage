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
import axios from "axios";
import Terms from "./terms.tsx";

// Dynamically import all video files from the media folder
const videos = import.meta.glob("../media/*trans.mp4");

let uploadServer = "http://localhost:3001";
if (import.meta.env.VITE_UPLOAD_SERVER !== undefined) {
  uploadServer = import.meta.env.VITE_UPLOAD_SERVER;
}
let loginServer = "http://localhost:8081";
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
  const [comment, setComment] = useState("");

  // Comment type now includes an id, username, comment text, created_at, and optional replies.
  interface CommentType {
    id: number;
    username: string;
    comment: string;
    created_at: string;
    replies?: ReplyType[];
  }
  interface ReplyType {
    id: number;
    username: string;
    reply: string;
    created_at: string;
  }
  const [comments, setComments] = useState<CommentType[]>([]);

  // For reply functionality:
  // - replyInputs holds reply text per comment.
  // - replyVisible toggles showing the reply input field.
  // - repliesVisible toggles showing/hiding the entire replies list.
  const [replyInputs, setReplyInputs] = useState<{ [key: number]: string }>({});
  const [replyVisible, setReplyVisible] = useState<{ [key: number]: boolean }>({});
  const [repliesVisible, setRepliesVisible] = useState<{ [key: number]: boolean }>({});

  // The comment section is toggled by the COMMENT button.
  const [showComments, setShowComments] = useState(false);

  
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userID, setUserID] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [viewRecorded, setViewRecorded] = useState(false);

  const [replyLikeCount, setReplyLikeCount] = useState<{ [key: number]: number }>({}); // Like counts are stored with replyId as keys
  const [replyLiked, setReplyLiked] = useState<{ [key: number]: boolean }>({});
  
  // const getReplyLikeCount = async (replyId: number): Promise<number | string> => {
  //   try {
  //     const response = await axios.get(
  //       `${loginServer}/reply-like-count/${replyId}`
  //     );
      
  //     // Update the state with the fetched like count
  //     setReplyLikeCount(prev => ({
  //       ...prev,
  //       [replyId]: response.data.likeCount
  //     }));
  
  //     // Return the like count immediately
  //     return response.data.likeCount;
  //   } catch (error) {
  //     console.error("Error fetching like count:", error);
      
  //     // Return a fallback value in case of error
  //     return "Error";
  //   }
  // };

  // // Function to toggle the like status for a specific reply
  // const handleReplyLikeToggle = (replyId: number) => {
  //   setReplyLiked((prev) => ({
  //     ...prev,
  //     [replyId]: !prev[replyId], // Toggle the like status for the reply
  //   }));
  // };

  // Function to set the reply liked status to true
const likeReply = (replyId: number) => {
  setReplyLiked((prev) => ({
    ...prev,
    [replyId]: true, // Set the liked status to true
  }));
};

// Function to set the reply liked status to false
const unlikeReply = (replyId: number) => {
  setReplyLiked((prev) => ({
    ...prev,
    [replyId]: false, // Set the liked status to false
  }));
};

// Function to decrement the like count for a specific reply
const decrementLikeCount = (replyId: number) => {
  setReplyLikeCount((prev) => {
    const currentLikeCount = prev[replyId] || 0; // Get the current like count for the replyId, default to 0
    return {
      ...prev, // Spread the previous state
      [replyId]: Math.max(0, currentLikeCount - 1), // Update the like count for this specific replyId, ensuring it doesn't go below 0
    };
  });
};


// Function to increment the like count for a specific reply
const incrementLikeCount = (replyId: number) => {
  setReplyLikeCount((prev) => {
    const currentLikeCount = prev[replyId] || 0; // Get the current like count for the replyId, default to 0
    return {
      ...prev, // Spread the previous state
      [replyId]: currentLikeCount + 1, // Increment the like count for this specific replyId
    };
  });
};


  const navigate = useNavigate();

  useEffect(() => {
    setLiked(false);
    setViewRecorded(false);
    setCurrentVideo(filteredArray[videoIndex] || "");
  }, [videoIndex]);

  useEffect(() => {
    if (currentVideo) {
      console.log("Video changed to:", currentVideo.split("/").pop());
      getLikeCount();
      getViewCount();
      if (loggedIn && userID) {
        checkIfLiked();
      }
      // Fetch comments for current video.
      displayComments();
    }
  }, [currentVideo, loggedIn, userID]);

  useEffect(() => {
    const fetchReplyLikes = async () => {
      const initialLikedState: { [key: number]: boolean } = {};
      const token = localStorage.getItem("authToken"); 
  
      if (!token) {
        console.error("Authorization token is missing!");
        return;
      }
  
      for (const comment of comments) {
        if (Array.isArray(comment.replies)) {
          for (const reply of comment.replies) {
            try {
              console.log(`Fetching like status for reply_id: ${reply.id}`);
              console.log("Sending token:", token);
              const response = await axios.get(`${loginServer}/fetch-reply-liked`, {
                params: { auth: token, reply_id: reply.id },
              });

  
              initialLikedState[reply.id] = response.data.liked || false;
            } catch (err) {
              console.error("Error fetching reply like status:", err);
              initialLikedState[reply.id] = false;
            }
          }
        }
      }
      setReplyLiked(initialLikedState);
    };
  
    // Run only if the token exists
  if (localStorage.getItem("authToken")) {
    fetchReplyLikes();
  }
  }, [comments]);
  
  

  const handleNext = () => {
    setVideoIndex((prevIndex) => (prevIndex + initState) % filteredArray.length);
  };

  const handleBackToLogin = () => {
    navigate("/login");
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

  async function getVideoInfo() {
    let title = "";
    let desc = "";
    let userid = 0;
    let creatorName = "";
    await axios
      .get(`${uploadServer}/video`, {
        params: {
          fileName: currentVideo.substring(currentVideo.lastIndexOf("/") + 1),
        },
      })
      .then((response) => {
        title = response.data.title;
        desc = response.data.description;
        userid = response.data.creator_id;
      })
      .catch((error) => {
        alert(`There was an error fetching the video info!\n\n${error}`);
      });
    creatorName = await getUsername(userid);
    if (!desc) {
      desc = "No description provided";
    }
    alert(
      `Title: ${title}\n--------------------------\nDescription: ${desc}\n--------------------------\nCreator: ${creatorName}\n--------------------------\nViews: ${viewCount}`
    );
  }

  async function getLoggedInUserId() {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const response = await axios.get(`${loginServer}/current-user-id`, {
          params: { auth: token },
        });
        setUserID(response.data.userId);
        setLoggedIn(true);
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

  async function assignUsername() {
    if (loggedIn) {
      const name = await getUsername(userID);
      setUsername(name);
    }
  }
  assignUsername();

  async function getLikeCount() {
    try {
      const fileName = currentVideo.split("/").pop();
      if (!fileName) {
        console.error("Error: fileName is missing.");
        return;
      }
      const response = await axios.get(
        `${loginServer}/video-likes-by-filename/${fileName}`
      );
      setLikeCount(response.data.likeCount);
    } catch (error) {
      console.error("Error fetching like count:", error);
      setLikeCount(0);
    }
  }

  async function checkIfLiked() {
    if (!loggedIn) {
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
      console.log("Making API request to check like status for:", fileName);
      const response = await axios.get(`${loginServer}/check-like-status`, {
        params: { auth: token, fileName: fileName },
      });
      console.log("Like status response:", response.data);
      setLiked(response.data.liked);
    } catch (error) {
      console.error("Error checking like status:", error);
      setLiked(false);
    }
  }

  async function handleLike() {
    if (!userID || !loggedIn) {
      alert("You must be logged in to like videos.");
      return;
    }
    const fileName = currentVideo.split("/").pop();
    if (!fileName) {
      console.error("Error: fileName is missing.");
      return;
    }
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Authentication error. Please log in again.");
      setLoggedIn(false);
      return;
    }
    try {
      const response = await axios.post(
        `${loginServer}/like-video`,
        { fileName: fileName },
        { params: { auth: token } }
      );
      if (response.data.message.includes("unliked")) {
        setLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error liking/unliking video:", error);
      alert("Failed to process like. Please try again.");
    }
  }

  async function getViewCount() {
    try {
      const fileName = currentVideo.split("/").pop();
      if (!fileName) {
        console.error("Error: fileName is missing.");
        return;
      }
      const response = await axios.get(`${loginServer}/video-views/${fileName}`);
      setViewCount(response.data.viewCount);
    } catch (error) {
      console.error("Error fetching view count:", error);
      setViewCount(0);
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
      if (loggedIn) {
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

  async function handleReplyLike(reply_id: number) {
    if (!userID || !loggedIn) {
      alert("You must be logged in to like replies.");
      return;
    }
    const fileName = currentVideo.split("/").pop();
    if (!fileName) {
      console.error("Error: fileName is missing.");
      return;
    }
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Authentication error. Please log in again.");
      setLoggedIn(false);
      return;
    }
    try {
      const response = await axios.post(
        `${loginServer}/like-reply`,
        { fileName: fileName, reply_id },
        { params: { auth: token } }
      );
      if (response.data.message.includes("unliked")) {
        unlikeReply(reply_id);
        decrementLikeCount(reply_id);
      } else {
        likeReply(reply_id);
        incrementLikeCount(reply_id);
      }
    } catch (error) {
      console.error("Error liking/unliking video:", error);
      alert("Failed to process like. Please try again.");
    }
  }



  // Toggle the comment section using the COMMENT button.
  const toggleComments = () => {
    setShowComments((prev) => !prev);
    if (!showComments) displayComments();
  };

  // Post a comment and refresh the comments list.
  const postComment = async () => {
    if (comment.trim() === "") return;
    try {
      const token = localStorage.getItem("authToken");
      const fileName = currentVideo.split("/").pop();
      const videoRes = await axios.get(`${uploadServer}/video`, {
        params: { fileName },
      });
      if (!videoRes.data || !videoRes.data.id) {
        setNotification("⚠️ Video not found.");
        setTimeout(() => setNotification(""), 3000);
        return;
      }
      const videoId = videoRes.data.id;
      await axios.post(
        `${uploadServer}/post-comment`,
        { video_id: videoId, comment },
        { headers: { Authorization: token } }
      );
      setComment("");
      setNotification("✅ Successfully commented!");
      setTimeout(() => setNotification(""), 3000);
    } catch (error) {
      console.error("Error posting comment:", error);
      setNotification("⚠️ Failed to post comment.");
      setTimeout(() => setNotification(""), 3000);
    }
    displayComments();
  };

  const handleVideoStart = () => {
    recordView();
  };

  // Fetch comments along with their replies.
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
            const repliesResponse = await axios.get(`${uploadServer}/get-replies`, {
              params: { comment_id: comment.id },
            });
            replies = await Promise.all(
              repliesResponse.data.map(async (reply: any) => {
                const replyUserResponse = await axios.get(`${uploadServer}/user`, {
                  params: { userID: reply.creator_id },
                });
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
      setComments(commentsWithUsernames);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }

  // Post a reply to a specific comment.
  async function postReply(commentId: number) {
    const replyText = replyInputs[commentId];
    if (!replyText || replyText.trim() === "") return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `${uploadServer}/post-reply`,
        { comment_id: commentId, reply: replyText },
        { headers: { Authorization: token } }
      );
      setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
      displayComments();
    } catch (error) {
      console.error("Error posting reply:", error);
    }
    toggleReplyInput(commentId);
  }

  // Toggle visibility of replies for a specific comment.
  const toggleRepliesVisible = (commentId: number) => {
    setRepliesVisible((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Toggle the reply input for a specific comment.
  const toggleReplyInput = (commentId: number) => {
    setReplyVisible((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  console.log("Reply Liked State Before Rendering:", replyLiked);

  return (
    <div className="app-container">
      <h1>Engage</h1>
      <div className="video-player">
        <ReactPlayer
          id="video"
          url={currentVideo || ""}
          playing={true}
          muted={true}
          controls={true}
          loop={true}
          playsinline={true}
          width="80vw"
          height="60vh"
          onStart={handleVideoStart}
        />
      </div>
      <div className="video-stats">
        <button onClick={handleLike} style={{ color: liked ? "red" : "black" }}>
          <i className="fa-solid fa-heart"></i> {likeCount} Likes
        </button>
        <span className="view-count">
          <i className="fa-solid fa-eye"></i> {viewCount} Views
        </span>
      </div>
      <div className="controls">
        <a className="control-button" href={currentVideo} download>
          <i className="fa-solid fa-download"></i> DOWNLOAD
        </a>
        <div className="control-button" onClick={getVideoInfo}>
          <i className="fas fa-info-circle"></i> VIDEO INFO
        </div>
        {/* The COMMENT button toggles the entire comment section */}
        <button className="control-button" onClick={toggleComments}>
          COMMENT <i className="fa-solid fa-comment"></i>
        </button>
        <button className="control-button" onClick={handleNext}>
          NEXT <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
      <div className="upload-section">
        <button className="upload-button" onClick={() => navigate("/upload")}>
          ENGAGE <i className="fa-solid fa-upload"></i>
        </button>
      </div>
      <div className="back-button-section">{/* Removed VIDEO INFO button */}</div>
      <div className="login-button-section">
        <button
          className="control-button"
          onClick={loggedIn ? () => navigate("/user") : handleBackToLogin}
        >
          {loggedIn ? (
            <>
              <i className="fa-solid fa-user"></i> {username}
            </>
          ) : (
            <>
              <i className="fa-solid fa-right-to-bracket"></i> Log In
            </>
          )}
        </button>
        {/* Comment Section toggled by the COMMENT button */}
        {showComments && (
          <div
            className="comment-section"
            style={{
              position: "fixed",
              bottom: "13%",
              right: "28%",
              background: "white",
              padding: "10px",
              borderRadius: "5px",
              maxHeight: "40vh",
              overflowY: "auto",
            }}
          > 
            <div className="comments-list">
              {comments.map((c) => (
                <div key={c.id} className="comment-box">
                  <p>
                    <strong>{c.username}</strong> ({c.created_at}): {c.comment}
                  </p>

                  <div style={{display:"flex", gap:"5x"}}>

                  {/* Toggle button for showing/hiding replies using icons */}
                  {c.replies && c.replies.length > 0 && (
                    <div style={{ width: "24px", textAlign: "center" }}>
                    <button
                      onClick={() => toggleRepliesVisible(c.id)}
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                      }}
                    >
                      {repliesVisible[c.id] ? (
                        <i
                          className="fa-solid fa-chevron-up"
                          style={{ fontSize: "1.2em", color: "#333" }}
                        ></i>
                      ) : (
                        <i
                          className="fa-solid fa-chevron-down"
                          style={{ fontSize: "1.2em", color: "#333" }}
                        ></i>
                      )}
                    </button>
                    </div>
                  )}

                  { loggedIn && (
                    <div >
                    <button onClick={() => toggleReplyInput(c.id)}><i className="fa-regular fa-comments"></i></button>
                    {replyVisible[c.id] && (
                      <div style={{ marginTop: "5px", display: "flex", alignItems: "center", gap: "8px", minHeight: "40px" }}>
                        <input
                          type="text"
                          value={replyInputs[c.id] || ""}
                          onChange={(e) =>
                            setReplyInputs((prev) => ({
                              ...prev,
                              [c.id]: e.target.value,
                            }))
                          }
                          placeholder="Write a reply..."
                        />
                        <button onClick={() => postReply(c.id)}><i className="fa-regular fa-paper-plane"></i></button>
                      </div>
                    )}
                    </div>
                  )}

                  </div>

                  {repliesVisible[c.id] && c.replies && c.replies.length > 0 && (
                    <div style={{ marginLeft: "20px" }}>

                        {c.replies.map((r) => (
                          <div>
                            <div>
                            <p key={r.id}>
                              <strong>{r.username}</strong> ({r.created_at}): {r.reply}
                            </p>
                            </div>
                            <div style={{display:"flex", gap:"3px", position:"relative", top:"-10px", marginBottom:"-10px"}}>
                              <button onClick={() => handleReplyLike(r.id)} style={{ color: replyLiked[r.id] ? "red" : "black" }}>
                                <i className="fa-regular fa-thumbs-up"></i>
                              </button>
                              <div id={`like-count-${r.id}`}>{replyLikeCount[r.id] !== undefined ? replyLikeCount[r.id] : ""}</div> {/* Unique ID for like count */}
                            </div>
                          </div>
                        ))}                      
                    </div>
                  )}
                </div>
              ))}
            </div>
            {loggedIn && (
            <div className="comment-input-div">
              <textarea
                id="comment-input"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
              ></textarea>
              <button onClick={postComment}>
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          )}
          </div>
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
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<App />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/user" element={<User />} />
          <Route path="/upload" element={<Upload />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;