import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';  // Make sure to import bcryptjs
import { connectMongoDB } from '@/config/mongodb'; 
import User from "@/models/user";

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            const { token} = req.query;  // Extract token and password from query parameters
            console.log("inside api", token);

            if (!token) {
                return res.status(400).json({ error: 'Token is required' });
            }

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded) {
                return res.status(400).json({ error: 'Invalid or expired token' });
            }

            await connectMongoDB();

            const { name, email,password } = decoded;  // Get user info from token

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email is already registered!' });
            }


            const hashedPassword = await bcrypt.hash(password, 10);

            console.log(name, email,password,hashedPassword);
            await User.create({
                name,
                email,
                avatar: '/images/default-avatar.svg',
                phone: '',
                password: hashedPassword,
                isVerified: true 
            });

            return res.status(200).json({ message: 'Email verified and user registered successfully!' });
        } else {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('Error occurred during verification:', error);
        return res.status(500).json({ error: 'Request Timeout' });
    }
}
