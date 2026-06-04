import { GoogleGenerativeAI } from '@google/generative-ai';

export const generateResponse = async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: "Bhai, kuch type toh karo! (Prompt is required)" });
        }

        // Gemini AI ko apni key ke sath initialize karo
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Hum sabse fast model use kar rahe hain
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // AI se answer maango
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Answer ko frontend par bhej do
        res.status(200).json({ answer: responseText });

    } catch (error) {
        console.error("AURA AI Dimaag Error:", error);
        res.status(500).json({ error: "AI sochne me fail ho gaya. Server error!" });
    }
};