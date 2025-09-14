import React, { useState } from 'react';
import MagneticButton from '../MagneticButton';
import styles from './DropzoneComponent.module.css';

const UploadContainer = ({ onFileUpload }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);  // Store file, don't send to API yet
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
      setUploadedFile(file);  // Store file, don't send to API yet
      onFileUpload(file);     // Pass file to parent component
    }
  };

  const removeImage = () => {
    setUploadedFile(null);  // Clear the uploaded image
    onFileUpload(null);     // Notify parent component
  };

  return (
    <div
      className={`${styles.uploadContainer} ${isDragActive ? styles.active : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {uploadedFile ? (
        <div className="relative w-full h-full">
          <img
            src={URL.createObjectURL(uploadedFile)}
            alt="Uploaded"
            className="object-contain w-full h-full" // Ensures the image fits within the container
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-transparent border-none text-red-500 text-xl cursor-pointer"
          >
            <img src='/dustbin.png' alt="Remove" className="w-5 h-5" />
          </button>
        </div>

      ) : (
        <>
          <text className={styles.minirightheading}>Upload an image with a clear body to change clothes</text>
          <MagneticButton className={styles.magneticButton}>
            <input className={styles.inputPhoto} type="file" accept="image/*" onChange={handleFileChange} />
            <div className={styles.buttontext}>Upload Image</div>
          </MagneticButton>
          <div className={styles.infoText}>
            <p className={styles.dragInst}>Drag and drop your image here</p>
          </div>
        </>
      )}
    </div>
  );
};

export default UploadContainer;
