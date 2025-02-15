import './styles/User.scss';
import ReactPlayer from 'react-player';
import { useNavigate } from 'react-router-dom';

interface UserProps {
  userVideos: string[];
}

function User({ userVideos }: UserProps) {
  const navigate = useNavigate();

  return (
    <div className="user-container">
      <div className="video-grid">
        {userVideos.map((video, index) => (
          <div key={index} className="video-thumbnail">
            <ReactPlayer
              url={video}
              width="100%"
              height="100%"
              playing={true}
              muted={true}
              loop={true}
              controls={false}
            />
          </div>
        ))}
      </div>

      <button className="home-button" onClick={() => navigate('/')}>
        Home
      </button>
    </div>
  );
}

export default User;
