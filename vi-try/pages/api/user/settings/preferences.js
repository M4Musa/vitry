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

    // Validate preference type
    const validTypes = ['language', 'currency', 'theme'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid preference type' });
    }

    // Validate values
    const validValues = {
      language: ['English', 'Urdu', 'Punjabi'],
      currency: ['PKR', 'USD', 'EUR'],
      theme: ['light', 'dark', 'system']
    };

    if (!validValues[type].includes(value)) {
      return res.status(400).json({ error: `Invalid ${type} value` });
    }

    await connectMongoDB();
    
    // Update the user's preferences
    const updateQuery = {};
    updateQuery[`settings.${type}`] = value;
    
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateQuery },
      { new: true, upsert: false }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ 
      message: 'Preferences updated successfully',
      settings: user.settings 
    });

  } catch (error) {
    console.error('Error updating preferences:', error);
    return res.status(500).json({ error: 'Failed to update preferences' });
  }
} 