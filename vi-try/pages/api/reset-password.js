import { connectMongoDB } from '@/config/mongodb';
import User from "@/models/user";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { NextApiRequest, NextApiResponse } from 'next';
import { hasSubscribers } from 'diagnostics_channel';

// API handler
export default async function handler(req, res) {
    try {
        if (req.method === 'POST') {
            
            if (req.headers['content-type'] !== 'application/json') {
                return res.status(400).json({ error: 'Content-Type must be application/json' });
            }

            const { password,email } = req.body;


            await connectMongoDB();

                 
            const user = await User.findOne({email});

            const hashedPassword = await bcrypt.hash(password, 10);

            user.password= hashedPassword;
            user.resetToken= undefined;
            user.resetTokenExpires= undefined;

            try{
            await user.save();
            return res.status(200).json({ message: 'Pasword Changed successfully' });

            }
            catch(error){
                return res.status(400).json({ error: 'Error changing password' });
            }


        } else {
            // Method not allowed
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error occurred:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
