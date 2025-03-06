import { useState, useEffect } from "react";

interface LikeButtonProps {
  videoId: number;
  userToken: string;
}
const LikeButton: React.FC<LikeButtonProps> = ({ videoId, userToken }) => {
  const [likes, setLikes] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);

  // Fetch like count when component mounts
  useEffect(() => {
    fetchLikes();
  }, []);

  const fetchLikes = async () => {
    try {
      const response = await fetch(
        `http://localhost:8081/video-likes/${videoId}`
      );
      const data = await response.json();
      setLikes(data.likeCount);
    } catch (error) {
      console.error("Error fetching like count:", error);
    }
  };
  const handleLikeToggle = async () => {
    try {
      const response = await fetch("http://localhost:8081/like-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ videoId }),
      });

      if (response.ok) {
        setLiked(!liked);
        setLikes((prev) => (liked ? prev - 1 : prev + 1)); // Update like count UI
      } else {
        console.error("Error liking/unliking video");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <button
      onClick={handleLikeToggle}
      className={`px-4 py-2 rounded ${liked ? "bg-red-500" : "bg-gray-300"}`}
    >
      {liked ? "Unlike" : "Like"} ({likes})
    </button>
  );
};

export default LikeButton;
