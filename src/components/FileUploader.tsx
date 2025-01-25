// Started from this youtube tutorial: https://www.youtube.com/watch?v=pWd6Enu2Pjs

import { ChangeEvent, useState } from "react";
import axios from "axios";

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function FileUploader() {
    const [file, setFile] = useState<File | null>(null) // pass state as File or null depending on result of file upload
    const [status, setStatus] = useState<UploadStatus>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        if(e.target.files){
            setFile(e.target.files[0]); // take only the first file from input
        };
    };

    async function handleFileUpload() { // async function for await request
        if (!file) return;

        setStatus('uploading');

        const formData = new FormData();
        formData.append('file', file);

        try {
            // TODO: Change where the upload is pointed to
            // ? Trying to point the upload to a local server, meaning ourselves.
            // * Trying to upload locally to ./media
            await axios.post("https://httpbin.org/post", formData, { headers: {
                'Content-Type': 'multipart/form-data',
            },
            // Cosmetic, showing upload progress on html
            onUploadProgress: (progressEvent) => {
                const progress = progressEvent.total ? /* "?" is there because its an "optional" */ 
                    Math.round((progressEvent.loaded * 100) / progressEvent.total)
                : 0;
                setUploadProgress(progress);
            },
        });

        setStatus('success');
        }catch {
            setStatus('error');
        };
    }

    return (
    <div>
        <input type="file" onChange={handleFileChange} /> {/* Executes function handleFileChange once file is submitted */}
        {file && status !== 'uploading' && <button onClick={handleFileUpload}>Upload</button>}
        {status == 'uploading' && (
            <div>
                <p>Progress: {uploadProgress}%</p>
                <div className="upload-bar" style={{width: `${uploadProgress}%`}}></div>
            </div>
            )}
        {status == 'success' && <p>Success!</p>}
        {status == 'error' && <p>Upload error, please try again</p>}
    </div>
);
};