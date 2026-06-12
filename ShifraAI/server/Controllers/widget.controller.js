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
        const navKeywords = ["open", "go to", "navigate to", "show", "take me to"];
        const isNavCommand = navKeywords.some(kw => lowerMsg.startsWith(kw));

        if (isNavCommand) {
            // 🔥 DEMO ROUTES: Agar database mein pages nahi hain, toh inko use karega 🔥
            const demoPages = [
                { name: "builder", keywords: ["builder", "dashboard"], path: "/builder" },
                { name: "home", keywords: ["home", "main"], path: "/" }
            ];

            const availablePages = (user.pages && user.pages.length > 0) ? user.pages : demoPages;

            const matchedPage = availablePages.find(page => 
                page.keywords.some(kw => lowerMsg.includes(kw.toLowerCase())) || 
                lowerMsg.includes(page.name.toLowerCase())
            );

            if (matchedPage) {
                if (user.plan === "free") user.totalMessages += 1;
                await user.save();
                
                return res.status(200).json({ 
                    action: "navigate", 
                    path: matchedPage.path 
                });
            }
        }

        // 4. 🚀 PHASE 2: Human Handoff & Lead Capture Engine 🚀
        // Convert spoken "at the rate" to "@" and "dot" to "."
        let processedMsg = lowerMsg
            .replace(/at the rate/g, "@")
            .replace(/ dot /g, ".")
            .replace(/\s+@\s+/g, "@")   // Remove accidental spaces around @
            .replace(/\s*\.\s*/g, "."); // Remove accidental spaces around dot

        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        const phoneRegex = /\b\d{10}\b/; // Simple 10 digit phone regex

        const hasContactInfo = emailRegex.test(processedMsg) || phoneRegex.test(processedMsg.replace(/\s+/g, ""));
        const asksForHuman = ["human", "contact", "call me", "support", "talk to someone", "help"].some(kw => processedMsg.includes(kw));

        // Scenario A: User gave contact info (Save to DB)
        if (hasContactInfo) {
            const contactInfo = processedMsg.match(emailRegex)?.[0] || processedMsg.replace(/\s+/g, "").match(phoneRegex)?.[0];
            
            user.leads.push({ 
                contactInfo: contactInfo, 
                message: message 
            });
            if (user.plan === "free") user.totalMessages += 1;
            await user.save();

            return res.status(200).json({ 
                answer: "Got it! I have securely saved your contact details. Our human team will reach out to you shortly." 
            });
        } 
        
        // Scenario B: User asked for human, but hasn't given info yet
        else if (asksForHuman) {
            if (user.plan === "free") user.totalMessages += 1;
            await user.save();
            
            return res.status(200).json({ 
                answer: "I can connect you with our human support team. Please share your email ID or phone number." 
            });
        }

        // 5. Custom AI Response Generation (Gemini API) 🧠
        let apiKey = user.geminiApiKey;
        if (!apiKey) {
            const envKeys = process.env.GEMINI_API_KEYS;
            apiKey = envKeys ? envKeys.split(',')[0].trim() : null;
        }

        if (!apiKey) throw new Error("No API Key available");

        const genAI = new GoogleGenerativeAI(apiKey);
        // Using 1.5-flash to avoid '503 Service Unavailable' errors from heavy traffic
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 🔥 THE MAGIC PROMPT (Trained on Builder Data) 🔥
        // 🔥 THE MAGIC RAG PROMPT 🔥
        const systemPrompt = `
            You are ${user.assistantName}, a ${user.tone} and helpful AI voice assistant for a business named "${user.businessName}".
            Business Type: ${user.businessType}.
            Manual Business Rules: ${user.businessDescription}.
            
            Website Knowledge Base (Scraped Data):
            """
            ${user.scrapedContent ? user.scrapedContent : "No website data provided."}
            """
            
            Strict Rules:
            1. Keep your answers very short, concise, and conversational (1-2 lines max) because they will be converted to speech.
            2. NEVER use markdown (no asterisks **, hashtags #, or bold text).
            3. Answer STRICTLY based on the Manual Rules and Website Knowledge Base provided above. If the user asks something unrelated to this business, politely decline.
        `;

        const chatSession = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] }, 
                { role: "model", parts: [{ text: "Understood. I will follow these instructions strictly." }] }
            ]
        });

        const result = await chatSession.sendMessage(message);
        let answer = result.response.text();
        
        // Clean markdown just in case
        answer = answer.replace(/[*_#`]/g, '');

        // 6. Update SaaS Usage 📈
        if (user.plan === "free") user.totalMessages += 1;
        await user.save();

        return res.status(200).json({ answer });

    } catch (error) {
        console.error("❌ Widget API Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};