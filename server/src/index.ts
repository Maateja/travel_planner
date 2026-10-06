import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import tripRoutes from './routes/trip.routes.js';
import itineraryRoutes from './routes/itinerary.routes.js';
import destinationRoutes from './routes/destination.routes.js';
import chatRoutes from './routes/chat.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

console.log("--- System Startup ---");
console.log("EMAIL_USER loaded:", !!process.env.EMAIL_USER);
console.log("EMAIL_PASS loaded:", !!process.env.EMAIL_PASS);
console.log("----------------------");
// Middleware
app.use(cors());
app.use(express.json());

// Database connection with retry logic
const connectDB = async (retries = 5, delayMs = 3000): Promise<boolean> => {
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI is not defined in .env');
        return false;
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`📡 Connecting to MongoDB (attempt ${attempt}/${retries})...`);
            await mongoose.connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 5000,
            });
            console.log('✅ Connected to MongoDB successfully');
            return true;
        } catch (err: any) {
            console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed:`, err.message || err);
            if (attempt < retries) {
                console.log(`⏳ Retrying in ${delayMs / 1000}s...`);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }
    }
    console.error('⚠️ Could not establish initial connection to MongoDB. Please check MongoDB Atlas IP whitelist (0.0.0.0/0) and credentials.');
    return false;
};

// Connection event listeners
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB connection lost. Mongoose will attempt to reconnect...');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected successfully');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message || err);
});

// Database readiness middleware for /api
app.use('/api', (req, res, next) => {
    // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            error: 'Database connection unavailable. Please ensure MongoDB is connected and IP whitelist is configured in MongoDB Atlas.',
            readyState: mongoose.connection.readyState
        });
    }
    next();
});

// Routes
app.use('/api/users', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        readyState: mongoose.connection.readyState
    });
});

app.get('/', (req, res) => {
    res.send('BagsUp Node.js API is running...');
});

// Start Server
async function startServer() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

startServer();
