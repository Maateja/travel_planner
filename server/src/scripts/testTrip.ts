import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const trips = await mongoose.connection.collection('trips').find().limit(3).toArray();
    console.log("Found trips:");
    trips.forEach(t => {
        console.log(`startDate: ${t.start_date}, endDate: ${t.end_date}, dest: ${t.destination}`);
    });
    await mongoose.disconnect();
}
run();
