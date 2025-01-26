import './App.scss';
import VideoPlayer from "./components/VideoPlayer.tsx"

import path from 'path-browserify';

import fs from "vite-plugin-fs/browser";

const mediaPath: string = './media';

async function createVideoArray(dirPath: string){
  const files = await fs.readdir(dirPath);
  const vidPaths: Array<string | null> = []; //video paths

  for (const file of files){
    const filePath = path.join(dirPath, file); //specific file path of file
    // const stat = ;
    // const stat = await fs.stat(filePath);
    const ext = path.extname(file).toLowerCase();
      if (ext === '.mp4' || ext === '.mov' || ext === '.avi' || ext === '.mkv' || ext === '.webm') {
        vidPaths.push(filePath);
    }
  }
  return vidPaths;
}

const array: Array<string | null> = await createVideoArray(mediaPath);

function randomizeArray(array: Array<string | null>){
  let index = array.length;

  // While loop to shuffle the array until the index is at zero
  while (index != 0) {
    // Generate a random index with Math.random(), and round it to the lowest int.
    const randomIndex = Math.floor(Math.random() * index);
    
    // Shuffle the positions
    [array[index], array[randomIndex]] = [
      array[randomIndex], array[index]];

    // Bring the index down by 1
    index--;
  }
}

randomizeArray(array);



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
        <button className="upload-button" onClick={() => window.location.href = '/upload.html'}>UPLOAD</button>
      </div>
    </div>
  );
}

export default App;
