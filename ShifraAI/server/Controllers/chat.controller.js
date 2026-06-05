import { GoogleGenerativeAI } from '@google/generative-ai';
import Chat from '../models/chat.model.js';

export const generateResponse = async (req, res) => {
    try {
        // 1. Ab hum imageBase64 bhi frontend se receive karenge
        const { prompt, userEmail, chatId, isTemporary, frontendMessages, imageBase64 } = req.body; 
        
        if (!prompt && !imageBase64) return res.status(400).json({ error: "Prompt or Image is required!" });

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // gemini-2.5-flash images bhi support karta hai default!
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

        // 2. Message ke "Parts" banao (Text + Image)
        let messageParts = [{ text: prompt || "Describe this image" }];
        
        if (imageBase64) {
            // Base64 format ko Gemini ke samajhne layk format me badlo
            const mimeType = imageBase64.split(';')[0].split(':')[1];
            const base64Data = imageBase64.split(',')[1];
            messageParts.push({
                inlineData: { data: base64Data, mimeType }
            });
        }

        // 🕵️‍♂️ INCOGNITO MODE (No Database Save)
        if (isTemporary) {
            let historyForGemini = [];
            if (frontendMessages && frontendMessages.length > 0) {
                historyForGemini = frontendMessages.slice(1).map(msg => ({
                    role: msg.role === 'ai' ? 'model' : 'user',
                    parts: [{ text: msg.text }]
                }));
            }
            const chatSession = model.startChat({ history: historyForGemini });
            const result = await chatSession.sendMessage(messageParts); // Send Parts here
            return res.status(200).json({ answer: result.response.text(), title: "Temporary" });
        }

        // 💾 NORMAL MODE (Save to Database)
        if (!userEmail || !chatId) return res.status(400).json({ error: "Email and ChatID required!" });

        let chat = await Chat.findOne({ userEmail, chatId });
        let historyForGemini = [];

        if (chat) {
            historyForGemini = chat.messages.map(msg => ({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));
        }
        
        const chatSession = model.startChat({ history: historyForGemini });
        const result = await chatSession.sendMessage(messageParts); // Send Parts here
        const responseText = result.response.text();

        // 3. Save to DB (Database me image base64 save mat karna, sirf text save karo)
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
        console.error("AURA AI Error:", error);
        res.status(500).json({ error: "Server error in AI processing!" });
    }
};
export const getChatHistory = async (req, res) => {
    try {
        // Ab specific chat history mangani padegi
        const { userEmail, chatId } = req.body;
        const chat = await Chat.findOne({ userEmail, chatId });
        
        if (!chat) return res.status(200).json({ messages: [] });
        
        res.status(200).json({ messages: chat.messages });
    } catch (error) {
        res.status(500).json({ error: "Could not fetch history." });
    }
};

// NAYA FUNCTION: Sidebar me saari chats dikhane ke liye
export const getUserChats = async (req, res) => {
    try {
        const { userEmail } = req.body;
        // User ki saari chats nikaalo, sirf unka title aur ID bhejo
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