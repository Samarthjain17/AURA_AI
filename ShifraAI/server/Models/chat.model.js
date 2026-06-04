import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    // User ki email save karenge taaki pata rahe ye chat kiski hai
    userEmail: { 
        type: String, 
        required: true 
    },
    // Messages ka array jisme saari baatcheet save hogi
    messages: [
        {
            role: { type: String, enum: ['user', 'ai'], required: true },
            text: { type: String, required: true }
        }
    ]
}, { timestamps: true });

export default mongoose.model('Chat', chatSchema);