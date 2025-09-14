import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Camera, Edit2, CheckCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '/images/default-avatar.svg',
    joinDate: '',
    subscription: '',
    tokens: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: '',
    phone: '',
    avatar: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Listen for route changes to refresh data when returning to profile page
  useEffect(() => {
    const handleRouteChange = (url) => {
      // If we're returning to profile page from subscription page
      if (url.includes('/profile') && router.asPath.includes('/subscription')) {
        // Force session refresh and refetch user data
        updateSession();
        setTimeout(() => fetchUserData(), 500);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  useEffect(() => {
    // Don't redirect, but still fetch data if authenticated
    if (status === 'authenticated' && session?.user) {
      fetchUserData();
    } else if (status === 'unauthenticated') {
      // Just load default data for non-authenticated users
      const defaultData = {
        name: 'Guest User',
        email: 'user@example.com',
        phone: '+92 XXX XXXXXXX',
        avatar: '/images/default-avatar.svg',
        joinDate: 'January 2024',
        subscription: 'None',
        tokens: 0,
      };
      setUserData(defaultData);
      setEditedData({
        name: defaultData.name,
        phone: defaultData.phone,
        avatar: null,
      });
      setLoading(false);
    }
  }, [status, session]);

  // Add a specific effect to update subscription data when session changes
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Fetch fresh user data when session.user.subscription changes
      fetchUserData();
    }
  }, [session?.user?.subscription, status]);

  // Force reload session data when this component mounts
  useEffect(() => {
    if (status === 'authenticated') {
      updateSession();
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/user/profile');
      if (response.data) {
        console.log('Profile data from API:', response.data);
        
        setUserData({
          ...response.data,
          // No need to override subscription as it should now come from the database
        });
        setEditedData({
          name: response.data.name,
          phone: response.data.phone,
          avatar: null,
        });
        setLoading(false);
        setError(null);
        // Reset image preview when loading new data
        setImagePreview(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Set default data instead of showing error
      const defaultData = {
        name: session?.user?.name || 'User',
        email: session?.user?.email || 'user@example.com',
        phone: '+92 XXX XXXXXXX',
        avatar: '/images/default-avatar.svg',
        joinDate: 'January 2024',
        subscription: session?.user?.subscription || 'None',
        tokens: 100,
      };
      setUserData(defaultData);
      setEditedData({
        name: defaultData.name,
        phone: defaultData.phone,
        avatar: null,
      });
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedData.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    
    try {
      setUploadingImage(true);
      
      // Prepare JSON payload
      const updateData = {
        name: editedData.name.trim(),
        phone: editedData.phone && editedData.phone.trim() ? editedData.phone.trim() : ''
      };
      
      // Handle avatar file if present - convert to base64
      if (editedData.avatar) {
        console.log('Processing avatar for upload:', {
          name: editedData.avatar.name,
          type: editedData.avatar.type,
          size: editedData.avatar.size
        });
        
        // Validate file type again just to be sure
        if (!editedData.avatar.type.startsWith('image/')) {
          toast.error('Please select a valid image file');
          setUploadingImage(false);
          return;
        }
        
        // Validate file size (2MB limit for base64)
        if (editedData.avatar.size > 2 * 1024 * 1024) {
          toast.error('Image is too large. Please select an image under 2MB');
          setUploadingImage(false);
          return;
        }
        
        // Convert file to base64
        try {
          const base64String = await convertFileToBase64(editedData.avatar);
          updateData.avatar = base64String;
        } catch (conversionError) {
          console.error('Error converting image to base64:', conversionError);
          toast.error('Failed to process image. Please try again.');
          setUploadingImage(false);
          return;
        }
      }
      
      console.log('Sending update data (without full base64):', {
        name: updateData.name,
        phone: updateData.phone,
        hasAvatar: !!updateData.avatar
      });
      
      toast.loading('Updating profile...', { id: 'profile-update' });
      
      const response = await axios.put('/api/user/profile', updateData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      toast.dismiss('profile-update');
      
      if (response.data) {
        console.log('Profile updated successfully:', response.data);
        
        // Don't override subscription from database
        setUserData({
          ...response.data,
        });
        setIsEditing(false);
        setError(null);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Show success message
        toast.success('Profile updated successfully');
        
        // Update session to reflect changes
        updateSession();
      }
    } catch (error) {
      toast.dismiss('profile-update');
      console.error('Error updating profile:', error);
      console.error('Full error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      setError(errorMessage);
      // Show error toast
      toast.error(errorMessage);
    } finally {
      setUploadingImage(false);
      setImagePreview(null);
    }
  };

  const handleCancel = () => {
    setEditedData({
      name: userData.name,
      phone: userData.phone,
      avatar: null,
    });
    setIsEditing(false);
    setImagePreview(null);
  };

  // Helper function to convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      console.log('File selected:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Check file size (increased to 2MB to match API)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image is too large. Please select an image under 2MB.');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file.');
        return;
      }
      
      // Check for supported formats
      const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!supportedFormats.includes(file.type.toLowerCase())) {
        toast.error('Please select a JPEG, PNG, WebP, or GIF image.');
        return;
      }
      
      setEditedData({
        ...editedData,
        avatar: file
      });
      
      // Create a preview URL with better error handling
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('Image preview created successfully');
        setImagePreview(reader.result);
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        toast.error('Error reading file. Please try another image.');
        setImagePreview(null);
        setEditedData({
          ...editedData,
          avatar: null
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Simple function to get subscription display text
  const getSubscriptionDisplay = () => {
    // First check if we have subscription data from the database in userData
    if (userData.subscription) {
      // Handle subscription as an object from database
      if (typeof userData.subscription === 'object') {
        // If it has a package property and is active, show the package type
        if (userData.subscription.package && userData.subscription.status === 'active') {
          return `${userData.subscription.package} (Active)`;
        } 
        // Otherwise show the status
        else if (userData.subscription.status) {
          return userData.subscription.status.charAt(0).toUpperCase() + userData.subscription.status.slice(1);
        }
      }
      
      // Handle subscription as a string
      if (typeof userData.subscription === 'string') {
        return userData.subscription;
      }
    }
    
    // Fallback to session data if available
    if (session?.user?.subscription) {
      // Handle session subscription as an object
      if (typeof session.user.subscription === 'object') {
        if (session.user.subscription.package && session.user.subscription.status === 'active') {
          return `${session.user.subscription.package} (Active)`;
        } else {
          return session.user.subscription.status || 'None';
        }
      }
      
      // Handle subscription as a string in session
      if (typeof session.user.subscription === 'string') {
        return session.user.subscription;
      }
    }
    
    // If nothing is available, show None
    return 'None';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-red-500">{error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow relative overflow-y-auto">
        <div className="absolute inset-0 z-0">
          <Image
            src="/neon-back.jpg"
            alt="Background"
            layout="fill"
            objectFit="cover"
            quality={100}
            className="opacity-80" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 shadow-xl max-w-4xl mx-auto border border-white border-opacity-30">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Profile Image Section */}
              <div className="relative w-40 h-40 group">
                <div className="absolute inset-0 rounded-full shadow-2xl"></div>
                <Image
                  src={imagePreview || userData.avatar}
                  alt="Profile"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full border-4 border-white border-opacity-30"
                  unoptimized={!!imagePreview} // Disable optimization for preview images
                />
                
                {isEditing && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={triggerFileInput}
                  >
                    <Camera className="w-10 h-10 text-white" />
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                )}
                
                {isEditing && (
                  <div className="absolute -bottom-1 -right-1 bg-[#4B003B] p-2 rounded-full shadow-lg cursor-pointer hover:bg-[#9b0079] transition-colors"
                    onClick={triggerFileInput}
                  >
                    <Edit2 className="w-4 h-4 text-white" />
                  </div>
                )}
                
                {uploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-full">
                    <div className="w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Profile Information */}
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 mb-8">
                  <h1 className="text-3xl font-bold text-white tracking-wide">My Profile</h1>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <button
                        onClick={handleEdit}
                        className="bg-[#4B003B] text-white px-5 py-2.5 rounded-xl hover:bg-[#9b0079] transition-colors font-medium shadow-md flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" /> Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleSave}
                          className="bg-[#4B003B] text-white px-5 py-2.5 rounded-xl hover:bg-[#9b0079] transition-colors font-medium shadow-md flex items-center gap-2"
                          disabled={uploadingImage}
                        >
                          {uploadingImage ? (
                            <>
                              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" /> Save
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-gray-600 bg-opacity-70 text-white px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors font-medium shadow-md flex items-center gap-2"
                          disabled={uploadingImage}
                        >
                          <X className="w-4 h-4" /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-black bg-opacity-30 p-5 rounded-xl border border-white border-opacity-10 shadow-lg transform transition-transform hover:scale-[1.02]">
                    <label className="block text-xs font-semibold text-white mb-2 tracking-wide uppercase opacity-80">Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.name}
                        onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                        className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-[#4B003B] focus:border-transparent text-white placeholder-white placeholder-opacity-50 text-lg"
                      />
                    ) : (
                      <p className="text-xl text-white font-medium">{userData.name}</p>
                    )}
                  </div>

                  <div className="bg-black bg-opacity-30 p-5 rounded-xl border border-white border-opacity-10 shadow-lg transform transition-transform hover:scale-[1.02]">
                    <label className="block text-xs font-semibold text-white mb-2 tracking-wide uppercase opacity-80">Email</label>
                    <p className="text-xl text-white font-medium">{userData.email}</p>
                  </div>

                  <div className="bg-black bg-opacity-30 p-5 rounded-xl border border-white border-opacity-10 shadow-lg transform transition-transform hover:scale-[1.02]">
                    <label className="block text-xs font-semibold text-white mb-2 tracking-wide uppercase opacity-80">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedData.phone}
                        onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                        className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-[#4B003B] focus:border-transparent text-white placeholder-white placeholder-opacity-50 text-lg"
                      />
                    ) : (
                      <p className="text-xl text-white font-medium">{userData.phone || 'Not provided'}</p>
                    )}
                  </div>

                  <div className="bg-black bg-opacity-30 p-5 rounded-xl border border-white border-opacity-10 shadow-lg transform transition-transform hover:scale-[1.02]">
                    <label className="block text-xs font-semibold text-white mb-2 tracking-wide uppercase opacity-80">Subscription</label>
                    <p className="text-xl text-white font-medium">{getSubscriptionDisplay()}</p>
                    {userData.subscription && userData.subscription.expiresAt && (
                      <p className="text-sm text-white opacity-90 mt-2 font-medium bg-[#4B003B] inline-block px-3 py-1 rounded-lg">
                        Expires: {new Date(userData.subscription.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="bg-black bg-opacity-30 p-5 rounded-xl border border-white border-opacity-10 shadow-lg transform transition-transform hover:scale-[1.02]">
                    <label className="block text-xs font-semibold text-white mb-2 tracking-wide uppercase opacity-80">Tokens</label>
                    <p className="text-xl text-white font-medium">
                      {userData.subscription?.package === 'Enterprise' ? 'Unlimited' : userData.tokens}
                    </p>
                  </div>

                  <div className="bg-black bg-opacity-30 p-5 rounded-xl border border-white border-opacity-10 shadow-lg transform transition-transform hover:scale-[1.02]">
                    <label className="block text-xs font-semibold text-white mb-2 tracking-wide uppercase opacity-80">Joined On</label>
                    <p className="text-xl text-white font-medium">{userData.joinDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage; 