import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { connectMongoDB } from '@/config/mongodb';
import User from '@/models/user';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { storeImageInDatabase } from '@/utils/sessionImageStorage';
// Temporarily disable Firebase to avoid JWT signature issues
// TODO: Fix Firebase service account key and re-enable
let bucket = null;
let useFirebaseStorage = false;

console.log('ℹ️ Firebase temporarily disabled, using local storage for profile images');

// Uncomment below when Firebase credentials are fixed:
/*
try {
  const { getFirebaseStorage } = require('@/config/firebaseAdmin');
  bucket = getFirebaseStorage();
  useFirebaseStorage = true;
  console.log('✅ Firebase storage initialized successfully');
} catch (error) {
  console.warn('⚠️ Firebase storage not available, using local storage fallback:', error.message);
  useFirebaseStorage = false;
}
*/

// Configure body parser to handle both JSON and form data
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Set a larger size limit to handle base64 images
    },
  },
};

// Function to upload file to local storage (fallback)
async function uploadFileToLocal(file, filename) {
  try {
    console.log('Using local storage fallback for:', filename);
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profile_photos');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Copy file to uploads directory
    const sourcePath = file.filepath || file.path;
    const destinationPath = path.join(uploadsDir, filename);
    
    // Copy the file
    fs.copyFileSync(sourcePath, destinationPath);
    
    // Return the public URL
    const publicUrl = `/uploads/profile_photos/${filename}`;
    console.log('File saved locally:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('Error saving file locally:', error);
    throw new Error(`Local storage failed: ${error.message}`);
  }
}

// Function to upload file to Firebase Storage
async function uploadFileToFirebase(file, filename) {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting Firebase upload for:', filename);
      
      const fileBuffer = fs.readFileSync(file.filepath || file.path);
      console.log('File buffer size:', fileBuffer.length);
      
      // Create a reference to the file in Firebase Storage
      const fileRef = bucket.file(`profile_photos/${filename}`);
      
      // Create a write stream and upload the file
      const blobStream = fileRef.createWriteStream({
        metadata: {
          contentType: file.mimetype || file.type,
        },
        resumable: false, // For simplicity, disable resumable uploads
      });
      
      // Handle errors
      blobStream.on('error', (error) => {
        console.error('Firebase upload stream error:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          status: error.status
        });
        reject(new Error(`Firebase upload failed: ${error.message}`));
      });
      
      // Handle upload completion
      blobStream.on('finish', async () => {
        try {
          console.log('Upload completed, making file public...');
          
          // Make the file publicly accessible
          await fileRef.makePublic();
          
          // Get the public URL
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
          console.log('File made public, URL:', publicUrl);
          
          resolve(publicUrl);
        } catch (publicError) {
          console.error('Error making file public:', publicError);
          reject(new Error(`Failed to make file public: ${publicError.message}`));
        }
      });
      
      // End the stream with the file buffer
      blobStream.end(fileBuffer);
      
    } catch (error) {
      console.error('Error in uploadFileToFirebase:', error);
      reject(new Error(`Upload preparation failed: ${error.message}`));
    }
  });
}

// Handle JSON-based profile update (for base64 images)
async function handleJsonProfileUpdate(req, res, session) {
  try {
    const { name, phone, avatar } = req.body;
    
    console.log('Handling JSON profile update:', { hasName: !!name, hasPhone: !!phone, hasAvatar: !!avatar });
    
    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }
    
    await connectMongoDB();
    
    const updateData = {
      name: name.trim(),
      phone: phone ? phone.trim() : '',
    };
    
    // Handle avatar if provided
    if (avatar) {
      console.log('Processing avatar, size:', avatar.length);
      
      // Validate it's a proper base64 image
      if (!avatar.startsWith('data:image/')) {
        console.error('Invalid avatar format, does not start with data:image/');
        return res.status(400).json({ error: 'Invalid image format. Please select a valid image file.' });
      }
      
      // More lenient size check - allow up to 2MB for base64
      const estimatedSize = avatar.length * (3/4);
      if (estimatedSize > 2 * 1024 * 1024) { // 2MB limit
        console.error('Avatar too large:', estimatedSize);
        return res.status(400).json({ error: 'Image too large. Please use an image under 2MB.' });
      }
      
      // Try to save to local file system as well for better performance
      try {
        // Extract the base64 data and file extension
        const [header, base64Data] = avatar.split(';base64,');
        const mimeType = header.replace('data:', '');
        const extension = mimeType.split('/')[1] || 'jpg';
        
        // Create a unique filename
        const filename = `${uuidv4()}.${extension}`;
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profile_photos');
        
        // Ensure upload directory exists
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
          console.log('Created uploads directory:', uploadsDir);
        }
        
        // Save the file
        const filePath = path.join(uploadsDir, filename);
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filePath, buffer);
        
        // Use the local file URL instead of base64 for better performance
        const localUrl = `/uploads/profile_photos/${filename}`;
        updateData.avatar = localUrl;
        console.log('Avatar saved locally:', localUrl);
        
      } catch (localSaveError) {
        console.warn('Could not save avatar locally, using base64:', localSaveError.message);
        // Fallback to base64 if local save fails
        updateData.avatar = avatar;
      }
    }
    
    // Update the user profile in the database
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json({
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone || '',
      avatar: updatedUser.avatar || '/images/default-avatar.svg',
      joinDate: updatedUser.createdAt ? new Date(updatedUser.createdAt).toLocaleDateString() : 'N/A',
      tokens: updatedUser.tokens || 0,
      subscription: updatedUser.subscription,
    });
    
  } catch (error) {
    console.error('Error in JSON profile update:', error);
    return res.status(500).json({ error: 'Failed to update profile: ' + error.message });
  }
}

// Handle form data profile update (for file uploads)
async function handleFormDataProfileUpdate(req, res, session) {
  // We need to temporarily disable body parser for this specific case
  // This function will handle the old multipart form data approach
  return res.status(400).json({ 
    error: 'Form data uploads are currently disabled. Please use the base64 image upload method.' 
  });
}

export default async function handler(req, res) {
  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'You must be logged in to access this endpoint' });
    }

    // Handle GET request
    if (req.method === 'GET') {
      try {
        await connectMongoDB();
        
        const user = await User.findOne({ email: session.user.email });
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        return res.status(200).json({
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          avatar: user.avatar || '/images/default-avatar.svg',
          joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
          tokens: user.tokens || 0,
          subscription: user.subscription,
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ error: 'Failed to fetch user profile' });
      }
    }
    
    // Handle PUT request for profile updates
    if (req.method === 'PUT') {
      // Check if this is a JSON request (base64 image) or form data
      const contentType = req.headers['content-type'] || '';
      
      console.log('PUT request received, content-type:', contentType);
      console.log('Request body available:', !!req.body);
      console.log('Request body keys:', req.body ? Object.keys(req.body) : 'undefined');
      
      if (contentType.includes('application/json')) {
        // Handle JSON request with base64 image
        if (!req.body) {
          console.error('Request body is undefined for JSON request');
          return res.status(400).json({ error: 'Request body is missing or malformed' });
        }
        return await handleJsonProfileUpdate(req, res, session);
      } else {
        // Handle multipart form data - we need to parse it manually
        return await handleFormDataProfileUpdate(req, res, session);
      }
      }
    
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Unexpected error in profile API:', error);
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
} 