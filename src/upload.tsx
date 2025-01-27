import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./upload.scss"; // Import the updated styles
import FileUploader from "./components/FileUploader";

function Upload() {
  return (
    <div className="upload-container">
      <button
        className="back-button"
        onClick={() => (window.location.href = "/")}
      >
        Home
      </button>
      <h1 className="upload-title">Upload Your Video</h1>
      <FileUploader />
    </div>
  );
}

export default Upload;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Upload />
  </StrictMode>
);
