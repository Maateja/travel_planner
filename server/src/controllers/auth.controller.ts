import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dns from 'dns';
import { promisify } from 'util';
import axios from 'axios';

const resolveMx = promisify(dns.resolveMx);

async function sendMailWithFallback(emailUser: string, emailPass: string, mailOptions: any) {
    const transportConfigs = [
        {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            family: 4,
            requireTLS: true,
            auth: { user: emailUser, pass: emailPass },
            connectionTimeout: 8000,
            greetingTimeout: 8000,
            socketTimeout: 8000
        },
        {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            family: 4,
            auth: { user: emailUser, pass: emailPass },
            connectionTimeout: 8000,
            greetingTimeout: 8000,
            socketTimeout: 8000
        },
        {
            service: 'gmail',
            auth: { user: emailUser, pass: emailPass },
            connectionTimeout: 8000,
            greetingTimeout: 8000,
            socketTimeout: 8000
        }
    ];

    let lastError: any = null;

    for (const config of transportConfigs) {
        try {
            const transporter = nodemailer.createTransport(config as any);
            const sendPromise = transporter.sendMail(mailOptions);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('SMTP timeout after 8 seconds')), 8000)
            );
            return await Promise.race([sendPromise, timeoutPromise]);
        } catch (err: any) {
            lastError = err;
            const isAuthError = err.code === 'EAUTH' || err.responseCode === 535 || (err.message && err.message.includes('BadCredentials'));
            // If credentials are bad, attempting different ports won't help
            if (isAuthError) {
                throw err;
            }
            console.warn(`[Auth] SMTP delivery attempt with port ${(config as any).port || 'default'} failed:`, err.message);
        }
    }

    throw lastError || new Error('All SMTP transport attempts failed.');
}

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Please enter your email address." });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(404).json({ message: "No account found with this email." });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await user.save();

        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        console.log('\n=============================================================');
        console.log(`🔗 [BAGSUP] PASSWORD RESET LINK FOR: ${user.email}`);
        console.log(`👉 ${resetUrl}`);
        console.log('=============================================================\n');

        const emailUser = (process.env.EMAIL_USER || "").trim();
        const emailPass = (process.env.EMAIL_PASS || "").trim();

        if (!emailUser || !emailPass) {
            console.warn("[Auth] EMAIL_USER or EMAIL_PASS not configured in .env");
            return res.json({
                message: "Recovery link generated! (Email credentials not configured in .env)",
                resetUrl: resetUrl
            });
        }

        const mailOptions = {
            from: `"BAGSUP" <${emailUser}>`,
            to: user.email,
            subject: 'Reset Your Password – BAGSUP',
            text: `Click the link below to reset your password:\n${resetUrl}\n\nThis link will expire in 15 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
                    <h2 style="color: #111827; margin-top: 0; font-size: 22px;">Reset Your Password</h2>
                    <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">You recently requested to reset the password for your BAGSUP account. Click the button below to proceed:</p>
                    <div style="margin: 28px 0; text-align: center;">
                        <a href="${resetUrl}" style="background-color: #facc15; color: #111827; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">Reset Password</a>
                    </div>
                    <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">If the button does not work, copy and paste this URL into your browser:</p>
                    <p style="color: #2563eb; font-size: 12px; word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
                    <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
                    <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">This recovery link expires in 15 minutes. If you did not make this request, you can safely ignore this email.</p>
                </div>
            `
        };

        try {
            await sendMailWithFallback(emailUser, emailPass, mailOptions);
            return res.json({ message: "Recovery link has been sent to your email." });
        } catch (emailErr: any) {
            console.error("[Auth] Recovery email delivery failed:", emailErr.message);

            const isAuthError = emailErr.code === 'EAUTH' || emailErr.responseCode === 535 || (emailErr.message && emailErr.message.includes('BadCredentials'));
            let reason = "Email sending timed out or failed to connect to mail server.";
            if (isAuthError) {
                reason = "Gmail App Password was rejected (BadCredentials). Please update EMAIL_PASS in your .env with a fresh 16-character Google App Password.";
            }

            // Return success with resetUrl fallback so user is never blocked
            return res.json({
                message: "Password reset link generated successfully.",
                resetUrl: resetUrl,
                warning: reason
            });
        }
    } catch (err: any) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ error: "Failed to process password recovery: " + err.message });
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

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '598862793311-694upm2m7o2npmuit59mo2uq7ffub4s0.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export const register = async (req: Request, res: Response) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                error: 'Database connection is not ready. Please ensure your MongoDB Atlas cluster has IP Access List set to 0.0.0.0/0 (Allow access from anywhere) and restart your server.'
            });
        }

        const { username, email, password } = req.body;

        if (!email || !username || !password) {
            return res.status(400).json({ error: 'All fields (username, email, password) are required.' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const normalizedUsername = username.toLowerCase().trim();

        // Strict Gmail-only validation requirement
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
        if (!gmailRegex.test(normalizedEmail)) {
            return res.status(400).json({ error: 'Please enter a valid Gmail address (@gmail.com).' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ 
            $or: [{ email: normalizedEmail }, { username: normalizedUsername }] 
        });
        if (existingUser) {
            return res.status(400).json({ error: 'An account already exists with this email or username.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification token
        const rawVerificationToken = crypto.randomBytes(32).toString('hex');
        const hashedVerificationToken = crypto.createHash('sha256').update(rawVerificationToken).digest('hex');

        // Create user with isVerified: false
        const newUser = new User({ 
            username: normalizedUsername, 
            email: normalizedEmail, 
            password: hashedPassword,
            isVerified: false,
            verificationToken: hashedVerificationToken,
            verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });
        await newUser.save();

        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
        const verifyUrl = `${frontendUrl}/verify-email/${rawVerificationToken}`;

        console.log('\n=============================================================');
        console.log(`✉️ [BAGSUP] EMAIL VERIFICATION LINK FOR: ${newUser.email}`);
        console.log(`👉 ${verifyUrl}`);
        console.log('=============================================================\n');

        const emailUser = (process.env.EMAIL_USER || "").trim();
        const emailPass = (process.env.EMAIL_PASS || "").trim();

        const mailOptions = {
            from: `"BAGSUP" <${emailUser}>`,
            to: newUser.email,
            subject: 'Verify Your Email Address – BAGSUP',
            text: `Welcome to BAGSUP! Please verify your email by clicking the link below:\n${verifyUrl}\n\nThis link will expire in 24 hours.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
                    <h2 style="color: #111827; margin-top: 0; font-size: 22px;">Welcome to BAGSUP!</h2>
                    <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
                    <div style="margin: 28px 0; text-align: center;">
                        <a href="${verifyUrl}" style="background-color: #facc15; color: #111827; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">Verify Email Address</a>
                    </div>
                    <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">If the button does not work, copy and paste this URL into your browser:</p>
                    <p style="color: #2563eb; font-size: 12px; word-break: break-all;"><a href="${verifyUrl}">${verifyUrl}</a></p>
                    <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
                    <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">This verification link will expire in 24 hours.</p>
                </div>
            `
        };

        if (emailUser && emailPass) {
            try {
                await sendMailWithFallback(emailUser, emailPass, mailOptions);
                return res.status(201).json({ 
                    message: 'Registration successful! A verification email has been sent to your Gmail. Please verify your email before logging in.'
                });
            } catch (emailErr: any) {
                console.error("[Auth] Verification email delivery failed:", emailErr.message);
                return res.status(201).json({ 
                    message: 'Registration successful! However, the verification email could not be sent. Please contact support.',
                    warning: 'Email delivery notice: ' + emailErr.message
                });
            }
        } else {
            console.warn("[Auth] Email credentials not configured. Verification link logged in terminal.");
            return res.status(201).json({ 
                message: 'Registration successful! Please check your email inbox to verify your account.'
            });
        }
    } catch (err: any) {
        console.error("Register Error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const hashedToken = crypto.createHash('sha256').update(token as string).digest('hex');

        const user = await User.findOne({
            verificationToken: hashedToken,
            $or: [
                { verificationExpires: { $gt: new Date() } },
                { verificationExpires: { $exists: false } }
            ]
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired verification link." });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationExpires = undefined;
        await user.save();

        console.log(`✅ [BAGSUP] Email verified successfully for: ${user.email}`);

        res.json({ message: "Email verified successfully! You can now log in." });
    } catch (err: any) {
        console.error("Verify Email Error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                error: 'Database connection is not ready. Please ensure your MongoDB Atlas cluster has IP Access List set to 0.0.0.0/0 (Allow access from anywhere) and restart your server.'
            });
        }

        const { username, password } = req.body;

        const lookup = (username || '').toLowerCase().trim();
        const user = await User.findOne({ 
            $or: [{ email: lookup }, { username: lookup }] 
        });
        
        if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        // Enforce email verification check before login
        if (!user.isVerified) {
            return res.status(403).json({ 
                error: 'Please verify your Gmail address before logging in. Check your inbox for the verification link.' 
            });
        }

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
        console.error("Login Error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const googleLogin = async (req: Request, res: Response) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                error: 'Database connection is not ready. Please verify MongoDB Atlas IP Access List (0.0.0.0/0).'
            });
        }

        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        const targetAudience = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID;

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: targetAudience,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) return res.status(400).json({ error: 'Invalid Google token' });

        const { email, sub: googleId, name, picture } = payload;
        const normalizedEmail = email.toLowerCase().trim();

        // Enforce Gmail only for Google Login as well
        if (!normalizedEmail.endsWith('@gmail.com')) {
            return res.status(400).json({ error: 'Only Google accounts with @gmail.com are permitted.' });
        }

        let user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            // Generate unique, valid username
            const rawUsername = (name || normalizedEmail.split('@')[0])
                .toLowerCase()
                .replace(/[^a-z0-9_]/g, '_')
                .replace(/^_+|_+$/g, '') || 'user';

            let uniqueUsername = rawUsername.slice(0, 20);
            let counter = 1;
            while (await User.findOne({ username: uniqueUsername })) {
                uniqueUsername = `${rawUsername.slice(0, 15)}_${Math.floor(100 + Math.random() * 900)}`;
                counter++;
                if (counter > 10) break;
            }

            user = new User({
                username: uniqueUsername,
                email: normalizedEmail,
                googleId,
                avatar: picture,
                full_name: name || uniqueUsername,
                isVerified: true // Google accounts have pre-verified email
            });
            await user.save();
        } else {
            let updated = false;
            if (!user.googleId) {
                user.googleId = googleId;
                updated = true;
            }
            if (picture && !user.avatar) {
                user.avatar = picture;
                updated = true;
            }
            if (name && !user.full_name) {
                user.full_name = name;
                updated = true;
            }
            if (!user.isVerified) {
                user.isVerified = true;
                updated = true;
            }
            if (updated) {
                await user.save();
            }
        }

        const jwtToken = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        res.json({
            access: jwtToken,
            refresh: jwtToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                full_name: user.full_name
            }
        });
    } catch (err: any) {
        console.error('Google Login Controller Error:', err);
        res.status(500).json({ error: err.message || 'Failed to authenticate with Google' });
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
