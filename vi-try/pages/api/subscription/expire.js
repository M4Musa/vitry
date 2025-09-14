import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectMongoDB } from '@/config/mongodb';
import User from '@/models/user';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the user session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Connect to the database
    await connectMongoDB();
    
    // Update the user's subscription in the database
    const result = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        $set: { 
          "subscription.status": "expired"
        } 
      },
      { new: true }
    );
    
    // Check if the update was successful
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      subscription: result.subscription
    });
  } catch (error) {
    console.error('Error updating expired subscription:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
} 