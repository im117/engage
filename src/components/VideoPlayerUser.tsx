import { useState } from "react";
import { motion } from "framer-motion";

// VideoPlayer Component - Toggles between a small and expanded video
export default function VideoPlayer() {
  // State to track if the video is expanded or not
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle click on video to expand/shrink and play/pause accordingly
  const handleVideoClick = (
    event: React.MouseEvent<HTMLVideoElement, MouseEvent>
  ) => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      event.currentTarget.play(); // Play video when expanding
    } else {
      event.currentTarget.pause(); // Pause video when shrinking
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <motion.video
        src="your-video.mp4" // Path to the video (replace with actual path)
        className={`cursor-pointer transition-all duration-300 ${
          isExpanded
            ? "w-[600px] h-[400px] rounded-[50%]" // Expanded: Larger, rounded (oval)
            : "w-[300px] h-[200px] rounded-lg" // Collapsed: Smaller, rectangular
        }`}
        onClick={handleVideoClick}
        initial={{ width: 300, height: 200, borderRadius: "10px" }} // Initial size and shape
        animate={{
          width: isExpanded ? 600 : 300,
          height: isExpanded ? 400 : 200,
          borderRadius: isExpanded ? "50%" : "10px", // Switch to oval on expansion
        }}
        transition={{ duration: 0.3 }} // Smooth transition duration
      />
    </div>
  );
}
