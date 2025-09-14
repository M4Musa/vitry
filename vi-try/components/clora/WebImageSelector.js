import React, { useState } from 'react';
import MagneticButton from '../MagneticButton';
import styles from './WebImageSelector.module.css';
import { useRouter } from 'next/router';

const WebUploadContainer = ({ onFileUpload }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const router =useRouter();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);  // Store file locally
      onFileUpload(file);     // Pass file to parent component
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);  // Store file locally
      onFileUpload(file);     // Pass file to parent component
    }
  };

  const removeImage = () => {
    setUploadedFile(null);  // Clear the uploaded image
    onFileUpload(null);     // Notify parent component
  };

  return (
    <div
      className={`${styles.webuploadContainer} ${isDragActive ? styles.active : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {uploadedFile ? (
        <div className="relative w-full h-full">
          <img
            src={URL.createObjectURL(uploadedFile)}
            alt="Uploaded"
            className="object-contain w-full h-full max-h-full max-w-full"
          />
          <button
            onClick={removeImage}
            className="absolute top-1 right-1 bg-transparent border-none text-red-500 text-lg cursor-pointer"
          >
            <img src='/dustbin.png' alt="Remove" className="w-5 h-5" />
          </button>
        </div>

      ) : (
        <>
          <text className={styles.minirightheading}>Choose Your New Clothes</text>
          <MagneticButton className={styles.magneticButton} onClick={()=>{
            router.push('/ProductsPage');
          }}>
            {/* <input className={styles.inputPhoto} type="file" accept="image/*" onChange={handleFileChange} /> */}
            <div className={styles.buttontext}>See Amazing Outfit</div>
          </MagneticButton>
          <div className={styles.infoText}>
            <p className={styles.dragInst}>Drag and drop your image here</p>
          </div>
        </>
      )}
    </div>
  );
};

export default WebUploadContainer;
