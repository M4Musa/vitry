import { connectMongoDB } from '@/config/mongodb';
import User from "@/models/user";
import crypto from "crypto";
import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req, res) {
    try {
        if (req.method === 'POST') {
            
           
            if (req.headers['content-type'] !== 'application/json') {
                return res.status(400).json({ error: 'Content-Type must be application/json' });
            }

            const { token } = req.body;


            await connectMongoDB();

 
            const hashedToken = crypto.createHash("sha256").update(token).digest("hex");


           
            const user = await User.findOne({
                resetToken: hashedToken,
                resetTokenExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({ error: 'Invalid token or token has expired' });
            }

            
            return res.status(200).json({ user });

        } else {
           
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {

        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
