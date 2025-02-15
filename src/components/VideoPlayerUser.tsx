import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoPlayerUserProps {
  src: string;
}

export default function VideoPlayerUser({ src }: VideoPlayerUserProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleVideo = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* Small Oval Thumbnail */}
      <motion.div
        className="cursor-pointer w-full h-full rounded-[50px] overflow-hidden"
        whileHover={{ scale: 1.05 }}
        onClick={toggleVideo}
      >
        <motion.video
          src={src}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
        />
      </motion.div>

      {/* Enlarged Video Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-80 backdrop-blur-md flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleVideo} // Clicking outside closes it
          >
            <motion.video
              src={src}
              autoPlay
              controls
              className="w-[60vw] h-[60vh] rounded-[50%] object-cover cursor-pointer"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking video
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
