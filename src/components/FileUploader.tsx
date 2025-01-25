import { ChangeEvent, useState } from "react";
import axios from "axios";

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function FileUploader() {
    const [file, setFile] = useState<File | null>(null) // pass state as File or null depending on result of file upload
    const [status, setStatus] = useState<UploadStatus>('idle');

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
            await axios.post("https://httpbin.org/post", formData, { headers: {
                'Content-Type': 'multipart/form-data',
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
        {status == 'success' && <p>Success!</p>}
        {status == 'error' && <p>Upload error, please try again</p>}
    </div>
);
};