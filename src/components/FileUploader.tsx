import { ChangeEvent, useState } from "react";
import axios from "axios";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  }

  async function handleFileUpload() {
    if (!file) return;

    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:3000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <input type="file" accept="video/mp4" onChange={handleFileChange} />
      {file && status !== "uploading" && (
        <button onClick={handleFileUpload}>Upload</button>
      )}
      {status === "uploading" && (
        <div>
          <p>Progress: {uploadProgress}%</p>
          <div
            className="upload-bar"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
      {status === "success" && <p>Success!</p>}
      {status === "error" && <p>Upload error, please try again</p>}
    </div>
  );
}
