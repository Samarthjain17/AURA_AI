import { GoogleGenerativeAI } from '@google/generative-ai';
import Chat from '../models/chat.model.js';
import dotenv from 'dotenv';

dotenv.config();

let currentKeyIndex = 0; 

// 🔥 SUPER SMART SELF-HEALING ENGINE (Handles 429, 503, and 500 errors) 🔥
async function generateWithRetry(historyForGemini, messageParts, retries = 0) {
    const envKeys = process.env.GEMINI_API_KEYS;
    const apiKeys = envKeys ? envKeys.split(',').map(key => key.trim()).filter(key => key !== '') : [];

    if (apiKeys.length === 0) {
        throw new Error("⚠️ GEMINI_API_KEYS .env file mein nahi mili! Comma lagakar keys likho.");
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKeys[currentKeyIndex]);
        // Tumhara working model (isko touch nahi kiya hai)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
        
        const chatSession = model.startChat({ history: historyForGemini });
        const result = await chatSession.sendMessage(messageParts); 
        
        return result.response.text();
        
    } catch (error) {
        // NAYA LOGIC: Google ka server busy hone (503/500) ya limit aane par (429) retry karega
        const isRetryableError = 
            error.status === 429 || 
            error.status === 503 || 
            error.status === 500 || 
            (error.message && (
                error.message.includes('429') || 
                error.message.includes('503') || 
                error.message.includes('quota') || 
                error.message.includes('unavailable') ||
                error.message.includes('demand')
            ));
        
        if (isRetryableError) {
            if (retries < apiKeys.length - 1) {
                console.log(`⚠️ Key ${currentKeyIndex + 1} par load zyada hai ya server busy hai. Agli key pe switch kar raha hoon...`);
                
                currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
                
                console.log("⏳ 2.5 seconds ka wait kar raha hoon taaki Google server shant ho jaye...");
                await new Promise(resolve => setTimeout(resolve, 2500));
                
                return generateWithRetry(historyForGemini, messageParts, retries + 1);
            } else {
                console.error("❌ Saari API keys try kar li, server sach mein bahut busy hai!");
                throw new Error("SERVER_BUSY");
            }
        }
        
        throw error;
    }
}

// 🚀 MAIN API HANDLER 🚀
export const generateResponse = async (req, res) => {
    try {
        const { prompt, userEmail, chatId, isTemporary, frontendMessages, imageBase64 } = req.body; 
        
        if (!prompt && !imageBase64) return res.status(400).json({ error: "Prompt or Image is required!" });

        let messageParts = [{ text: prompt || "Describe this image" }];
        
        if (imageBase64) {
            const mimeType = imageBase64.split(';')[0].split(':')[1];
            const base64Data = imageBase64.split(',')[1];
            messageParts.push({
                inlineData: { data: base64Data, mimeType }
            });
        }

        if (isTemporary) {
            let historyForGemini = [];
            if (frontendMessages && frontendMessages.length > 0) {
                historyForGemini = frontendMessages.slice(1).map(msg => ({
                    role: msg.role === 'ai' ? 'model' : 'user',
                    parts: [{ text: msg.text }]
                }));
            }
            
            const answer = await generateWithRetry(historyForGemini, messageParts);
            return res.status(200).json({ answer: answer, title: "Temporary" });
        }

        if (!userEmail || !chatId) return res.status(400).json({ error: "Email and ChatID required!" });

        let chat = await Chat.findOne({ userEmail, chatId });
        let historyForGemini = [];

        if (chat) {
            historyForGemini = chat.messages.map(msg => ({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));
        }
        
        const responseText = await generateWithRetry(historyForGemini, messageParts);

        const dbUserText = imageBase64 ? `📎 [Image Uploaded]\n${prompt}` : prompt;

        if (!chat) {
            const chatTitle = prompt.length > 30 ? prompt.substring(0, 30) + "..." : prompt || "Image Chat";
            chat = new Chat({
                userEmail, chatId, title: chatTitle,
                messages: [{ role: 'user', text: dbUserText }, { role: 'ai', text: responseText }]
            });
        } else {
            chat.messages.push({ role: 'user', text: dbUserText });
            chat.messages.push({ role: 'ai', text: responseText });
        }

        await chat.save(); 
        res.status(200).json({ answer: responseText, title: chat.title });

    } catch (error) {
        if (error.message === "SERVER_BUSY") {
            res.status(500).json({ error: "Google's AI servers are extremely busy right now! AURA is taking a short break. Please try again in a few seconds. 🧘‍♂️" });
        } else {
            console.error("AURA AI Error:", error);
            res.status(500).json({ error: "Server error in AI processing!" });
        }
    }
};

export const getChatHistory = async (req, res) => {
    try {
        const { userEmail, chatId } = req.body;
        const chat = await Chat.findOne({ userEmail, chatId });
        
        if (!chat) return res.status(200).json({ messages: [] });
        
        res.status(200).json({ messages: chat.messages });
    } catch (error) {
        res.status(500).json({ error: "Could not fetch history." });
    }
};

export const getUserChats = async (req, res) => {
    try {
        const { userEmail } = req.body;
        const chats = await Chat.find({ userEmail }).sort({ updatedAt: -1 }).select('chatId title');
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch chats." });
    }
};

export const clearChat = async (req, res) => {
    try {
        const { userEmail, chatId } = req.body;
        await Chat.findOneAndDelete({ userEmail, chatId });
        res.status(200).json({ message: "Chat deleted! ✨" });
    } catch (error) {
        res.status(500).json({ error: "Could not delete chat." });
    }
};