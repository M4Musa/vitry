import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectMongoDB } from '@/config/mongodb';
import User from '@/models/user';
import Stripe from 'stripe';

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

    // Connect to the database using mongoose
    await connectMongoDB();
    
    // Get the user's subscription details
    const user = await User.findOne({ email: session.user.email });
    
    if (!user || !user.subscription || user.subscription.status !== 'active') {
      return res.status(400).json({ 
        error: 'No active subscription to cancel'
      });
    }
    
    // If there's a Stripe subscription ID, cancel it in Stripe too
    if (user.subscription.stripeSubscriptionId) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId);
      } catch (stripeError) {
        console.error('Error canceling Stripe subscription:', stripeError);
        // Continue with local cancellation even if Stripe cancellation fails
      }
    }
    
    // Update the user's subscription in the database
    await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        $set: { 
          "subscription.status": "canceled",
          "subscription.canceledAt": new Date()
        } 
      }
    );
    
    return res.status(200).json({ 
      success: true, 
      message: 'Your subscription has been successfully canceled.'
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to cancel subscription',
      message: error.message
    });
  }
}
