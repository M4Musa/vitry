import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { connectMongoDB } from '@/config/mongodb';
import User from '@/models/user';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'You must be logged in to update settings' });
    }

    const { type, value } = req.body;
    
    if (!type || value === undefined) {
      return res.status(400).json({ error: 'Type and value are required' });
    }

    // Validate notification type
    const validTypes = ['email', 'push', 'marketing'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid notification type' });
    }

    await connectMongoDB();
    
    // Update the user's notification settings
    const updateQuery = {};
    updateQuery[`settings.notifications.${type}`] = value;
    
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateQuery },
      { new: true, upsert: false }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ 
      message: 'Notification settings updated successfully',
      settings: user.settings 
    });

  } catch (error) {
    console.error('Error updating notification settings:', error);
    return res.status(500).json({ error: 'Failed to update notification settings' });
  }
} 