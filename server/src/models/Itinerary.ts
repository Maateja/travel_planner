import mongoose, { Schema, Document } from 'mongoose';

export interface IItinerary extends Document {
    id: string;
    trip: mongoose.Types.ObjectId;
    day: number;
    title: string;
    plan_description: string;
    activities: string[];
    estimated_cost: number;
    createdAt: Date;
}

const ItinerarySchema: Schema = new Schema({
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

ItinerarySchema.virtual('id').get(function(this: any) {
    return this._id.toHexString();
});

export default mongoose.model<IItinerary>('Itinerary', ItinerarySchema);
