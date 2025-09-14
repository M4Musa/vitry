import bcrypt from "bcryptjs";
import { connectMongoDB } from '@/config/mongodb'; 
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import User from "@/models/user"; // Import the User model

export default async function handler(req, res) {
    try {
        if (req.method === 'POST') {
            if (req.headers['content-type'] !== 'application/json') {
                return res.status(400).json({ error: 'Content-Type must be application/json' });
            }

            const { name, email, password } = req.body;

            console.log('Received data:', { name, email, password });

            if (!name || !email || !password) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            await connectMongoDB();

            // Check if the email is already registered
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email is already registered!' });
            }

            // Generate a verification token (expires in 1 hour)
            const token = jwt.sign({ name, email, password }, process.env.JWT_SECRET, { expiresIn: '1h' });

            const URL = `Verify-me/${token}`;

            // Send the verification email
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
                subject: 'Verify your email address',
                text: `Please verify your email by clicking the following link: 
                ${process.env.NEXT_PUBLIC_BASE_URL}/${URL}`,
            };

            await transporter.sendMail(mailOptions);

            return res.status(200).json({ message: 'Verification email sent. Please check your inbox.' });
        } else {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('Error occurred while registering:', error);
        return res.status(500).json({ error: 'An error occurred. Please try again.' });
    }
}
