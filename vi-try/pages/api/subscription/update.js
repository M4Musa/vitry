import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  // For development purposes, don't strictly enforce authentication
  // In production, you would uncomment this check
  // const session = await getSession({ req });
  // if (!session) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  if (req.method === 'POST') {
    try {
      const { subscription } = req.body;

      // Validate subscription type
      const validSubscriptions = ['Basic', 'Standard', 'Premium', 'Expired', 'None'];
      if (!validSubscriptions.includes(subscription)) {
        return res.status(400).json({ error: 'Invalid subscription type' });
      }

      // Return tokens based on subscription
      let tokens = 0;
      
      switch(subscription) {
        case 'Premium':
          tokens = 1000;
          break;
        case 'Standard':
          tokens = 500;
          break;
        case 'Basic':
          tokens = 100;
          break;
        case 'Expired':
        case 'None':
          tokens = 0;
          break;
        default:
          tokens = 0;
      }

      return res.status(200).json({
        subscription,
        tokens,
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 