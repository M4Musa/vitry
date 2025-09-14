import { useState, useEffect, useRef } from 'react';
import MagneticButton from '@/components/MagneticButton';
import UploadContainer from '@/components/clora/DropzoneComponent';
import WebUploadContainer from '@/components/clora/WebImageSelector';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import axios from 'axios';
// Import Firebase Storage modules
import { storage } from "@/config/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const CloraUploadComponenet = ({ productImage, userProfilePhoto }) => {
    const [userImageDataUrl, setUserImageDataUrl] = useState(null);
    const [productImageUrl, setProductImageUrl] = useState(productImage); // Pre-select product image
    const [uploadedFirebaseUrl1, setUploadedFirebaseUrl1] = useState(null);
    const [uploadedFirebaseUrl2, setUploadedFirebaseUrl2] = useState(null);
    const [showMessage, setShowMessage] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [resultImage, setResultImage] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [hasProfilePhoto, setHasProfilePhoto] = useState(false);
    const [usingProfilePhoto, setUsingProfilePhoto] = useState(false);
    const [isUploading1, setIsUploading1] = useState(false);
    const [isUploading2, setIsUploading2] = useState(false);
    const [uploadProgress1, setUploadProgress1] = useState(0);
    const [uploadProgress2, setUploadProgress2] = useState(0);
    const [errorMessage, setErrorMessage] = useState(null);
    const router = useRouter();
    const { data: session } = useSession();
    const fileInputRef1 = useRef(null);
    const fileInputRef2 = useRef(null);

    // Update product image when prop changes
    useEffect(() => {
        if (productImage) {
            setProductImageUrl(productImage);
        }
    }, [productImage]);

    // Debug logs
    useEffect(() => {
        console.log("CloraUploadComponent received props:", { 
            userProfilePhoto: userProfilePhoto ? "Exists" : "Not provided", 
            productImage: productImage ? "Exists" : "Not provided" 
        });
    }, [userProfilePhoto, productImage]);

    // Check if user has a profile photo (either from prop or api)
    useEffect(() => {
        // If profile photo is passed as prop, use it
        if (userProfilePhoto) {
            console.log("Using profile photo from props");
            setProfilePhoto(userProfilePhoto);
            setHasProfilePhoto(true);
            return;
        }

        // Otherwise fetch from API as fallback
        const fetchUserProfile = async () => {
            if (session && session.user) {
                try {
                    console.log("Fetching profile photo from API");
                    const response = await axios.get('/api/user/profile');
                    if (response.data && response.data.avatar && response.data.avatar !== '/images/default-avatar.svg') {
                        console.log("Profile photo found in API response");
                        setProfilePhoto(response.data.avatar);
                        setHasProfilePhoto(true);
                    }
                } catch (error) {
                    console.error("Error fetching user profile photo:", error);
                }
            }
        };

        fetchUserProfile();
    }, [session, userProfilePhoto]);

    // Upload image to Firebase directly
    const uploadImageToFirebase = async (imageDataUrl, setUploading, setProgress, fileType) => {
        setUploading(true);
        setProgress(10);
        
        try {
            // Generate a unique filename with timestamp and random ID
            const timestamp = new Date().getTime();
            const uniqueId = uuidv4();
            const filename = `clora_uploads/${fileType}_${timestamp}_${uniqueId}.jpg`;
            
            // Convert data URL to blob
            const response = await fetch(imageDataUrl);
            const blob = await response.blob();
            
            setProgress(30);
            
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
                        setProgress(progress);
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
                            setProgress(100);
                            console.log(`${fileType} uploaded successfully. URL:`, downloadURL);
                            resolve(downloadURL);
                        } catch (error) {
                            console.error("Error getting download URL:", error);
                            reject(error);
                        } finally {
                            setUploading(false);
                        }
                    }
                );
            });
        } catch (error) {
            console.error(`${fileType} upload failed:`, error);
            setUploading(false);
            throw error;
        }
    };

    // Handle user image upload (File input)
    const handleUserImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Reset states
            setErrorMessage(null);
            setUsingProfilePhoto(false);
            
            // Read the file as data URL for preview
            const reader = new FileReader();
            reader.onloadend = async () => {
                const imageDataUrl = reader.result;
                setUserImageDataUrl(imageDataUrl);
                
                // Immediately upload to Firebase
                try {
                    console.log("Starting Firebase upload for user image...");
                    const firebaseUrl = await uploadImageToFirebase(imageDataUrl, setIsUploading1, setUploadProgress1, 'user_image');
                    console.log("User image uploaded to Firebase:", firebaseUrl);
                    setUploadedFirebaseUrl1(firebaseUrl);
                    
                    // Show success message
                    setShowMessage(true);
                    setTimeout(() => setShowMessage(false), 2000);
                } catch (error) {
                    console.error("Failed to upload user image to Firebase:", error);
                    setErrorMessage("Failed to upload your photo. Please try again.");
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    // Handle product image upload (replacing default product)
    const handleProductImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Reset states
            setErrorMessage(null);
            
            // Read the file as data URL for preview
            const reader = new FileReader();
            reader.onloadend = async () => {
                const imageDataUrl = reader.result;
                
                // Immediately upload to Firebase
                try {
                    console.log("Starting Firebase upload for product image...");
                    const firebaseUrl = await uploadImageToFirebase(imageDataUrl, setIsUploading2, setUploadProgress2, 'product_image');
                    console.log("Product image uploaded to Firebase:", firebaseUrl);
                    setUploadedFirebaseUrl2(firebaseUrl);
                    setProductImageUrl(firebaseUrl);
                    
                    // Show success message
                    setShowMessage(true);
                    setTimeout(() => setShowMessage(false), 2000);
                } catch (error) {
                    console.error("Failed to upload product image to Firebase:", error);
                    setErrorMessage("Failed to upload product image. Please try again.");
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    // Handler for UploadContainer component
    const handleDropZoneUpload = async (file) => {
        // If the file is already a data URL (string), process it directly
        if (typeof file === 'string' && file.startsWith('data:')) {
            setUserImageDataUrl(file);
            setUsingProfilePhoto(false);
            
            try {
                console.log("Starting Firebase upload for dropped user image...");
                const firebaseUrl = await uploadImageToFirebase(file, setIsUploading1, setUploadProgress1, 'user_image');
                console.log("User image uploaded to Firebase:", firebaseUrl);
                setUploadedFirebaseUrl1(firebaseUrl);
            } catch (error) {
                console.error("Failed to upload user image to Firebase:", error);
                setErrorMessage("Failed to upload your photo. Please try again.");
            }
        } else if (file instanceof File) {
            // If it's a File object, handle it like the direct file input
            const reader = new FileReader();
            reader.onloadend = async () => {
                const imageDataUrl = reader.result;
                setUserImageDataUrl(imageDataUrl);
                setUsingProfilePhoto(false);
                
                try {
                    console.log("Starting Firebase upload for user image file...");
                    const firebaseUrl = await uploadImageToFirebase(imageDataUrl, setIsUploading1, setUploadProgress1, 'user_image');
                    console.log("User image uploaded to Firebase:", firebaseUrl);
                    setUploadedFirebaseUrl1(firebaseUrl);
                } catch (error) {
                    console.error("Failed to upload user image to Firebase:", error);
                    setErrorMessage("Failed to upload your photo. Please try again.");
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    // Handler for WebUploadContainer component
    const handleWebImageUpload = async (file) => {
        // If the file is already a data URL (string), process it directly
        if (typeof file === 'string' && file.startsWith('data:')) {
            try {
                console.log("Starting Firebase upload for web product image...");
                const firebaseUrl = await uploadImageToFirebase(file, setIsUploading2, setUploadProgress2, 'product_image');
                console.log("Product image uploaded to Firebase:", firebaseUrl);
                setUploadedFirebaseUrl2(firebaseUrl);
                setProductImageUrl(firebaseUrl);
            } catch (error) {
                console.error("Failed to upload product image to Firebase:", error);
                setErrorMessage("Failed to upload product image. Please try again.");
            }
        } else if (file instanceof File) {
            // If it's a File object, handle it like the direct file input
            const reader = new FileReader();
            reader.onloadend = async () => {
                const imageDataUrl = reader.result;
                
                try {
                    console.log("Starting Firebase upload for product image file...");
                    const firebaseUrl = await uploadImageToFirebase(imageDataUrl, setIsUploading2, setUploadProgress2, 'product_image');
                    console.log("Product image uploaded to Firebase:", firebaseUrl);
                    setUploadedFirebaseUrl2(firebaseUrl);
                    setProductImageUrl(firebaseUrl);
                } catch (error) {
                    console.error("Failed to upload product image to Firebase:", error);
                    setErrorMessage("Failed to upload product image. Please try again.");
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Use profile photo for try-on
    const handleUseProfilePhoto = () => {
        if (profilePhoto) {
            setUserImageDataUrl(profilePhoto);
            setUploadedFirebaseUrl1(null);
            setUsingProfilePhoto(true);
        }
    };

    const handleUpload = async () => {
        // Clear any previous error message
        setErrorMessage(null);
        
        // Check tokens and subscription before proceeding
        if (!session) {
            if (confirm('You need to be logged in to use the try-on feature. Would you like to log in?')) {
                router.push('/welcome');
            }
            return;
        }

        try {
            const tokenResponse = await fetch('/api/tokens/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const tokenData = await tokenResponse.json();

            if (!tokenResponse.ok) {
                if (tokenData.error === 'No active subscription') {
                    if (confirm('You need an active subscription to use try-on features. Would you like to view our subscription plans?')) {
                        router.push('/subscription');
                    }
                } else if (tokenData.error === 'Insufficient tokens') {
                    if (confirm('You have run out of tokens. Would you like to upgrade your plan?')) {
                        router.push('/subscription');
                    }
                } else {
                    setErrorMessage(tokenData.message || 'An error occurred while checking tokens');
                }
                return;
            }
        } catch (error) {
            console.error('Error checking tokens:', error);
            setErrorMessage('An error occurred while checking tokens. Please try again.');
            return;
        }
        
        console.log("Upload state:", {
            usingProfilePhoto,
            userImageDataUrl: userImageDataUrl ? "exists" : "null",
            productImageUrl: productImageUrl ? "exists" : "null",
            uploadedFirebaseUrl1: uploadedFirebaseUrl1 ? "exists" : "null",
            uploadedFirebaseUrl2: uploadedFirebaseUrl2 ? "exists" : "null"
        });
        
        // Check if we have the necessary images
        if (!productImageUrl) {
            setErrorMessage("No product image available. Please select a product.");
            return;
        }
        
        if (!userImageDataUrl && !usingProfilePhoto) {
            setErrorMessage("Please upload your photo or use your profile photo.");
            return;
        }
        
        // Check if uploads are still in progress
        if (isUploading1 || isUploading2) {
            setErrorMessage("Please wait for uploads to complete");
            return;
        }

        // Start processing
        setProcessing(true);
        setResultImage(null);
        
        try {
            // Determine cloth_url (user's photo)
            let clothUrl;
            
            if (usingProfilePhoto) {
                console.log("Using profile photo:", profilePhoto);
                clothUrl = profilePhoto;
            } else if (uploadedFirebaseUrl1) {
                console.log("Using uploaded Firebase URL for user photo:", uploadedFirebaseUrl1);
                clothUrl = uploadedFirebaseUrl1;
            } else if (userImageDataUrl) {
                console.log("WARNING: Using image data URL directly instead of Firebase URL");
                clothUrl = userImageDataUrl;
            } else {
                throw new Error("No user image available. Please upload your photo or use your profile photo.");
            }

            // Prepare payload: product image as image_url, user photo as cloth_url
            const payload = {
                image_url: productImageUrl, // The product image
                cloth_url: clothUrl, // The user's photo
                type: "overall",
                use_profile_photo: usingProfilePhoto
            };
            
            console.log("Sending payload to API:", payload);
            
            // Call the AI try-on API
            const response = await fetch("https://035c-116-58-41-157.ngrok-free.app/run-inference", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log("API response data:", result);
                
                if (result.status === "success" && result.firebase_url) {
                    // Store the result image URL and navigate to result page with it
                    setResultImage(result.firebase_url);
                    localStorage.setItem('tryOnResultImage', result.firebase_url);
                    router.push('/clora_result');
                } else {
                    setErrorMessage("Try-on processing failed: " + (result.message || "Unknown error"));
                    setProcessing(false);
                }
            } else {
                const errorText = await response.text();
                console.error("API error response:", errorText);
                setErrorMessage("Failed to process try-on request: " + errorText);
                setProcessing(false);
            }
        } catch (err) {
            console.error("Try-on error:", err);
            setErrorMessage("An error occurred during processing: " + err.message);
            setProcessing(false);
        }
    };

    const handleDemoUpload = () => {
        setProcessing(true);
        
        // Simulate API call with a delay
        setTimeout(() => {
            const demoResultUrl = "https://storage.googleapis.com/vi-try.appspot.com/inference_results/d58e454f-5f25-4843-b2a5-960585d3ca94.jpg";
            localStorage.setItem('tryOnResultImage', demoResultUrl);
            router.push('/clora_result');
        }, 3000);
    };

    if (processing) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full">
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
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full space-y-4">
            {/* Hidden file inputs */}
            <input 
                type="file" 
                ref={fileInputRef1}
                accept="image/*" 
                onChange={handleUserImageUpload} 
                className="hidden"
            />
            <input 
                type="file" 
                ref={fileInputRef2}
                accept="image/*" 
                onChange={handleProductImageUpload} 
                className="hidden"
            />
            
            {/* Display error message if any */}
            {errorMessage && (
                <div className="w-full px-4 py-3 bg-red-500/30 backdrop-blur-sm rounded-xl mb-2 border border-red-500/30 text-white">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errorMessage}
                    </div>
                </div>
            )}

            {/* Upload progress indicators */}
            {(isUploading1 || isUploading2) && (
                <div className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl mb-2 border border-white/30">
                    <h3 className="text-white text-center font-medium mb-2">Uploading Images</h3>
                    
                    {isUploading1 && (
                        <div className="mb-2">
                            <p className="text-white text-xs mb-1">Your Photo: {uploadProgress1}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                                <div 
                                    className="bg-[#4B003B] h-1 rounded-full transition-all duration-300" 
                                    style={{ width: `${uploadProgress1}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                    
                    {isUploading2 && (
                        <div>
                            <p className="text-white text-xs mb-1">Product Image: {uploadProgress2}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                                <div 
                                    className="bg-[#4B003B] h-1 rounded-full transition-all duration-300" 
                                    style={{ width: `${uploadProgress2}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Profile Photo Section */}
            <div className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl mb-4 border border-white/30">
                <h3 className="text-white text-center font-medium mb-2">Your Profile Photo</h3>
                
                {profilePhoto ? (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white mb-2 bg-white/80">
                            <img 
                                src={profilePhoto} 
                                alt="Your profile" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <button
                            onClick={handleUseProfilePhoto}
                            className={`flex items-center px-4 py-2 ${usingProfilePhoto ? 'bg-[#4B003B] text-white' : 'bg-white text-[#4B003B]'} rounded-full hover:bg-[#4B003B]/80 hover:text-white transition-all duration-300 font-medium text-sm shadow-md`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            {usingProfilePhoto ? 'Using Profile Photo' : 'Use Your Profile Photo'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center text-white/80 text-sm">
                        <p>No profile photo available. Set one in your profile settings.</p>
                    </div>
                )}
            </div>
            
            {/* Upload preview section */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* User image section */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <h3 className="text-white text-center font-medium mb-3">Your Photo</h3>
                    
                    {userImageDataUrl || usingProfilePhoto ? (
                        <div className="relative bg-white p-2 rounded-lg shadow-md">
                            <img 
                                src={usingProfilePhoto ? profilePhoto : userImageDataUrl} 
                                alt="Your photo" 
                                className="w-full h-40 object-contain rounded"
                            />
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm font-medium text-gray-700">
                                    {usingProfilePhoto ? 'Profile Photo' : 'Uploaded Photo'}
                                </span>
                                <button 
                                    onClick={() => fileInputRef1.current.click()}
                                    className="text-[#4B003B] hover:text-[#4B003B]/70 text-xs font-medium"
                                >
                                    Change
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 bg-white/10 rounded-lg border-2 border-dashed border-white/30 hover:border-white/50 transition-all duration-300"
                            onClick={() => fileInputRef1.current.click()}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <p className="mt-2 text-sm text-white/80">Upload Your Photo</p>
                        </div>
                    )}
                </div>
                
                {/* Product image section */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <h3 className="text-white text-center font-medium mb-3">Product Image</h3>
                    
                    {productImageUrl ? (
                        <div className="relative bg-white p-2 rounded-lg shadow-md">
                            <img 
                                src={productImageUrl} 
                                alt="Product image" 
                                className="w-full h-40 object-contain rounded"
                            />
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm font-medium text-gray-700">
                                    {uploadedFirebaseUrl2 ? 'Custom Product' : 'Selected Product'}
                                </span>
                                <button 
                                    onClick={() => fileInputRef2.current.click()}
                                    className="text-[#4B003B] hover:text-[#4B003B]/70 text-xs font-medium"
                                >
                                    Change
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 bg-white/10 rounded-lg border-2 border-dashed border-white/30 hover:border-white/50 transition-all duration-300"
                            onClick={() => fileInputRef2.current.click()}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <p className="mt-2 text-sm text-white/80">Select Product Image</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Original upload containers (hidden if previews are shown) */}
            {!userImageDataUrl && !usingProfilePhoto && (
                <div className="mb-4 h-[30%] w-full">
                    <UploadContainer onFileUpload={handleDropZoneUpload}/>
                </div>
            )}
            
            {!productImageUrl && (
                <div className="mb-4 h-[30%] w-full">
                    <WebUploadContainer onFileUpload={handleWebImageUpload}/>
                </div>
            )}
            
            <MagneticButton 
                onClick={handleUpload}
                disabled={isUploading1 || isUploading2}
                className={`w-full py-3 bg-gradient-to-r from-[#4B003B] to-[#4B003B] text-white rounded-full hover:opacity-90 transition-colors duration-300 ${(isUploading1 || isUploading2) ? 'opacity-50' : ''}`}
            >
                <img src='/magic.svg' alt="Magic wand" className="inline-block mr-2 h-5 w-5" />
                {(isUploading1 || isUploading2) ? 'Uploading...' : 'Change Outfit'}
            </MagneticButton>
            
            {showMessage && (
            <div className="relative bg-green-500 text-white p-4 rounded-lg shadow-lg">
                Image uploaded to Firebase successfully!
            </div>)
            }
        </div>
    );
};

export default CloraUploadComponenet;