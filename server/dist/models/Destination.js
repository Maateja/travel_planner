import mongoose from 'mongoose';
const destinationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    state: { type: String, required: true },
    short_description: { type: String, required: true },
    estimated_budget_min: { type: Number, required: true },
    estimated_budget_max: { type: Number, required: true },
    recommended_days: { type: Number, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    category: { type: String, required: true, enum: ['Adventure', 'Nature', 'Spiritual', 'Beach', 'Heritage', 'Hill Station', 'City', 'Wildlife'] }
}, {
    timestamps: true
});
// Create index for state for faster queries
destinationSchema.index({ state: 1 });
const Destination = mongoose.model('Destination', destinationSchema);
export default Destination;
