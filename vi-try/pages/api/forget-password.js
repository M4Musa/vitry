import { connectMongoDB } from '@/config/mongodb'; 
import User from "@/models/user"; 
import crypto from "crypto";
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';






export default async function handler(req, res) {
    try {
        if (req.method === 'POST') {
            
            if (req.headers['content-type'] !== 'application/json') {
                return res.status(400).json({ error: 'Content-Type must be application/json' });
            }

            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }

            // Connect to the database
            console.log("in api",email);
            await connectMongoDB();
            console.log("in api",email)

            // Check if the user exists
            const existingUser = await User.findOne({email});
            if (!existingUser) {
                return res.status(404).json({ error: 'User with this email does not exist' });
            }

            // If the user exists, we can proceed to the next steps like sending a reset email

            const resetToken = crypto.randomBytes(20).toString('hex');
            const passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');


            const passwordResetExpires = Date.now()+ 3600000000;

            existingUser.resetToken = passwordResetToken;
            existingUser.resetTokenExpires = passwordResetExpires;
            const resetUrl = `reset-password/${resetToken}`;

            console.log(resetUrl); 

            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            });


            const mailOptions = {
                from: process.env.EMAIL_USERNAME,
                to: email,
                subject: 'Password Reset Request',
                text: `You requested a password reset. Please use the following link to reset your password:: 
                ${process.env.NEXT_PUBLIC_BASE_URL}/${resetUrl}`,
            };

            await transporter.sendMail(mailOptions);


            await existingUser.save();
              console.log("saved");

            
              return res.status(200).json({ message: 'Verification email sent. Please check your inbox.' });
        } 
    } catch (error) {
        console.error('Error occurred while verifying email:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
