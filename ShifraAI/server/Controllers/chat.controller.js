import { GoogleGenerativeAI } from '@google/generative-ai';
import Chat from '../models/chat.model.js';

export const generateResponse = async (req, res) => {
    try {
        const { prompt, userEmail } = req.body; 
        
        if (!prompt || !userEmail) {
            return res.status(400).json({ error: "Prompt and Email are required!" });
        }

        // 1. Database se purani history nikaalo
        let chat = await Chat.findOne({ userEmail });
        let historyForGemini = [];

        if (chat) {
            // Google Gemini ka format thoda alag hota hai (ai ki jagah 'model' aur text ki jagah 'parts')
            historyForGemini = chat.messages.map(msg => ({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));
        }

        // 2. Gemini AI ko history ke sath initialize karo
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
        
        // startChat function AI ko purani baatein yaad dilata hai
        const chatSession = model.startChat({
            history: historyForGemini
        });

        // 3. Naya message bhejo
        const result = await chatSession.sendMessage(prompt);
        const responseText = result.response.text();

        // 4. Database me nayi Chat Save karo
        if (!chat) {
            chat = new Chat({
                userEmail,
                messages: [
                    { role: 'user', text: prompt },
                    { role: 'ai', text: responseText }
                ]
            });
        } else {
            chat.messages.push({ role: 'user', text: prompt });
            chat.messages.push({ role: 'ai', text: responseText });
        }

        await chat.save(); 

        // 5. Frontend par answer bhejo
        res.status(200).json({ answer: responseText });

    } catch (error) {
        console.error("AURA AI Error:", error);
        res.status(500).json({ error: "Server error in AI processing!" });
    }
};

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