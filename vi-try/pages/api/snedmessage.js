import { connectMongoDB } from '@/config/mongodb';
import nodemailer from 'nodemailer';
import User from "@/models/user"; // Import the User model

export default async function handler(req, res) {
    try {
        if (req.method === 'POST') {
            if (req.headers['content-type'] !== 'application/json') {
                return res.status(400).json({ error: 'Content-Type must be application/json' });
            }

            const { name, email, message } = req.body;

            console.log('Received data:', { name, email, message });

            if (!name || !email || !message) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            await connectMongoDB();

            // Check if the email is already registered
            const existingUser = await User.findOne({ email });
            if (!existingUser) {
                return res.status(400).json({ error: 'Only registered users can send a message. Please ensure your email is registered with us.' });
            }

            // Send the message to your email
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL_USERNAME, // Your email address (sender)
                    pass: process.env.EMAIL_PASSWORD, // Your email password (app password or OAuth)
                },
            });

            const mailOptions = {
                from: email, // Sender's email (user's email)
                to: process.env.RECEIVER_EMAIL, // Your email address (where you want to receive the queries)
                subject: `New query from ${name} - ${email}`,
                text: `
                    You have received a new query from ${name} (${email}):
                    
                    Message:
                    ${message}
                `,
            };

            // Send the user's message to your email
            await transporter.sendMail(mailOptions);

            // Send the verification email (to the user)
            const verifyMailOptions = {
                from: process.env.EMAIL_USERNAME,
                to: email,
                subject: 'Verify your email address',
                text: `Thank you for reaching out! We have received your query, and our team will get back to you as soon as possible, typically within 2 to 3 working days. We appreciate your patience!
                `,
            };

            // Send the verification email
            await transporter.sendMail(verifyMailOptions);

            return res.status(200).json({ message: 'Your query has been sent, and a verification email has been sent to you.' });
        } else {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('Error occurred while sending email:', error);
        return res.status(500).json({ error: 'An error occurred. Please try again.' });
    }
}
