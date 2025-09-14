import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { motion } from "framer-motion";

const WebcamCapture = ({ onCapture, openGallery, onCameraNotSupported }) => {
  const webcamRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [maxSize, setMaxSize] = useState(300);
  const [isMobile, setIsMobile] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [retryCount, setRetryCount] = useState(0);
  const [browserSupport, setBrowserSupport] = useState(true);
  const [hasCameraStarted, setHasCameraStarted] = useState(false);

  // Check for getUserMedia support - more permissive for desktop browsers
  useEffect(() => {
    const checkCameraSupport = async () => {
      // Polyfill getUserMedia
      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
      }
      
      // Older browsers might not implement mediaDevices at all
      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function(constraints) {
          // First, try the legacy methods
          const getUserMedia = 
            navigator.webkitGetUserMedia || 
            navigator.mozGetUserMedia || 
            navigator.msGetUserMedia;
  
          if (!getUserMedia) {
            setBrowserSupport(false);
            // Notify parent component that camera is not supported
            if (onCameraNotSupported) onCameraNotSupported();
            return Promise.reject(new Error("getUserMedia is not implemented in this browser"));
          }
  
          // Legacy versions used callbacks instead of promises
          return new Promise(function(resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject);
          });
        };
      }
  
      // Additional check - try to detect if basic camera features are available
      try {
        if (typeof navigator.mediaDevices.getUserMedia === 'function') {
          // We consider the browser supported if it has the function, even if we
          // don't try to access the camera yet (which would trigger permission prompts)
          return;
        } else {
          console.warn("getUserMedia exists but is not a function");
          setBrowserSupport(false);
          if (onCameraNotSupported) onCameraNotSupported();
        }
      } catch (err) {
        console.error("Error checking media devices:", err);
        setBrowserSupport(false);
        if (onCameraNotSupported) onCameraNotSupported();
      }
    };
    
    checkCameraSupport();
  }, [onCameraNotSupported]);

  // Detect if on mobile device
  useEffect(() => {
    const checkMobile = () => {
      const ua = navigator.userAgent;
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initial check for camera permissions
  useEffect(() => {
    if (!browserSupport) return;
    
    const checkPermissions = async () => {
      try {
        // First check if permissions API is available
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const result = await navigator.permissions.query({ name: 'camera' });
            
            if (result.state === 'granted') {
              setHasPermission(true);
            } else if (result.state === 'prompt') {
              // Will be handled by webcam component
              setHasPermission(null);
            } else {
              setHasPermission(false);
            }
          } catch (permErr) {
            // Some browsers don't support camera in permissions.query
            console.log("Permission query not supported for camera:", permErr);
            setHasPermission(null);
          }
        } else {
          // For browsers that don't support permissions API
          // We'll rely on the Webcam component's error handling
          setHasPermission(null);
        }
      } catch (err) {
        console.log("Permission check error:", err);
        // Some browsers throw error when checking camera permission
        // We'll rely on the Webcam component's error handling
        setHasPermission(null);
      }
    };
    
    checkPermissions();
  }, [browserSupport]);

  // Set video constraints based on device
  const videoConstraints = {
    facingMode: facingMode,
    width: { ideal: isMobile ? 720 : 1280 },
    height: { ideal: isMobile ? 1280 : 720 }
  };

  // Handle switching camera (for mobile)
  const switchCamera = () => {
    setFacingMode(prevMode => prevMode === "user" ? "environment" : "user");
  };

  // Get camera dimensions after component mounts
  useEffect(() => {
    if (!browserSupport) return;
    
    const updateDimensions = () => {
      if (webcamRef.current && webcamRef.current.video) {
        const video = webcamRef.current.video;
        const width = video.videoWidth;
        const height = video.videoHeight;
        
        // Calculate the maximum square size that fits in the video
        const maxSquareSize = Math.min(width, height);
        setDimensions({ width, height });
        setMaxSize(maxSquareSize);
      }
    };

    // Check dimensions when video is playing
    if (webcamRef.current && webcamRef.current.video) {
      webcamRef.current.video.addEventListener('loadeddata', updateDimensions);
      return () => {
        if (webcamRef.current && webcamRef.current.video) {
          webcamRef.current.video.removeEventListener('loadeddata', updateDimensions);
        }
      };
    }
  }, [facingMode, browserSupport]);

  // Handle webcam errors
  const handleWebcamError = (err) => {
    console.error("Webcam error:", err);
    
    // Different error handling based on the error message
    const errorMsg = err.message || "Failed to access camera";
    
    if (errorMsg.includes("Permission denied") || 
        errorMsg.includes("not allowed") || 
        errorMsg.includes("denied")) {
      setCameraError("Camera access denied by browser");
      setHasPermission(false);
    } else if (errorMsg.includes("requested device not found") || 
              errorMsg.includes("no camera available")) {
      setCameraError("No camera detected on your device");
      setHasPermission(false);
    } else if (errorMsg.includes("not implemented") || 
              errorMsg.includes("getUserMedia is not implemented")) {
      setCameraError("Your browser doesn't support camera access");
      setBrowserSupport(false);
      setHasPermission(false);
      // Notify parent component that camera is not supported
      if (onCameraNotSupported) onCameraNotSupported();
    } else if (retryCount < 3) {
      // Sometimes initial errors occur on mobile - retry a few times
      setRetryCount(prev => prev + 1);
      setTimeout(() => {
        // Force re-render by changing the facing mode slightly
        setFacingMode(mode => mode === "user" ? "user" : "environment");
      }, 1000);
    } else {
      setCameraError(`Camera error: ${errorMsg}`);
      setHasPermission(false);
      // If we've tried multiple times and still failed, consider camera not supported
      if (onCameraNotSupported) onCameraNotSupported();
    }
  };

  // Handle when webcam starts successfully
  const handleUserMedia = (stream) => {
    // Camera access is successful
    setHasPermission(true);
    setCameraError(null);
    setRetryCount(0);
    setHasCameraStarted(true);
    
    // This will be called when camera access is granted
    if (webcamRef.current && webcamRef.current.video) {
      // Wait a bit for camera to initialize fully
      setTimeout(() => {
        if (webcamRef.current && webcamRef.current.video) {
          const video = webcamRef.current.video;
          const width = video.videoWidth;
          const height = video.videoHeight;
          const maxSquareSize = Math.min(width, height);
          setDimensions({ width, height });
          setMaxSize(maxSquareSize);
        }
      }, 500);
    }
  };

  // Handle capturing image from webcam with max square dimensions
  const handleCapture = () => {
    if (!webcamRef.current) return;
    
    try {
      // Get the maximum square size for the screenshot
      const captureSize = maxSize;
      
      // Take screenshot with square dimensions
      const imageSrc = webcamRef.current.getScreenshot({
        width: captureSize,
        height: captureSize
      });
      
      if (imageSrc && onCapture) {
        onCapture(imageSrc);
      }
    } catch (err) {
      console.error("Error capturing image:", err);
      alert("Failed to capture image. Please try again.");
    }
  };

  // Request camera permissions manually if needed
  const requestCameraPermission = async () => {
    try {
      if (!browserSupport) {
        setCameraError("Your browser doesn't support camera access. Please try a modern browser like Chrome or Safari.");
        return;
      }
      
      // Reset error state
      setCameraError(null);
      
      // Use very basic constraints for maximum compatibility
      const basicConstraints = { 
        audio: false, 
        video: true
      };
      
      // Directly attempt to access the camera with minimal constraints
      // This has better compatibility across browsers
      const stream = await navigator.mediaDevices.getUserMedia(basicConstraints);
      
      // If we get here, permission was granted
      setHasPermission(true);
      setCameraError(null);
      
      // Don't stop the stream - this can cause issues on some browsers
      // Let the Webcam component use this stream
      
      // Force a complete remount of the component to reinitialize everything
      setRetryCount(0);
      setHasPermission(null);
      
      // Short delay to ensure the DOM updates
      setTimeout(() => {
        setHasPermission(true);
      }, 100);
      
    } catch (err) {
      console.error("Permission request failed:", err);
      
      // Make error message more user-friendly with specific guidance
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera permission denied. Please check your browser settings to allow camera access.");
      } else if (err.name === "NotFoundError") {
        setCameraError("No camera found on your device. Make sure your device has a working camera.");
      } else if (err.name === "NotReadableError" || err.name === "AbortError") {
        setCameraError("Camera is already in use by another application.");
      } else if (err.name === "NotSupportedError" || err.message.includes("not implemented")) {
        setCameraError("Your browser doesn't support camera access. Please try a modern browser.");
        setBrowserSupport(false);
      } else {
        setCameraError(`Camera error: ${err.message || "Unknown error"}`);
      }
      
      setHasPermission(false);
    }
  };

  // Show unsupported browser message
  if (browserSupport === false) {
    // Notify parent component
    if (onCameraNotSupported) {
      // Use setTimeout to avoid potential React state update issues
      setTimeout(() => onCameraNotSupported(), 0);
    }
    
    return (
      <div className="flex-grow rounded-lg overflow-hidden flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-700 mb-3">Camera access is not supported by your browser</p>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-600 mb-3">Please try:</p>
          <ul className="text-left text-sm text-gray-600 mb-4 list-disc pl-5">
            <li>Using a modern browser like Chrome, Firefox, or Safari</li>
            <li>Updating your current browser to the latest version</li>
            <li>Trying a different device if available</li>
          </ul>
          <button 
            className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm shadow-md hover:bg-opacity-90"
            onClick={openGallery}
          >
            Use Gallery Instead
          </button>
        </div>
      </div>
    );
  }

  // Show error state if camera permission is denied or has error
  if (hasPermission === false) {
    return (
      <div className="flex-grow rounded-lg overflow-hidden flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 5.5l-15 15" />
        </svg>
        <p className="text-gray-700 mb-3">{cameraError || "Camera access denied"}</p>
        
        <div className="flex flex-col md:flex-row gap-2">
          <button 
            className="bg-[#4B003B] text-white px-4 py-2 rounded-md text-sm shadow-md hover:bg-opacity-90"
            onClick={requestCameraPermission}
          >
            Allow Camera Access
          </button>
          <button 
            className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm shadow-md hover:bg-opacity-90 mt-2 md:mt-0"
            onClick={openGallery}
          >
            Use Gallery Instead
          </button>
        </div>
        
        {/* Additional help text */}
        <div className="mt-4 text-xs text-gray-500 max-w-xs mx-auto">
          <p>If permission dialog doesn't appear:</p>
          <ul className="text-left mt-1 list-disc pl-5">
            <li>Ensure your browser has camera permissions enabled in settings</li>
            <li>Try using a different browser</li>
            <li>On iOS, make sure camera access is enabled in Settings → Privacy → Camera</li>
          </ul>
        </div>
      </div>
    );
  }

  // Show loading state while permission is being determined
  if (hasPermission === null) {
    return (
      <div className="flex-grow rounded-lg overflow-hidden flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-gray-300 h-12 w-12 mb-3"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-grow rounded-lg overflow-hidden">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="w-full h-full object-cover"
        onUserMedia={handleUserMedia}
        onUserMediaError={handleWebcamError}
        mirrored={facingMode === "user"}
        forceScreenshotSourceSize
      />
      
      {/* Square frame overlay at maximum possible square size */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="border-2 border-[#4B003B]"
          style={{ 
            width: `${Math.min(maxSize, 300)}px`, 
            height: `${Math.min(maxSize, 300)}px`,
            maxWidth: "80%",
            maxHeight: "80%"
          }}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>
      
      {/* Camera controls */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-around">
        <motion.button 
          className="bg-gray-800 text-gray-100 rounded-full py-1 px-3 text-sm shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openGallery}
        >
          Gallery
        </motion.button>
        <motion.button 
          onClick={handleCapture} 
          className="bg-[#4B003B] rounded-full p-2 text-white shadow-lg flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </motion.button>
        {isMobile && (
          <motion.button 
            className="bg-gray-800 text-gray-100 rounded-full py-1 px-3 text-sm shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={switchCamera}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </motion.button>
        )}
      </div>
      
      {/* Debug info - remove in production */}
      {/* <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs p-1 rounded">
        Camera: {dimensions.width}x{dimensions.height} | Max Square: {maxSize}px
      </div> */}
    </div>
  );
};

export default WebcamCapture; 