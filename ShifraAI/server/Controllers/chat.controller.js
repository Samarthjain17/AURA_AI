import { GoogleGenerativeAI } from '@google/generative-ai';
import Chat from '../models/chat.model.js';

export const generateResponse = async (req, res) => {
    try {
        // Ab frontend se email bhi aayega
        const { prompt, userEmail } = req.body; 
        
        if (!prompt || !userEmail) {
            return res.status(400).json({ error: "Prompt and Email are required!" });
        }

        // 1. Gemini AI se answer laao
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 2. Database me Chat Save karo
        let chat = await Chat.findOne({ userEmail });

        if (!chat) {
            // Agar pehli baar chat kar raha hai, toh naya Record banao
            chat = new Chat({
                userEmail,
                messages: [
                    { role: 'user', text: prompt },
                    { role: 'ai', text: responseText }
                ]
            });
        } else {
            // Agar purani chat hai, toh aage messages add kar do
            chat.messages.push({ role: 'user', text: prompt });
            chat.messages.push({ role: 'ai', text: responseText });
        }

        await chat.save(); // MongoDB me permanently save! 🟢

        // 3. Frontend par answer bhejo
        res.status(200).json({ answer: responseText });

    } catch (error) {
        console.error("AURA AI Error:", error);
        res.status(500).json({ error: "Server error in AI processing!" });
    }
};

// Naya Function: Purani history fetch karne ke liye
export const getChatHistory = async (req, res) => {
    try {
        const { userEmail } = req.body;
        const chat = await Chat.findOne({ userEmail });
        
        if (!chat) {
            return res.status(200).json({ messages: [] });
        }
        
        res.status(200).json({ messages: chat.messages });
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).json({ error: "Could not fetch history." });
    }
};