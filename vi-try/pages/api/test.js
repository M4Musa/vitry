import { connectMongoDB } from '@/config/mongodb'; 
import { storage } from '@/config/firebase';

export default async function handler(req, res) {
  try {
    await connectMongoDB();


    res.status(200).json({ message: 'Connected to both MongoDB and Firebase!', });
  } catch (error) {
    console.error('Error connecting to databases:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
