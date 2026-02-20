import mongoose, { Schema } from 'mongoose';
const TripSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    source: { type: String, required: true },
    destination: { type: String, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    budget: { type: Number, required: true },
    preference: {
        interests: { type: [String], default: [] },
        travel_style: { type: String, default: 'Budget' }
    },
    createdAt: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
TripSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
export default mongoose.model('Trip', TripSchema);
