import mongoose, { Schema, Document } from 'mongoose';

export interface ITrip extends Document {
    id: string;
    user: mongoose.Types.ObjectId;
    source: string;
    destination: string;
    start_date: Date;
    end_date: Date;
    budget: number;
    preference: {
        interests: string[];
        travel_style: string;
    };
    createdAt: Date;
}

const TripSchema: Schema = new Schema({
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

TripSchema.virtual('id').get(function(this: any) {
    return this._id.toHexString();
});

export default mongoose.model<ITrip>('Trip', TripSchema);
