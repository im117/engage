import { useState } from "react";
import { motion } from "framer-motion";

export default function VideoPlayer() {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleVideoClick = (
    event: React.MouseEvent<HTMLVideoElement, MouseEvent>
  ) => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      event.currentTarget.play(); // Play video when enlarged
    } else {
      event.currentTarget.pause(); // Pause when shrunk
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <motion.video
        src="your-video.mp4"
        className={`cursor-pointer transition-all duration-300 ${
          isExpanded ? "w-[600px] h-[400px] rounded-[50%]" : "w-[300px] h-[200px] rounded-lg"
        }`}
        onClick={handleVideoClick}
        initial={{ width: 300, height: 200, borderRadius: "10px" }}
        animate={{
          width: isExpanded ? 600 : 300,
          height: isExpanded ? 400 : 200,
          borderRadius: isExpanded ? "50%" : "10px",
        }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}
