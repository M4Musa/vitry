import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { connectMongoDB } from '@/config/mongodb';
import User from '@/models/user';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if it hasn't been initialized yet
if (!admin.apps.length) {
  const serviceAccount = {
    "type": "service_account",
    "project_id": "vi-try",
    "private_key_id": "9979a9737b1b762d5bc6835969d2600c749ef1d8",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCkyNlAEGkaLMbu\nVm7VYjcpj0bpED4tjttZI8Jfbds5oHHXfF/6RHGdMLo9cj36rCEAhUrjn8j+YzJi\nDJmgGMY18gisETXukF2wk810eK4CIeitVvae+dNZwC6UJgDZCUZs5+rH55491B3L\nkF9Jh726rKfuPo1scgBlur99UteTBnd8nW9RWEM3chpgoK5yjenHrOHH97QOcWf0\nFMCKOflU2XMKOeJTZU90pyXQvhiSC0xKNudoivQPdqnQvH6TVqwdHx7RhbKaQ6H1\n9ncN0PJHPQwuldZUedwVka8Vu8vZoRiElPpMsjcTPlUO4DFWObJFYSzaTMl+RVJe\n1CEuMuC5AgMBAAECggEABKG9Ioz7iU/wJQeirKaKtqU3eOpbFxB8h6ZGysQlnPpu\nrMALGhelqmWR3JOLHLJNKKy2eMy3W3gqFMG2KT79Bkvn9L80mQCvk3yqEh+ow3hU\nyBeJTdlnmI6beJBTZoZZV4sSyTzwUJxXXI8RsJlLStWa0Eprkvxm2LUtt/31v4UL\n1oJ7rSbzhNoC1r/7UdUymWsDDLTSgo9MC+CeMiqbQaxQGCm5WitN3DHUvzK+dL0w\nOMcsccnkWglbS0+0HL4zC9oZ0pZsT1FD1u3xvdzPrXC8DLvj0sx/h92gURw62OBS\nUqHXH2l4jFplxPMd1JQjp1hKYvSzDdsjAkvnQBgHcQKBgQDTGqy+YoI99kX4CMjF\n38Bk1YYlZiEZ/tqLnf4uzxvTP04C61YjSqqcILLa/OkxVExYUfzc7wHsaTkXrb+6\nCZOjoPGNfV+lZPk2mqftBMRqtIHziXvDLxmcqg0DANuUbWEj7SS0+y3pNckc81XF\n3txfCHekHXYsQkN5VFCaZ+sY8QKBgQDH1FrNtzaC6Spe3O6aYGOZUtvjPv3zzLyg\n3h3sqiOG9Z/CiH9NuA2KNdurAgpZvMdz9zLwnT0QNLmo54ai8xetgTZrjge8VDfu\nkcLMa5skVL6+3+3kSXIy08+NNvgXKsWDO7aN3EPqG+6yVeOiYmbUZTQyxJLvOA4G\nxX4eFBUESQKBgBGT6ghcSX4BUKgrixQ24l1DDk106JKyjt4LRMv/ANEhN0y07dI4\neGZRrrLfVkd+PnEoOobm++EEjfVzyUAjZgC8+QAQDXPHKZ0rWYo52GUOLLfrnbuN\n43MREc5LNv1v8iO8rk7Hj3YYvWtEs8KrIOxk1xl6PonG5rlmlOOWfZPxAoGADnfQ\njz5povbQy4eBewnpjCtUolJoPqOfMKKEViNHaTkVdRc+6FigGlal7e664x5o7nuC\nY6tuxWKb4p/IvrmNCFHnp8fjxX3vgsVo7jYISIweN2GtLq8mpolxaI8HTV4aaNME\n96ZwAF4/XQgc8B/hxBUDv30+CjXrxg+8ft8DWokCgYEAltQSoB3I6J1SGjRsxvdU\nuG278Vn4Lgcv84MQiyjyxCStD1aqJH9XjBNjTT92eLl0AGRa2MtuxC4m3gzS33ce\nvUWstXFbjU6p85NPsmXfCVoI9o+sMzrl20vmNb+sBZpCgoKaAGT6E9tpJuDflLUz\nNqdoVLo/Oy2oq/+hLMpgoK0=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-z630y@vi-try.iam.gserviceaccount.com",
    "client_id": "101330092887679197657",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-z630y%40vi-try.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  };
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "vi-try.appspot.com"
  });
}

