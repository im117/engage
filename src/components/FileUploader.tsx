import { ChangeEvent, useState } from "react";
import axios from "axios";
import "dotenv";

let uploadServer = "http://localhost:3000";
if (import.meta.env.VITE_UPLOAD_SERVER !== undefined) {
  // console.log(import.meta.env.VITE_UPLOAD_SERVER);
  uploadServer = import.meta.env.VITE_UPLOAD_SERVER;
}

interface FormValues {
  title: string;
  desc: string;
  fileName: string;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

const MAX_FILE_SIZE = 80 * 1024 * 1024; // 80MB

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [values, setValues] = useState<FormValues>({
    title: "",
    desc: "",
    fileName: "",
  });
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);

  function handleTitleChange(e: ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
    setValues({ ...values, title: e.target.value });
  }

  function handleDescChange(e: ChangeEvent<HTMLInputElement>) {
    setDesc(e.target.value);
    setValues({ ...values, desc: e.target.value });
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setValues({ ...values, fileName: e.target.files[0].name });
    }
  }
  /**
   * Checks to see if a file is an MP4
   * @param file
   * @returns
   */
  function isMP4(file: File) {
    const fileName: string = file.name;
    const fileExtension = fileName?.split(".").pop()?.toLowerCase();
    return fileExtension === "mp4";
  }

  async function handleFileUpload() {
    if (!file) return;
    console.log("File size: " + file.size);
    console.log("Max file size: " + MAX_FILE_SIZE);
    if (!isMP4(file)) {
      alert("File is not an mp4.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert("File is too big. Max file size is 80MB");
      return;
    }

    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", desc);

    const token = localStorage.getItem("token"); // Retrieve JWT token
    try {
      await axios
        .post("http://localhost:3000/record", values)
        .then((response) => {
          console.log(response.data);
        });
      await axios.post("http://localhost:3000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? token : "", // Send token in header
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
      <br></br>
      <label htmlFor="title">Title: </label>
      <input name="title" value={title} onChange={handleTitleChange} />
      <br></br>
      <label htmlFor="desc">Description: </label>
      <input name="desc" value={desc} onChange={handleDescChange} />
      <br></br>
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
