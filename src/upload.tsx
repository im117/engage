// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './upload.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import FileUploader from './components/FileUploader';

function Upload() {

  return (
    <>
    <div>
      <button onClick={() => window.location.href = '/'}>Home</button>
      <h1>Upload your video</h1>
      <FileUploader />
    </div>
    </>
  )
}

export default Upload

createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Upload />
    </StrictMode>,
  )
