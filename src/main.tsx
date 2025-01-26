import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import VideoPlayer from "./components/VideoPlayer.tsx"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VideoPlayer />
    
  </StrictMode>

  
)

