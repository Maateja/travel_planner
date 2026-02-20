import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    avatar: { type: String },
    full_name: { type: String },
    age: { type: Number },
    gender: { type: String },
    dob: { type: String },
    createdAt: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
UserSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
export default mongoose.model('User', UserSchema);
