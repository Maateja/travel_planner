import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env from current directory or parent (since it's in server/src)
dotenv.config(); // If run from server folder
dotenv.config({ path: '../.env' }); // Fallback for src

const destinationSchema = new mongoose.Schema({
    name: String,
    latitude: Number,
    longitude: Number,
    state: String
});

const Destination = mongoose.models.Destination || mongoose.model('Destination', destinationSchema);

async function check() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('❌ MONGODB_URI not found in env!');
            process.exit(1);
        }
        
        console.log('Connecting to database...');
        await mongoose.connect(uri);
        
        const cities = ['Vizianagaram', 'Madanapalle', 'Horsley Hills', 'Tirupati'];
        
        console.log('\n--- Accurate Coordinate Verification ---');
        for (const city of cities) {
            const result = await Destination.findOne({ name: city });
            if (result) {
                console.log(`${city.padEnd(15)}: Lat ${result.latitude.toFixed(4)}, Lng ${result.longitude.toFixed(4)} (${result.state})`);
            } else {
                console.log(`${city.padEnd(15)}: Not found!`);
            }
        }
    } catch (e) {
        console.error('Error during check:', e);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

check();
