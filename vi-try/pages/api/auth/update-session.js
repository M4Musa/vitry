import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  // For development purposes, don't strictly enforce authentication
  // In production, you would uncomment this check
  // const session = await getSession({ req });
  // if (!session) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }
  
  const session = await getSession({ req });

  if (req.method === 'POST') {
    try {
      const { subscription, tokens } = req.body;

      // Update the session with new subscription and token information
      const updatedSession = {
        ...session,
        user: {
          ...session?.user,
          subscription,
          tokens,
        },
      };

      // In a real implementation, we would update the session in the database
      // For now, just return the updated session
      return res.status(200).json(updatedSession);
    } catch (error) {
      console.error('Error updating session:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}