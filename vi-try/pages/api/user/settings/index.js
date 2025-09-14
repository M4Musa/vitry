import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { connectMongoDB } from '@/config/mongodb';
import User from '@/models/user';

// Default settings for new users
const defaultSettings = {
  notifications: {
    email: true,
    push: true,
    marketing: false,
  },
  privacy: {
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
  },
  language: 'English',
  currency: 'PKR',
  theme: 'light',
};

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'You must be logged in to access settings' });
    }

    await connectMongoDB();

    if (req.method === 'GET') {
      const user = await User.findOne({ email: session.user.email });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return user settings or default settings if none exist
      const settings = user.settings || defaultSettings;
      return res.status(200).json(settings);
    }

    if (req.method === 'PUT') {
      const settingsData = {
        notifications: {
          ...defaultSettings.notifications,
          ...req.body.notifications,
        },
        privacy: {
          ...defaultSettings.privacy,
          ...req.body.privacy,
        },
        language: req.body.language || defaultSettings.language,
        currency: req.body.currency || defaultSettings.currency,
        theme: req.body.theme || defaultSettings.theme,
      };

      const user = await User.findOneAndUpdate(
        { email: session.user.email },
        { $set: { settings: settingsData } },
        { new: true, upsert: false }
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(user.settings);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in settings API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
