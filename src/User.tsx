import './styles/User.scss';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Props interface to accept an array of video URLs as a prop
interface UserProps {
  userVideos: string[];
}

function User({ userVideos }: UserProps) {
  const navigate = useNavigate();

  // Example username (replace later when you have database integration)
  const username = 'EngageUser123';

  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Opens fullscreen video overlay with the selected video
  const handleOpenVideo = (videoSrc: string) => {
    setSelectedVideo(videoSrc);
  };

  // Closes fullscreen video overlay
  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="user-page-wrapper">
      {/* Page Content (Video Grid + Username + Home Button) - This part will get blurred */}
      <div className={`user-container ${selectedVideo ? 'blur' : ''}`}>
        {/* Video Thumbnails */}
        <div className="video-grid">
          {userVideos.map((video, index) => (
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
              />
            </div>
          ))}
        </div>

        {/* Username Display */}
        <div className="username-display">
          Logged in as: <span className="username">{username}</span>
        </div>

        {/* Home Button */}
        <button className="home-button" onClick={() => navigate('/')}>
          Home
        </button>
      </div>

      {/* Enlarged Video Overlay - Fullscreen video display with backdrop */}
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
