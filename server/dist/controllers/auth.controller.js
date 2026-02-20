import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser)
            return res.status(400).json({ error: 'User already exists with this email or username' });
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        const token = jwt.sign({ id: newUser._id, username: newUser.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            message: 'User registered successfully',
            access: token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({
            $or: [{ email: username.toLowerCase() }, { username: username.toLowerCase() }]
        });
        if (!user || !user.password)
            return res.status(401).json({ error: 'Invalid credentials' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
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
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email)
            return res.status(400).json({ error: 'Invalid Google token' });
        const { email, sub: googleId, name, picture } = payload;
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                username: name || email.split('@')[0],
                email,
                googleId,
                avatar: picture,
                full_name: name
            });
            await user.save();
        }
        else if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }
        const jwtToken = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
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
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const updateProfile = async (req, res) => {
    try {
        const { full_name, age, gender, dob } = req.body;
        const user = await User.findById(req.user.id);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        if (full_name !== undefined)
            user.full_name = full_name;
        if (age !== undefined)
            user.age = Number(age);
        if (gender !== undefined)
            user.gender = gender;
        if (dob !== undefined)
            user.dob = dob;
        await user.save();
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
