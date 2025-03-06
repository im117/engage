import LikeButton from "./likeButton";

const Video: React.FC<{ videoId: number; userToken: string }> = ({
  videoId,
  userToken,
}) => {
  return (
    <div>
      <h2>Video {videoId}</h2>
      {/* Video player here */}
      <LikeButton videoId={videoId} userToken={userToken} />
    </div>
  );
};

export default Video;
