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

    // Validate privacy type
    const validTypes = ['profileVisibility', 'showEmail', 'showPhone'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid privacy type' });
    }

    // Validate value for profileVisibility
    if (type === 'profileVisibility') {
      const validValues = ['public', 'private', 'friends'];
      if (!validValues.includes(value)) {
        return res.status(400).json({ error: 'Invalid visibility value' });
      }
    }

    await connectMongoDB();
    
    // Update the user's privacy settings
    const updateQuery = {};
    updateQuery[`settings.privacy.${type}`] = value;
    
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateQuery },
      { new: true, upsert: false }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ 
      message: 'Privacy settings updated successfully',
      settings: user.settings 
    });

  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return res.status(500).json({ error: 'Failed to update privacy settings' });
  }
}
