import ReactPlayer from "react-player";


function VideoPlayer(video: string) {
    return (
      <div>
        <ReactPlayer url={"./src/media" + video + ".mp4"} playing={true}/>
      </div>
    );
  }

export default VideoPlayer