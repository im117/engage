import './styles/User.scss'; // Import the User page specific styles
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Hook to navigate between routes
import { motion, AnimatePresence } from 'framer-motion'; // Animation library for smooth transitions

// Props interface to accept an array of video URLs as a prop
interface UserProps {
  userVideos: string[];
}

function User({ userVideos }: UserProps) {
  const navigate = useNavigate();

  // State to track which video is currently selected for full-screen view
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Opens the fullscreen video overlay with the selected video
  const handleOpenVideo = (videoSrc: string) => {
    setSelectedVideo(videoSrc);
  };

  // Closes the fullscreen video overlay
  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="user-page-wrapper">
      {/* Page Content (Video Grid + Home Button) - This part will get blurred when fullscreen video is open */}
      <div className={`user-container ${selectedVideo ? 'blur' : ''}`}>
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

        {/* Button to navigate back to the Home page */}
        <button className="home-button" onClick={() => navigate('/')}>
          Home
        </button>
      </div>

      {/* Enlarged Video Overlay - Fullscreen video display with backdrop */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            className="fullscreen-overlay"
            initial={{ opacity: 0 }} // Animation starts with opacity 0 (hidden)
            animate={{ opacity: 1 }} // Animate to fully visible
            exit={{ opacity: 0 }} // Animate to hidden on exit
            onClick={handleCloseVideo} // Close fullscreen if overlay is clicked
          >
            <motion.video
              src={selectedVideo}
              className="fullscreen-video"
              initial={{ scale: 0.8 }} // Scale up from 0.8x size
              animate={{ scale: 1 }} // Animate to normal size
              exit={{ scale: 0.8 }} // Scale down on exit
              autoPlay
              controls
              loop
              onClick={(e) => e.stopPropagation()} // Prevent closing overlay when clicking the video itself
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default User;
