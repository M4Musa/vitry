import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
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

    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing Stripe session ID' 
      });
    }

    console.log(`Processing payment verification for session: ${sessionId}`);

    try {
      // Initialize Stripe
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      
      // Verify the payment with Stripe
      const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
      
      console.log(`Stripe session retrieved: ${sessionId}, payment status: ${stripeSession.payment_status}`);
      
      // Check if the payment was successful
      const wasSuccessful = stripeSession.payment_status === 'paid';
      
      if (wasSuccessful) {
        // Connect to the database
        await connectMongoDB();
        
        // Get the user's current subscription data
        const user = await User.findOne({ email: session.user.email });
        
        console.log(`User found: ${user ? 'yes' : 'no'}, email: ${session.user.email}`);
        
        // Get the selected plan from metadata (stored when creating checkout session)
        const packageType = stripeSession.metadata?.packageType || 
                            user?.subscription?.pendingPackage || 
                            "Pro";
        
        console.log(`Activating subscription: ${packageType} for user: ${session.user.email}`);
        
        // Set an expiry date (e.g., 30 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        
        // Set token amount based on subscription plan
        let tokenAmount = 0;
        switch(packageType) {
          case 'Basic':
            tokenAmount = 5;
            break;
          case 'Pro':
            tokenAmount = 200;
            break;
          case 'Enterprise':
            tokenAmount = -1; // -1 indicates unlimited tokens
            break;
          default:
            tokenAmount = 0;
        }
        
        // Update the user's subscription in the database
        const updatedUser = await User.findOneAndUpdate(
          { email: session.user.email },
          { 
            $set: { 
              subscription: {
                package: packageType,
                status: 'active',
                expiresAt: expiresAt,
                stripeCustomerId: stripeSession.customer,
                stripeSubscriptionId: stripeSession.subscription,
                activatedAt: new Date()
              },
              tokens: tokenAmount
            },
            $unset: {
              'subscription.pendingSessionId': "",
              'subscription.pendingPackage': ""
            }
          },
          { new: true }
        );
        
        console.log(`Subscription activated successfully for user: ${session.user.email}`);
        
        return res.status(200).json({ 
          success: true, 
          subscription: updatedUser.subscription
        });
      } else {
        console.log(`Payment unsuccessful for session: ${sessionId}, status: ${stripeSession.payment_status}`);
        
        return res.status(400).json({ 
          success: false, 
          error: 'Payment was not successful',
          status: stripeSession.payment_status
        });
      }
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      return res.status(500).json({
        success: false,
        error: 'Error communicating with Stripe',
        message: stripeError.message
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message
    });
  }
} 