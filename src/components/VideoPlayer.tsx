import ReactPlayer from "react-player";


const directory = "../../media/"





export default function VideoPlayer() {

    return (
        <div>
            <ReactPlayer 
                id = "video"
                url={directory + "video.mp4"} 
                playing={true} 
                muted={true}
                controls={true}
            />
        </div>
    );
  }



