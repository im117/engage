import './App.scss';
import VideoPlayer from "./components/VideoPlayer.tsx"

function App() {
  return (
    <div className="app-container">
      <div className="video-player">
        <h2><VideoPlayer /></h2>
      </div>
      <div className="controls">
        <button className="control-button">PREVIOUS</button>
        <button className="control-button">NEXT</button>
      </div>
      <div className="upload-section">
        <button className="upload-button">UPLOAD</button>
      </div>
    </div>
  );
}

export default App;
