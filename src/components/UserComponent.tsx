import { useState } from "react"; // Import useState hook for managing component state
import { motion } from "framer-motion"; // Import motion from Framer Motion for animation support

// Functional component VideoPlayer - Displays a video that expands/shrinks on click
export default function VideoPlayer() {
  // State to track whether the video is expanded (enlarged) or not
  const [isExpanded, setIsExpanded] = useState(false);

  // Handles click event on the video to toggle between expanded and collapsed states
  const handleVideoClick = (
    event: React.MouseEvent<HTMLVideoElement, MouseEvent>
  ) => {
    setIsExpanded(!isExpanded); // Toggle the expanded state

    // Play video if expanding, pause if collapsing
    if (!isExpanded) {
      event.currentTarget.play(); // Start playing the video
    } else {
      event.currentTarget.pause(); // Pause the video
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      {/* Animated video using Framer Motion */}
      <motion.video
        src="your-video.mp4" // Video source path (replace with your actual video file)
        className={`cursor-pointer transition-all duration-300 ${
          isExpanded
            ? "w-[600px] h-[400px] rounded-[50%]" // Expanded: Larger oval shape (600x400)
            : "w-[300px] h-[200px] rounded-lg" // Collapsed: Smaller rectangle (300x200)
        }`}
        onClick={handleVideoClick} // Click event handler for toggling expansion
        initial={{ width: 300, height: 200, borderRadius: "10px" }} // Initial size and shape when component is mounted
        animate={{
          width: isExpanded ? 600 : 300, // Animate width depending on expanded state
          height: isExpanded ? 400 : 200, // Animate height depending on expanded state
          borderRadius: isExpanded ? "50%" : "10px", // Animate shape (oval or rectangle)
        }}
        transition={{ duration: 0.3 }} // Smooth transition duration of 0.3s
      />
    </div>
  );
}
