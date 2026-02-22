import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "No account found with this email." });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

        const emailUser = (process.env.EMAIL_USER || "").trim();
        const emailPass = (process.env.EMAIL_PASS || "").trim();

        console.log(`[Auth] Attempting SMTP send with ${emailUser}`);

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: emailUser,
                pass: emailPass
            },
            connectionTimeout: 20000,
            greetingTimeout: 20000,
            socketTimeout: 20000
        });

        const mailOptions = {
            from: `"BAGSUP" <${emailUser}>`,
            to: user.email,
            subject: 'Reset Your Password – BAGSUP',
            text: `Click the link below to reset your password:\n${resetUrl}\n\nThis link will expire in 15 minutes.`
        };

        const sendMailPromise = transporter.sendMail(mailOptions);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Email sending timed out after 20 seconds')), 20000)
        );

        await Promise.race([sendMailPromise, timeoutPromise]);
        
        res.json({ message: "Recovery link has been sent to your email." });
    } catch (err: any) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ error: "Failed to send recovery email. " + err.message });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const token = req.params.token as string;
        const { password } = req.body;

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset link." });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Your password has been reset successfully." });
    } catch (err: any) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ error: err.message });
    }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address provided.' });
        }

        // Domain DNS check for random emails
        try {
            const domain = email.split('@')[1];
            const mxRecords = await resolveMx(domain);
            if (!mxRecords || mxRecords.length === 0) {
                return res.status(400).json({ error: 'The email domain seems invalid. Please provide a real email address.' });
            }
        } catch (err) {
            return res.status(400).json({ error: 'The email domain seems invalid. Please provide a real email address.' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ error: 'User already exists with this email or username' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

        // Create user
        const newUser = new User({ 
            username: username.toLowerCase(), 
            email: email.toLowerCase(), 
            password: hashedPassword,
            verificationToken: hashedVerificationToken,
            isVerified: false
        });
        await newUser.save();

        // Send Verification Email
        const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
        const emailUser = (process.env.EMAIL_USER || "").trim();
        const emailPass = (process.env.EMAIL_PASS || "").trim();

        if (emailUser && emailPass) {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: { user: emailUser, pass: emailPass },
                connectionTimeout: 20000,
                greetingTimeout: 20000,
                socketTimeout: 20000
            });

            const mailOptions = {
                from: `"BAGSUP" <${emailUser}>`,
                to: newUser.email,
                subject: 'Verify Your Email – BAGSUP',
                text: `Welcome to BAGSUP! Click the link below to verify your account:\n${verifyUrl}`
            };

            try {
                const sendMailPromise = transporter.sendMail(mailOptions);
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Email sending timed out after 20 seconds')), 20000)
                );

                await Promise.race([sendMailPromise, timeoutPromise]);
            } catch (err: any) {
                console.error("Verification email failed:", err);
                await User.findByIdAndDelete(newUser._id);
                return res.status(500).json({ error: "Could not send verification email. Please try again later. " + err.message });
            }
        } else {
            console.warn("Email credentials not configured. Verification email not sent.");
        }

        res.status(201).json({ 
            message: 'User registered successfully. Please check your email to verify your account.'
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const hashedToken = crypto.createHash('sha256').update(token as string).digest('hex');

        const user = await User.findOne({ verificationToken: hashedToken });

        if (!user) {
            return res.status(400).json({ message: "Invalid verification link." });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.json({ message: "Email verified successfully. You can now log in." });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ 
            $or: [{ email: username.toLowerCase() }, { username: username.toLowerCase() }] 
        });
        
        if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });

        if (user.isVerified === false) {
            return res.status(403).json({ error: 'Please check your email and verify your account first.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        res.json({
            access: token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                full_name: user.full_name,
                age: user.age,
                gender: user.gender,
                dob: user.dob
            }
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const googleLogin = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID as string,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) return res.status(400).json({ error: 'Invalid Google token' });

        const { email, sub: googleId, name, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                username: name || email.split('@')[0],
                email,
                googleId,
                avatar: picture,
                full_name: name,
                isVerified: true
            });
            await user.save();
        } else if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }

        const jwtToken = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        res.json({
            access: jwtToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                full_name: user.full_name
            }
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getProfile = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateProfile = async (req: any, res: Response) => {
    try {
        const { full_name, age, gender, dob } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (full_name !== undefined) user.full_name = full_name;
        if (age !== undefined) user.age = Number(age);
        if (gender !== undefined) user.gender = gender;
        if (dob !== undefined) user.dob = dob;
        
        await user.save();
        res.json(user);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
