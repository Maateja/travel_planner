import mongoose, { Schema } from 'mongoose';
const ItinerarySchema = new Schema({
    trip: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
    day: { type: Number, required: true },
    title: { type: String, required: true },
    plan_description: { type: String, default: '' },
    activities: { type: [String], default: [] },
    estimated_cost: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
ItinerarySchema.virtual('id').get(function () {
    return this._id.toHexString();
});
export default mongoose.model('Itinerary', ItinerarySchema);
