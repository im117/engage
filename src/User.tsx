import "./styles/User.scss";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import axios from "axios";
import { join } from "path";

const VIDEOS_PER_PAGE = 6;

let uploadServer = "http://localhost:3001";
if (import.meta.env.VITE_UPLOAD_SERVER !== undefined) {
  uploadServer = import.meta.env.VITE_UPLOAD_SERVER;
}
let loginServer = "http://localhost:8081";
if (import.meta.env.VITE_LOGIN_SERVER !== undefined) {
  loginServer = import.meta.env.VITE_LOGIN_SERVER;
}

function User() {
  const [userVideos, setUserVideos] = useState<string[]>([]);
  const [username, setUsername] = useState("");
  const [userID, setUserID] = useState(0);
  const [dateJoined, setDateJoined] = useState("");
  const [role, setRole] = useState("User");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>(
    "https://via.placeholder.com/100"
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isJittering, setIsJittering] = useState(false);
  const [direction, setDirection] = useState(0);
  const [selectedTab, setSelectedTab] = useState<"videos" | "likes">("videos");

  const totalPages = Math.ceil(userVideos.length / VIDEOS_PER_PAGE);
  const startIndex = currentPage * VIDEOS_PER_PAGE;
  const currentVideos = userVideos.slice(
    startIndex,
    startIndex + VIDEOS_PER_PAGE
  );

  const navigate = useNavigate();

  async function loadUserVideos() {
    const token = localStorage.getItem("authToken");
    if (token) {
      const userVideoArray: string[] = [];
      try {
        const response = await axios.get(`${loginServer}/get-user-videos`, {
          params: { auth: token },
        });
        response.data.videos.forEach((element: { fileName: string }) => {
          userVideoArray.push("./media/" + element.fileName);
        });
        setUserVideos(userVideoArray);
      } catch (error) {
        console.error("Error fetching user videos:", error);
      }
    }
  }

  useEffect(() => {
    loadUserVideos();
  }, []);

  async function getLoggedInUserId() {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const response = await axios.get(`${loginServer}/current-user-id`, {
          params: { auth: token },
        });
        setUserID(response.data.userId);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    }
  }

  const formatDate = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  async function getUsername(userid: number) {
    let username = "";
    const response = await axios.get(`${uploadServer}/user`, {
      params: { userID: userid },
    });
    username = response.data.username;
    if (response.data.profilePictureUrl) {
      setProfilePictureUrl(response.data.profilePictureUrl);
    }
    if (response.data.dateCreated) {
      const joinDate = new Date(response.data.dateCreated);
      setDateJoined(formatDate(joinDate));
    }
    setUsername(username);
    setRole("User");
  }

  useEffect(() => {
    getLoggedInUserId();
    getUsername(userID);
  });

  const handleOpenVideo = (videoSrc: string) => setSelectedVideo(videoSrc);
  const handleCloseVideo = () => setSelectedVideo(null);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setDirection(1);
      setCurrentPage((prevPage) => prevPage + 1);
    } else {
      triggerJitter();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage((prevPage) => prevPage - 1);
    } else {
      triggerJitter();
    }
  };

  const triggerJitter = () => {
    setIsJittering(true);
    setTimeout(() => setIsJittering(false), 500);
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleNextPage,
    onSwipedRight: handlePrevPage,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append("profilePicture", file);
      formData.append("userId", userID.toString());
      try {
        const response = await axios.post(
          `${uploadServer}/upload-profile-picture`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setProfilePictureUrl(response.data.profilePictureUrl);
      } catch (error) {
        console.error("Error uploading profile picture:", error);
      }
    }
  };

  return (
    <div className="user-page-wrapper">
      <div
        className={`user-container ${selectedVideo ? "blur" : ""} ${
          isJittering ? "jitter" : ""
        }`}
        {...handlers}
      >
        <div className="logout__section">
          <a className="button warning" onClick={handleLogout}>
            <i className="fas fa-door-open"></i>
            <span className="desktop__text"> Logout</span>
          </a>
        </div>

        <div className="content-container">
          <div className="profile-picture-wrapper">
            <img
              src={profilePictureUrl}
              alt="Profile"
              className="profile-picture"
              onClick={handleProfilePictureClick}
            />
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleProfilePictureChange}
            />
            <div className="user-info">
              <div className="username-display">{username}</div>
              <div className="user-role">Role: {role}</div>
              <div className="date-joined">Joined: {dateJoined}</div>
            </div>
          </div>

          {/* Tab Navigation Section */}
          <div className="my-videos-container tab-toggle">
            <div
              className={`tab-item ${selectedTab === "videos" ? "active" : ""}`}
              onClick={() => setSelectedTab("videos")}
            >
              My Videos
            </div>
            <div
              className={`tab-item ${selectedTab === "likes" ? "active" : ""}`}
              onClick={() => setSelectedTab("likes")}
            >
              My Likes
            </div>
          </div>

          {selectedTab === "videos" && (
            <AnimatePresence mode="popLayout">
              <motion.div
                key={currentPage}
                className="video-grid"
                initial={{ x: direction * 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction * 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              >
                {currentVideos.length > 0 ? (
                  currentVideos.map((video, index) => (
                    <div
                      key={index}
                      className="video-thumbnail"
                      onClick={() => handleOpenVideo(video)}
                    >
                      <motion.video
                        src={video}
                        className="thumbnail-video"
                        autoPlay
                        muted
                        loop
                        playsInline
                        whileHover={{ scale: 1.05 }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="no-videos-text">No Videos Added</div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {selectedTab === "likes" && (
            <div className="likes-placeholder">
              <p>No liked videos yet.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            className="fullscreen-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseVideo}
          >
            <motion.video
              src={selectedVideo}
              className="fullscreen-video"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              autoPlay
              playsInline
              controls
              loop
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default User;
