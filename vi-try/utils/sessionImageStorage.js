// Session-based image storage utility for Vercel deployment
// This converts images to base64 and stores them in the database/session

import { connectMongoDB } from '@/config/mongodb';
import User from '@/models/user';

/**
 * Convert image file to base64 data URL
 * @param {File} file - The image file object
 * @returns {Promise<string>} Base64 data URL
 */
export async function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result;
      
      // Validate it's a proper data URL
      if (!result || !result.startsWith('data:image/')) {
        reject(new Error('Invalid image format'));
        return;
      }
      
      // Check file size (limit to 1MB for session storage)
      const base64Size = result.length * (3/4); // Rough base64 size calculation
      if (base64Size > 1024 * 1024) { // 1MB limit
        reject(new Error('Image too large. Please use an image under 1MB.'));
        return;
      }
      
      resolve(result);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Store image as base64 in user's database record
 * @param {string} userEmail - User's email
 * @param {string} base64Image - Base64 image data URL
 * @returns {Promise<string>} The stored image data URL
 */
export async function storeImageInDatabase(userEmail, base64Image) {
  try {
    await connectMongoDB();
    
    const updatedUser = await User.findOneAndUpdate(
      { email: userEmail },
      { $set: { avatar: base64Image } },
      { new: true }
    );
    
    if (!updatedUser) {
      throw new Error('User not found');
    }
    
    console.log('✅ Image stored in database successfully');
    return base64Image;
    
  } catch (error) {
    console.error('❌ Error storing image in database:', error);
    throw new Error(`Failed to store image: ${error.message}`);
  }
}

/**
 * Resize image before converting to base64 to reduce size
 * @param {File} file - The image file
 * @param {number} maxWidth - Maximum width (default: 400)
 * @param {number} maxHeight - Maximum height (default: 400)
 * @param {number} quality - JPEG quality 0-1 (default: 0.8)
 * @returns {Promise<string>} Resized base64 image
 */
export async function resizeAndConvertImage(file, maxWidth = 400, maxHeight = 400, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 with compression
      const compressedDataURL = canvas.toDataURL('image/jpeg', quality);
      
      // Check final size
      const finalSize = compressedDataURL.length * (3/4);
      if (finalSize > 1024 * 1024) { // Still too large
        reject(new Error('Image is still too large after compression. Please use a smaller image.'));
        return;
      }
      
      resolve(compressedDataURL);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for resizing'));
    };
    
    // Create object URL for the image
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Check if a string is a valid base64 image data URL
 * @param {string} str - String to check
 * @returns {boolean} True if valid base64 image
 */
export function isValidBase64Image(str) {
  if (!str || typeof str !== 'string') return false;
  
  // Check if it's a data URL for an image
  const dataUrlPattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  return dataUrlPattern.test(str);
}

/**
 * Get image size from base64 data URL
 * @param {string} base64Image - Base64 data URL
 * @returns {number} Size in bytes (approximate)
 */
export function getBase64ImageSize(base64Image) {
  if (!isValidBase64Image(base64Image)) return 0;
  
  // Remove data URL prefix and calculate size
  const base64Data = base64Image.split(',')[1];
  return Math.round(base64Data.length * (3/4));
}

export default {
  convertImageToBase64,
  storeImageInDatabase,
  resizeAndConvertImage,
  isValidBase64Image,
  getBase64ImageSize
};