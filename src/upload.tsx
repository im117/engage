// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
import "./styles/upload.scss"; // Import the updated styles
import FileUploader from "./components/FileUploader";
import { useState, useEffect } from 'react'; // React hook for managing state
import axios from "axios";
import App from "./App";
import { getLoggedInUserId, getUserInfo } from "./userUtils";


let uploadServer = "http://localhost:3001";
if (import.meta.env.VITE_UPLOAD_SERVER !== undefined) {
  // console.log(import.meta.env.VITE_UPLOAD_SERVER);
  uploadServer = import.meta.env.VITE_UPLOAD_SERVER;
}
let loginServer = "http://localhost:8081"

if (import.meta.env.VITE_LOGIN_SERVER !== undefined) {
  // console.log(import.meta.env.VITE_UPLOAD_SERVER);
  loginServer = import.meta.env.VITE_LOGIN_SERVER;
}



function Upload() {

  return (
    <div className="upload-app">
      <div className="upload-container">
        <div className="upload-banner">
        <h1 className="upload-title">Upload Your Video</h1>
        <h3>Disclaimer: The host is not responsible for any content on this site.</h3>
        <p>Max file size is 80MB. <b style={{color: "lightgreen"}}>MOV and MKV are now accepted alongside MP4.</b></p>
        </div>
        <div className="uploader">
        <FileUploader />
        </div>  
    </div>
    </div>
    
  );
}

export default Upload;

// createRoot(document.getElementById("root")!).render(
//   <StrictMode>
//     <Upload />
//   </StrictMode>
// );