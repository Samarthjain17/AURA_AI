import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    chatId: { type: String, required: true }, // Naya: Har chat ki unique ID
    title: { type: String, default: "New Chat" }, // Naya: Chat ka naam (Sidebar me dikhane ke liye)
    messages: [
        {
            role: { type: String, enum: ['user', 'ai'], required: true },
            text: { type: String, required: true }
        }
    ]
}, { timestamps: true });

export default mongoose.model('Chat', chatSchema);