import { getSession } from 'next-auth/react';
import { connectMongoDB } from '@/config/mongodb';
import User from '@/models/user';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  await connectMongoDB();
  const session = await getSession({ req });

  if (!session || !session.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  console.log(user, user.subscription);
  res.status(200).json({ subscription: user.subscription });
}
