import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectMongoDB } from '@/config/mongodb';
import User from '@/models/user';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await connectMongoDB();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check subscription status
    if (!user.subscription || user.subscription.status !== 'active') {
      return res.status(403).json({ 
        error: 'No active subscription',
        message: 'Please subscribe to a plan to use try-on features'
      });
    }

    // Check if user has unlimited tokens (Enterprise plan)
    if (user.subscription.package === 'Enterprise') {
      return res.status(200).json({ 
        canTryOn: true,
        tokens: 'unlimited',
        message: 'Enterprise plan has unlimited tokens'
      });
    }

    // Check if user has enough tokens
    if (user.tokens <= 0) {
      return res.status(403).json({ 
        error: 'Insufficient tokens',
        message: 'You have run out of tokens. Please upgrade your plan or wait for token refresh.'
      });
    }

    // Deduct one token
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $inc: { tokens: -1 } },
      { new: true }
    );

    return res.status(200).json({ 
      canTryOn: true,
      tokens: updatedUser.tokens,
      message: 'Token deducted successfully'
    });

  } catch (error) {
    console.error('Error checking tokens:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 