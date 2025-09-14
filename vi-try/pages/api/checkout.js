import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import Stripe from 'stripe';
import { connectMongoDB } from '@/config/mongodb';
import User from '@/models/user';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the user session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized - You must be logged in' });
    }
    
    const { packageType } = req.body;
    
    if (!packageType) {
      return res.status(400).json({ error: 'Package type is required' });
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Create product and price if needed
    let priceId;
    try {
      // Try to find existing price based on product name
      const prices = await stripe.prices.list({
        lookup_keys: [packageType],
        active: true,
        limit: 1
      });

      if (prices.data.length > 0) {
        priceId = prices.data[0].id;
      } else {
        // Create a new product
        const product = await stripe.products.create({
          name: `${packageType} Plan`,
          description: `${packageType} subscription plan`
        });

        // Set price based on package type
        let amount;
        switch(packageType) {
          case 'Basic':
            amount = 999; // $9.99
            break;
          case 'Pro':
            amount = 1999; // $19.99
            break;
          case 'Enterprise':
            amount = 4999; // $49.99
            break;
          default:
            amount = 1999; // Default to Pro price
        }

        // Create a price for the product
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: amount,
          currency: 'usd',
          recurring: {
            interval: 'month'
          },
          lookup_key: packageType
        });

        priceId = price.id;
      }
    } catch (error) {
      console.error('Error creating Stripe product/price:', error);
      return res.status(500).json({ error: 'Failed to create price in Stripe' });
    }
    
    // Create a checkout session with Stripe
    try {
      // Determine the base URL - use Vercel URL in production, fallback to NEXTAUTH_URL
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : (process.env.NEXTAUTH_URL || 'http://localhost:3000');
      
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${baseUrl}/subscription?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/subscription?canceled=true`,
        customer_email: session.user.email,
        metadata: {
          packageType: packageType,
          userId: session.user.id || session.user.email
        }
      });

      // Connect to database
      await connectMongoDB();
      
      // Store the Stripe session ID in the user's record
      // BUT don't activate the subscription yet - that happens in verify-payment
      await User.findOneAndUpdate(
        { email: session.user.email },
        {
          $set: { 
            'subscription.pendingSessionId': stripeSession.id,
            'subscription.pendingPackage': packageType
          }
        }
      );

      return res.status(200).json({ url: stripeSession.url });
    } catch (stripeError) {
      console.error('Stripe checkout error:', stripeError);
      return res.status(400).json({ 
        error: `Stripe error: ${stripeError.message}` 
      });
    }
  } catch (error) {
    console.error('Checkout Error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
