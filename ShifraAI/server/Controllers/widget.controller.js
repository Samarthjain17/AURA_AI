import User from '../models/user.model.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export const askWidget = async (req, res) => {
    try {
        const { userId, message } = req.body;

        if (!userId || !message) {
            return res.status(400).json({ error: "Missing User ID or Message" });
        }

        // 1. Find the SaaS Client (User) who owns this widget
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Widget owner not found!" });
        }

        // 2. Check SaaS Limits (Monetization Logic) 💰
        if (user.plan === "free" && user.totalMessages >= user.requestLimit) {
            return res.status(200).json({ 
                answer: "This assistant has reached its free limit. Please ask the website owner to upgrade their plan." 
            });
        }

        const lowerMsg = message.toLowerCase();

        // 3. Smart Voice Navigation Logic 🧭
        if (user.enableNavigation && user.pages && user.pages.length > 0) {
            const navKeywords = ["open", "go to", "navigate to", "show", "take me to"];
            const isNavCommand = navKeywords.some(kw => lowerMsg.startsWith(kw));

            if (isNavCommand) {
                // Find matching page from user's builder settings
                const matchedPage = user.pages.find(page => 
                    page.keywords.some(kw => lowerMsg.includes(kw.toLowerCase())) || 
                    lowerMsg.includes(page.name.toLowerCase())
                );

                if (matchedPage) {
                    // Deduct Limit & Return Navigation Command
                    if (user.plan === "free") user.totalMessages += 1;
                    await user.save();
                    
                    return res.status(200).json({ 
                        action: "navigate", 
                        path: matchedPage.path 
                    });
                }
            }
        }

        // 4. Custom AI Response Generation 🧠
        // Use User's custom API key if provided, else use Server's default API key
        let apiKey = user.geminiApiKey;
        if (!apiKey) {
            const envKeys = process.env.GEMINI_API_KEYS;
            apiKey = envKeys ? envKeys.split(',')[0].trim() : null;
        }

        if (!apiKey) throw new Error("No API Key available");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 🔥 THE MAGIC PROMPT (Trained on Builder Data) 🔥
        const systemPrompt = `
            You are ${user.assistantName}, a ${user.tone} and helpful AI voice assistant for a business named "${user.businessName}".
            Business Type: ${user.businessType}.
            Business Details/Rules: ${user.businessDescription}.
            
            Strict Rules:
            1. Keep your answers very short, concise, and conversational (1-2 lines max) because they will be converted to speech.
            2. NEVER use markdown (no asterisks **, hashtags #, or bold text).
            3. Answer STRICTLY based on the business details provided above. If the user asks something unrelated to the business, politely decline.
        `;

        const chatSession = model.startChat({
            history: [{ role: "user", parts: [{ text: systemPrompt }] }, { role: "model", parts: [{ text: "Understood. I will follow these instructions." }] }]
        });

        const result = await chatSession.sendMessage(message);
        let answer = result.response.text();
        
        // Clean markdown just in case
        answer = answer.replace(/[*_#`]/g, '');

        // 5. Update SaaS Usage 📈
        if (user.plan === "free") user.totalMessages += 1;
        await user.save();

        return res.status(200).json({ answer });

    } catch (error) {
        console.error("❌ Widget API Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};