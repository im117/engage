import './App.scss';

function App() {
  return (
    <div className="app-container">
      <div className="video-player">
        <h2>Video Player</h2>
      </div>
      <div className="controls">
        <button className="control-button">Previous Video</button>
        <button className="control-button">Next Video</button>
      </div>
      <div className="upload-section">
        <button className="upload-button">Upload Video</button>
      </div>
    </div>
  );
}

export default App;
