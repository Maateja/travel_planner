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
// Routes
app.use('/api/users', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/chat', chatRoutes);
// Health check
app.get('/', (req, res) => {
    res.send('BagsUp Node.js API is running...');
});
// Start Server Immediately
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    // Connect to Database after server starts
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI is not defined in .env');
    }
    else {
        mongoose.connect(process.env.MONGODB_URI)
            .then(() => console.log('✅ Connected to MongoDB'))
            .catch(err => {
            console.error('❌ MongoDB connection error:', err.message || err);
            console.log('--- Database Connection Failed ---');
            console.log('Please check your password in server/.env');
        });
    }
});
