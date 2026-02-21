import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    id: string;
    username: string;
    email: string;
    password?: string;
    googleId?: string;
    avatar?: string;
    full_name?: string;
    age?: number;
    gender?: string;
    dob?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    isVerified?: boolean;
    verificationToken?: string;
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    avatar: { type: String },
    full_name: { type: String },
    age: { type: Number },
    gender: { type: String },
    dob: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    createdAt: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

UserSchema.virtual('id').get(function(this: any) {
    return this._id.toHexString();
});

export default mongoose.model<IUser>('User', UserSchema);
