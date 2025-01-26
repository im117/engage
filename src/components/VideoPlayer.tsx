import ReactPlayer from "react-player";


function VideoPlayer() {
    return (
      <div>
        <ReactPlayer url="../../media/video.mp4" playing={true}/>
      </div>
    );
  }

  export default VideoPlayer
