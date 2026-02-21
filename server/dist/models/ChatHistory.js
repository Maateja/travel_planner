import mongoose from 'mongoose';
const chatMessageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'model'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
const chatHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    messages: [chatMessageSchema]
}, { timestamps: true });
export default mongoose.model('ChatHistory', chatHistorySchema);
