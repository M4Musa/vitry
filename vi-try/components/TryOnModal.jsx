import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useSession } from "next-auth/react";
import axios from "axios";
// Import Firebase Storage modules
import { storage } from "@/config/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

// Dynamically import webcam component with no SSR
const WebcamCapture = dynamic(
  () => import("./WebcamCapture"),
  { ssr: false }
);

const TryOnModal = ({ productImage, onClose }) => {
  const { data: session } = useSession();
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFirebaseUrl, setUploadedFirebaseUrl] = useState(null); // Store Firebase URL after upload
  const [capturedFirebaseUrl, setCapturedFirebaseUrl] = useState(null); // Store Firebase URL for captured images
  const [activeMethod, setActiveMethod] = useState("capture"); // "capture" or "upload"
  const [cameraSupported, setCameraSupported] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [hasProfilePhoto, setHasProfilePhoto] = useState(false);
  const [usingProfilePhoto, setUsingProfilePhoto] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isUploading, setIsUploading] = useState(false); // New state for image upload progress
  const [uploadProgress, setUploadProgress] = useState(0); // New state for upload progress
  const fileInputRef = useRef(null);

  // Check camera support
  useEffect(() => {
    // Simple check if camera might be supported
    const isSupported = !!navigator.mediaDevices && 
                        !!navigator.mediaDevices.getUserMedia;
    
    setCameraSupported(isSupported);
    
    // If camera is not supported, switch to upload tab automatically
    if (!isSupported) {
      setActiveMethod("upload");
    }
  }, []);

  // Check if user has a profile photo
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session && session.user) {
        try {
          const response = await axios.get('/api/user/profile');
          if (response.data && response.data.avatar && response.data.avatar !== '/images/default-avatar.svg') {
            setProfilePhoto(response.data.avatar);
            setHasProfilePhoto(true);
          }
        } catch (error) {
          console.error("Error fetching user profile photo:", error);
        }
      }
    };

    fetchUserProfile();
  }, [session]);

  // Upload image to Firebase directly without going through API
  const uploadImageToFirebase = async (imageData) => {
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      // Generate a unique filename with timestamp and random ID
      const timestamp = new Date().getTime();
      const uniqueId = uuidv4();
      const filename = `user_images/${timestamp}_${uniqueId}.jpg`;
      
      // Convert data URL to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      setUploadProgress(30);
      
      // Create storage reference
      const storageRef = ref(storage, filename);
      
      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, blob);
      
      // Return a promise that resolves with the download URL
      return new Promise((resolve, reject) => {
        // Listen for state changes, errors, and completion
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Get upload progress
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setUploadProgress(progress);
          },
          (error) => {
            // Handle errors
            console.error("Upload failed:", error);
            reject(error);
          },
          async () => {
            // Upload completed successfully, get the download URL
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setUploadProgress(100);
              console.log("File uploaded successfully. URL:", downloadURL);
              resolve(downloadURL);
            } catch (error) {
              console.error("Error getting download URL:", error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Handler of file selection or upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Reset states
      setErrorMessage(null);
      setUsingProfilePhoto(false);
      setCapturedImage(null);
      
      // Read the file as data URL for preview
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageDataUrl = reader.result;
        setUploadedImage(imageDataUrl);
        setActiveMethod("upload");
        
        // Immediately upload to Firebase
        try {
          const firebaseUrl = await uploadImageToFirebase(imageDataUrl);
          setUploadedFirebaseUrl(firebaseUrl);
        } catch (error) {
          console.error("Failed to upload image to Firebase:", error);
          setErrorMessage("Failed to upload image. Please try again.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Open file browser directly
  const openGallery = () => {
    fileInputRef.current.click();
  };

  // Remove captured image
  const handleRemoveCaptured = () => {
    setCapturedImage(null);
    setCapturedFirebaseUrl(null);
  };

  // Remove uploaded image
  const handleRemoveUploaded = () => {
    setUploadedImage(null);
    setUploadedFirebaseUrl(null);
    setUsingProfilePhoto(false);
  };

  // Handle image capture from webcam component
  const handleCapture = async (imageSrc) => {
    // Reset states
    setErrorMessage(null);
    setUploadedImage(null);
    setUsingProfilePhoto(false);
    
    // Set captured image for preview
    setCapturedImage(imageSrc);
    setActiveMethod("capture");
    
    // Immediately upload to Firebase
    try {
      const firebaseUrl = await uploadImageToFirebase(imageSrc);
      setCapturedFirebaseUrl(firebaseUrl);
    } catch (error) {
      console.error("Failed to upload captured image to Firebase:", error);
      setErrorMessage("Failed to upload captured image. Please try again.");
    }
  };

  // Handler for camera not supported feedback
  const handleCameraNotSupported = () => {
    setCameraSupported(false);
    setActiveMethod("upload");
  };

  // Use profile photo for try-on
  const handleUseProfilePhoto = () => {
    if (profilePhoto) {
      setUploadedImage(profilePhoto);
      setActiveMethod("upload");
      setCapturedImage(null);
      setCapturedFirebaseUrl(null);
      setUploadedFirebaseUrl(null);
      setUsingProfilePhoto(true);
      setErrorMessage(null);
    }
  };

  // Submit to the inference API
  const handleSubmit = async () => {
    // Determine which image to use
    let clothUrl;
    
    if (usingProfilePhoto) {
      // Use profile photo directly
      clothUrl = profilePhoto;
    } else if (activeMethod === "capture" && capturedFirebaseUrl) {
      // Use pre-uploaded captured image URL
      clothUrl = capturedFirebaseUrl;
    } else if (activeMethod === "upload" && uploadedFirebaseUrl) {
      // Use pre-uploaded file URL
      clothUrl = uploadedFirebaseUrl;
    } else if (capturedImage || uploadedImage) {
      // No pre-uploaded URL but we have an image - this is a fallback case
      setErrorMessage("Please wait for image upload to complete before proceeding.");
      return;
    } else {
      // No image selected at all
      setErrorMessage("Please capture or upload an image first.");
      return;
    }
    
    if (!productImage) {
      setErrorMessage("No product selected for try-on.");
      return;
    }

    // Clear any previous errors
    setErrorMessage(null);
    
    try {
      // Start processing with the try-on API
      setProcessing(true);
      
      // Prepare API payload
      const payload = {
        image_url: productImage, // The product image
        cloth_url: clothUrl, // Use the user's image (either profile photo or uploaded) as cloth_url
        type: "overall",
        use_profile_photo: usingProfilePhoto
      };
      
      console.log("Sending payload to inference API:", payload);
      
      const response = await fetch("https://035c-116-58-41-157.ngrok-free.app/run-inference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.status === "success" && result.firebase_url) {
          setResultImage(result.firebase_url);
        } else {
          setErrorMessage("Try-on processing failed: " + (result.message || "Unknown error"));
        }
      } else {
        setErrorMessage("Failed to process try-on request. Server returned an error.");
      }
    } catch (err) {
      console.error("Try-on error:", err);
      setErrorMessage("An unexpected error occurred. Please try again later.");
    } finally {
      setProcessing(false);
    }
  };

  // Check if we can enable the submit button
  const canProceed = usingProfilePhoto || capturedFirebaseUrl || uploadedFirebaseUrl;

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Background overlay with gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-[#4B003B] to-gray-900 opacity-80" 
        onClick={onClose} 
      />

      <motion.div
        className="bg-white rounded-xl shadow-2xl z-50 w-full mx-4 max-w-4xl flex flex-col sm:flex-row overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ maxHeight: "90vh" }}
      >
        {/* Left side - Selected dress display */}
        <div className="w-full sm:w-1/3 bg-gray-50 p-4 flex flex-col">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Selected Item</h3>
          <div className="flex-grow flex items-center justify-center bg-white rounded-lg p-2 border border-gray-100">
            {productImage ? (
              <div className="relative w-full h-full min-h-[200px]">
                <Image 
                  src={productImage} 
                  alt="Selected product" 
                  layout="fill"
                  objectFit="contain"
                  priority
                />
              </div>
            ) : (
              <div className="text-gray-400 text-sm">No product selected</div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">The item you&apos;ll be trying on virtually</p>
        </div>

        {/* Right side - Main content */}
        <div className="w-full sm:w-2/3 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h2 className="text-xl font-serif tracking-wide text-[#4B003B]">Virtual Try-On</h2>
          <button 
            onClick={onClose} 
              className="text-gray-500 hover:text-[#4B003B] transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
          {/* Display error message if any */}
          {errorMessage && (
            <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errorMessage}
              </div>
            </div>
          )}
          
          {/* Image Upload Loading State */}
          {isUploading && (
            <div className="mx-4 mt-2 p-3 bg-[#4B003B]/5 border border-[#4B003B]/20 rounded-lg">
              <div className="flex flex-col items-center">
                <h3 className="text-[#4B003B] text-sm font-medium mb-2">Uploading Your Image</h3>
                
                {/* Progress bar */}
                <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mb-1">
                  <div 
                    className="bg-[#4B003B] h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 self-end">{uploadProgress}%</div>
              </div>
            </div>
          )}
          
          {/* Processing State - Show elegant loading screen */}
          {!isUploading && processing && (
            <div className="flex-grow flex items-center justify-center p-4">
              <div className="bg-gradient-to-br from-[#4B003B]/10 to-[#4B003B]/5 p-8 rounded-2xl border border-[#4B003B]/20 w-full max-w-md flex flex-col items-center">
                <div className="relative w-20 h-20 mb-6">
                  <svg className="animate-spin w-full h-full text-[#4B003B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[#4B003B] text-xs font-medium">AI</span>
                  </div>
                </div>
                <h3 className="text-[#4B003B] text-xl font-serif mb-3">Creating Your Look</h3>
                <p className="text-gray-600 text-center mb-4">Our AI is working on your virtual try-on. This may take a moment...</p>
                <div className="w-full max-w-xs bg-gray-200 rounded-full h-1.5 mb-1">
                  <div className="bg-[#4B003B] h-1.5 rounded-full animate-pulse"></div>
                </div>
                <div className="flex justify-between w-full max-w-xs">
                  <span className="text-xs text-gray-500">Processing</span>
                  <span className="text-xs text-gray-500">Please wait</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Show the result if we have it */}
          {!isUploading && !processing && resultImage && (
            <div className="flex-grow flex flex-col items-center justify-center p-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 w-full h-full flex items-center justify-center">
                <div className="relative w-full" style={{ height: "50vh" }}>
                  <Image
                    src={resultImage}
                    alt="Virtual try-on result"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
              <div className="flex justify-center mt-4 space-x-3">
                <button 
                  onClick={() => setResultImage(null)} 
                  className="px-4 py-2 bg-gray-200 rounded-full text-gray-800 hover:bg-gray-300 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-[#4B003B] rounded-full text-white hover:bg-opacity-90 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Image Capture/Upload UI */}
          {!processing && !resultImage && (
            <>
              {/* Method selector - Only show tabs if camera is supported */}
              <div className="px-4 pt-3">
                {cameraSupported ? (
                  <div className="flex rounded-full bg-gray-100 p-1 mb-3 max-w-xs mx-auto">
          <button
            onClick={() => {
              setActiveMethod("capture");
              setUploadedImage(null);
                        setUsingProfilePhoto(false);
                        setErrorMessage(null);
            }}
            className={`${
              activeMethod === "capture" 
                          ? "bg-[#4B003B] text-white" 
                : "bg-transparent text-gray-600 hover:text-gray-800"
            } flex-1 py-2 px-4 rounded-full transition-all duration-300 font-medium text-sm`}
          >
            Take Photo
          </button>
          <button
            onClick={() => {
              setActiveMethod("upload");
              setCapturedImage(null);
                        setErrorMessage(null);
            }}
            className={`${
              activeMethod === "upload" 
                          ? "bg-[#4B003B] text-white" 
                : "bg-transparent text-gray-600 hover:text-gray-800"
            } flex-1 py-2 px-4 rounded-full transition-all duration-300 font-medium text-sm`}
          >
            Upload Image
          </button>
        </div>
                ) : (
                  <div className="text-center mb-3">
                    <div className="text-sm text-gray-600 mb-1">Camera not available on this device</div>
                    <p className="text-xs text-gray-500">Please upload an image instead</p>
                  </div>
                )}

                {/* Profile Photo Option - With visual indication when selected */}
                {session && hasProfilePhoto && (
                  <div className="flex justify-center mb-3">
                    <button
                      onClick={handleUseProfilePhoto}
                      className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 font-medium text-sm ${
                        usingProfilePhoto 
                          ? "bg-[#4B003B] text-white" 
                          : "bg-[#4B003B]/10 text-[#4B003B] hover:bg-[#4B003B]/20"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {usingProfilePhoto ? "Using Profile Photo" : "Use Your Profile Photo"}
                    </button>
                  </div>
                )}
                </div>
                
              {/* Hidden input for file uploads */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                
              {/* Content area with fixed height */}
              <div className="flex-grow p-4 overflow-y-auto" style={{ maxHeight: "50vh" }}>
                {/* Camera Section - Only show if camera is supported and active */}
                {activeMethod === "capture" && cameraSupported && (
                  <div className="h-full flex flex-col">
                    <WebcamCapture 
                      onCapture={handleCapture} 
                      openGallery={openGallery} 
                      onCameraNotSupported={handleCameraNotSupported}
                    />
                    
                    {/* Captured image preview */}
                    {capturedImage && (
                      <div className="mt-3 bg-gray-50 p-2 rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="border border-[#4B003B] border-opacity-30 p-1 inline-block rounded-md shadow-sm">
                            <img src={capturedImage} alt="Captured" className="w-16 h-16 object-cover" />
                          </div>
                          <div className="ml-2">
                            <p className="text-xs text-gray-600">Preview</p>
                            {capturedFirebaseUrl && (
                              <p className="text-xs text-green-600">✓ Uploaded</p>
                            )}
                </div>
              </div>
                    <button 
                      onClick={handleRemoveCaptured}
                          className="text-[#4B003B] hover:text-[#4B003B] opacity-80 text-xs font-medium flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                </div>
              )}
            </div>
          )}

                {/* Upload Section - Show either if upload is active OR camera is not supported */}
                {(activeMethod === "upload" || !cameraSupported) && (
                  <div className="h-full flex flex-col">
                    {/* Only show upload area if not using profile photo */}
                    {!usingProfilePhoto ? (
                      <div className="flex-grow border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#4B003B] transition-colors duration-300 flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                        <p className="mt-2 text-sm text-gray-600">Drag and drop an image here, or</p>
                        <div className="mt-2 flex flex-col sm:flex-row gap-2 items-center">
                          <label className="inline-block">
                            <span className="bg-[#4B003B] bg-opacity-10 text-[#4B003B] px-4 py-2 rounded-full text-sm font-medium cursor-pointer hover:bg-opacity-20 transition-colors duration-300">
                      Browse Files
                    </span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                      </div>
                    ) : (
                      <div className="flex-grow flex items-center justify-center">
                        <div className="bg-[#4B003B]/5 p-4 rounded-lg text-center">
                          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-[#4B003B]/20 mb-3">
                            <img src={profilePhoto} alt="Your profile photo" className="w-full h-full object-cover" />
                          </div>
                          <p className="text-[#4B003B] font-medium">Using Your Profile Photo</p>
                          <p className="text-sm text-gray-600 mt-1">Your profile photo will be used for the try-on</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Uploaded image preview - only show if not using profile photo */}
                    {uploadedImage && !usingProfilePhoto && (
                      <div className="mt-3 bg-gray-50 p-2 rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="border border-[#4B003B] border-opacity-30 p-1 rounded-md shadow-sm">
                            <img src={uploadedImage} alt="Uploaded" className="w-16 h-16 object-cover" />
                          </div>
                          <div className="ml-2">
                            <p className="text-xs text-gray-600">Selected Image</p>
                            {uploadedFirebaseUrl && (
                              <p className="text-xs text-green-600">✓ Uploaded</p>
                            )}
                          </div>
                        </div>
                      <button 
                        onClick={handleRemoveUploaded}
                          className="text-[#4B003B] hover:text-[#4B003B] opacity-80 text-xs font-medium flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                  </div>
                )}
            </div>
          )}
        </div>

              {/* Footer with submit button */}
              <div className="p-4 border-t border-gray-100 flex justify-end">
          <motion.button 
            onClick={handleSubmit} 
                  className={`bg-gradient-to-r from-[#4B003B] to-[#4B003B] px-6 py-2 rounded-full text-white font-medium shadow-lg ${
                    !canProceed ? 'opacity-50 cursor-not-allowed' : ''
            }`}
                  whileHover={canProceed ? { scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" } : {}}
                  whileTap={canProceed ? { scale: 0.98 } : {}}
            transition={{ duration: 0.2 }}
                  disabled={!canProceed}
          >
                  {isUploading ? "Uploading..." : "Create Magic!"}
          </motion.button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TryOnModal;