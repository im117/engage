// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './upload.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

function Upload() {

  return (
    <>
      <h1>Upload your video</h1>
      <button>Upload</button>
    </>
  )
}

export default Upload

createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Upload />
    </StrictMode>,
  )
