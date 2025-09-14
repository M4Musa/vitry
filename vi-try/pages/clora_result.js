import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CloraResultPage = () => {
  const router = useRouter();
  const [resultImage, setResultImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Get the result image URL from localStorage
    const savedResultImage = localStorage.getItem('tryOnResultImage');
    if (savedResultImage) {
      setResultImage(savedResultImage);
    }
    setIsLoading(false);
  }, []);

  const handleBackToClora = () => {
    router.push('/clora');
  };

  const handleShareResult = async () => {
    if (!resultImage) return;
    
    setIsSharing(true);
    
    try {
      // Try to use the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'My Virtual Try-On',
          text: 'Check out my virtual try-on created with CLORA!',
          url: resultImage
        });
        toast.success('Shared successfully!');
      } else {
        // Fallback to copy to clipboard
        await navigator.clipboard.writeText(resultImage);
        setCopiedLink(true);
        toast.success('Image link copied to clipboard!');
        
        // Reset the copied state after 3 seconds
        setTimeout(() => {
          setCopiedLink(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!resultImage) return;
    
    setIsDownloading(true);
    
    try {
      // Fetch the image to convert it to a blob
      const response = await fetch(resultImage);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a temporary link element
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'clora-result.jpg';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download. Please try again.');
      
      // Fallback to the simpler method if the fetch fails
      const a = document.createElement('a');
      a.href = resultImage;
      a.download = 'clora-result.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setIsDownloading(false);
    }
  };

  // Function to open image in new tab for users who may have download issues
  const handleOpenInNewTab = () => {
    if (!resultImage) return;
    window.open(resultImage, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-600">Loading result...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar className="h-16" />
      <ToastContainer position="top-center" autoClose={3000} />
      <main className="flex-grow relative overflow-y-auto">
        <div className="absolute inset-0 z-0">
          <Image
            src="/neon-back.jpg"
            alt="Background"
            layout="fill"
            objectFit="cover"
            quality={100}
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-8 h-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white bg-opacity-80 backdrop-blur-sm rounded-3xl p-6 shadow-lg max-w-5xl mx-auto"
          >
            <h1 className="text-4xl font-bold text-[#4B003B] mb-6 text-center">
              Your <span className="font-extrabold">CLORA</span> Result
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gradient-to-br from-[#4B003B]/5 to-purple-900/5 rounded-xl shadow-md p-4 flex flex-col items-center">
                <h3 className="text-lg font-semibold text-[#4B003B] mb-4">Virtual Try-On Result</h3>
                <div className="relative w-full h-96 mb-4 group">
                  {resultImage ? (
                    <>
                      <img
                        src={resultImage}
                        alt="Try-on result"
                        className="w-full h-full object-contain rounded-lg border-2 border-[#4B003B]/20"
                      />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-3">
                          <button 
                            onClick={handleDownloadImage}
                            className="bg-white text-[#4B003B] p-2 rounded-full"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                          </button>
                          <button 
                            onClick={handleShareResult}
                            className="bg-white text-[#4B003B] p-2 rounded-full"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                      <p className="text-gray-500">No result available</p>
                    </div>
                  )}
                </div>
                {resultImage && (
                  <p className="text-sm text-gray-600 italic">Hover over image to see quick actions</p>
                )}
              </div>

              <div className="flex flex-col justify-between">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-[#4B003B] mb-4">About Your Virtual Try-On</h3>
                  <p className="text-gray-700 mb-4">
                    Your virtual try-on has been successfully created! This image shows how the selected garment would look on you.
                  </p>
                  <ul className="space-y-2 text-gray-700 mb-6">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      AI-powered clothing transformation
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Realistic fabric draping and shadows
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Natural color matching and blending
                    </li>
                  </ul>
                </div>
                
                <div className="flex flex-col space-y-4 mt-4">
                  <button 
                    onClick={handleDownloadImage}
                    className="bg-[#4B003B] text-white py-3 px-6 rounded-full font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center"
                    disabled={!resultImage || isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Download Image
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={handleShareResult}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-full font-medium hover:from-blue-600 hover:to-indigo-700 transition-colors flex items-center justify-center"
                    disabled={isSharing}
                  >
                    {isSharing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sharing...
                      </>
                    ) : copiedLink ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Link Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                        </svg>
                        Share Result
                      </>
                    )}
                  </button>
                  
                  {resultImage && (
                    <button 
                      onClick={handleOpenInNewTab}
                      className="border border-gray-300 bg-white text-gray-700 py-2 px-4 rounded-full font-medium hover:bg-gray-50 transition-colors flex items-center justify-center text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                      </svg>
                      Open in New Tab
                    </button>
                  )}
                  
                  <button 
                    onClick={handleBackToClora}
                    className="border-2 border-[#4B003B] text-[#4B003B] py-3 px-6 rounded-full font-medium hover:bg-[#4B003B] hover:text-white transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
                    </svg>
                    Try Another Look
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer className="mt-auto" />
    </div>
  );
};

export default CloraResultPage; 