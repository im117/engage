import './App.scss';

function App() {
  return (
    <div className="app-container">
      <div className="video-player">
        <h2>Video Player</h2>
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