// Get a reference to the storage bucket
const bucket = admin.storage().bucket();

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Function to upload file to Firebase Storage
async function uploadFileToFirebase(file, filename) {
  return new Promise((resolve, reject) => {
    const fileBuffer = fs.readFileSync(file.filepath || file.path);
    
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
      console.error('Firebase upload error:', error);
      reject(error);
    });
    
    // Handle upload completion
    blobStream.on('finish', async () => {
      // Make the file publicly accessible
      await fileRef.makePublic();
      
      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
      resolve(publicUrl);
    });
    
    // End the stream with the file buffer
    blobStream.end(fileBuffer);
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
      // Create upload directory if it doesn't exist (still needed for temporary files)
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Using a simpler version of formidable parsing to avoid compatibility issues
      const form = new IncomingForm({ 
        uploadDir: uploadDir,
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024 // 5MB
      });

      try {
        const [fields, files] = await new Promise((resolve, reject) => {
          form.parse(req, (err, fields, files) => {
            if (err) {
              console.error('Formidable parse error:', err);
              reject(err);
            } else {
              console.log('Form parsed successfully');
              resolve([fields, files]);
            }
          });
        });
        
        console.log('Received fields:', JSON.stringify(fields));
        console.log('Received files keys:', Object.keys(files));
        
        await connectMongoDB();
        
        // Extract form field values, handling different formidable versions
        const getName = () => {
          if (fields.name) {
            return Array.isArray(fields.name) ? fields.name[0] : fields.name;
          }
          return '';
        };
        
        const getPhone = () => {
          if (fields.phone) {
            return Array.isArray(fields.phone) ? fields.phone[0] : fields.phone;
          }
          return '';
        };
        
        // Prepare update data
        const updateData = {
          name: getName(),
          phone: getPhone(),
        };
        
        // Validate that name is not empty
        if (!updateData.name) {
          return res.status(400).json({ error: 'Name cannot be empty' });
        }
        
        // Handle avatar upload if present
        if (files && files.avatar) {
          try {
            // Access the file (compatible with different formidable versions)
            const fileAvatar = Array.isArray(files.avatar) ? files.avatar[0] : files.avatar;
            
            // Log file details for debugging
            console.log('File avatar details:', {
              size: fileAvatar.size || 'unknown',
              type: fileAvatar.mimetype || fileAvatar.type || 'unknown',
              name: fileAvatar.originalFilename || fileAvatar.name || 'unknown',
              path: fileAvatar.filepath || fileAvatar.path || 'unknown'
            });
            
            // Get the file path (compatible with different formidable versions)
            const filePath = fileAvatar.filepath || fileAvatar.path;
            
            if (!filePath || !fs.existsSync(filePath)) {
              console.error('File path is invalid or does not exist:', filePath);
              return res.status(500).json({ error: 'Invalid file path' });
            }
            
            // Get original filename (compatible with different formidable versions)
            const originalName = fileAvatar.originalFilename || fileAvatar.name || 'upload.jpg';
            
            // Generate unique filename with proper extension
            const extension = path.extname(originalName) || '.jpg'; // Default to jpg if no extension
            const filename = `${uuidv4()}${extension}`;
            
            // Upload file to Firebase Storage
            const firebaseUrl = await uploadFileToFirebase(fileAvatar, filename);
            console.log('File uploaded to Firebase:', firebaseUrl);
            
            // Set the avatar URL to the Firebase Storage URL
            updateData.avatar = firebaseUrl;
            
            // Clean up the temp file if it still exists
            try {
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            } catch (unlinkError) {
              console.error('Error deleting temp file (non-critical):', unlinkError);
              // Continue anyway as this isn't critical
            }
            
          } catch (fileError) {
            console.error("File handling error:", fileError);
            return res.status(500).json({ error: 'Error processing image upload: ' + fileError.message });
          }
        } else {
          console.log('No avatar file uploaded');
        }
        
        console.log('Updating user with data:', updateData);
        
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
        console.error('Error in profile update:', error);
        return res.status(500).json({ error: 'Failed to update profile: ' + error.message });
      }
    }
    
    // Handle other HTTP methods
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Unexpected error in profile API:', error);
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
} 