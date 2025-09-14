import { buffer } from 'micro';
import Stripe from 'stripe';
import User from '@/models/user';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false, // Stripe requires raw body
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook Error:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const email = session.customer_email || session.customer_details?.email;
      const subscriptionId = session.subscription;

      if (!email) {
        console.error('Email not found in session');
        return res.status(400).send('Email not found');
      }

      // 🔹 Get Subscription Details
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const packageType = session.metadata?.packageType;
      const expiresAt = new Date(subscription.current_period_end * 1000);

      // ✅ Update user subscription in database
      await User.findOneAndUpdate(
        { email },
        {
          subscription: {
            package: packageType,
            status: 'active',
            expiresAt,
            stripeSessionId: session.id,
          },
        },
        { new: true }
      );

      console.log(`Subscription activated for ${email} until ${expiresAt}`);
      break;
    }

    case 'customer.subscription.deleted': {
      const deletedSubscription = event.data.object;
      const customerId = deletedSubscription.customer;

      // Retrieve customer details to get email
      const customer = await stripe.customers.retrieve(customerId);
      const email = customer.email;

      if (!email) {
        console.error('Email not found for canceled subscription');
        return res.status(400).send('Email not found');
      }

      // ❌ Reset the subscription object
      await User.findOneAndUpdate(
        { email },
        {
          subscription: {
            package: null,
            status: 'inactive',
            expiresAt: null,
            stripeSessionId: null,
          },
        },
        { new: true }
      );

      console.log(`Subscription canceled for ${email}`);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      // Retrieve customer details to get email
      const customer = await stripe.customers.retrieve(customerId);
      const email = customer.email;

      if (!email) {
        console.error('Email not found for subscription update');
        return res.status(400).send('Email not found');
      }

      // If subscription is expired (status = "canceled"), reset the subscription object
      if (subscription.status === 'canceled') {
        await User.findOneAndUpdate(
          { email },
          {
            subscription: {
              package: null,
              status: 'inactive',
              expiresAt: null,
              stripeSessionId: null,
            },
          },
          { new: true }
        );

        console.log(`Subscription expired for ${email}`);
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}
