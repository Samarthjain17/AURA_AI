import User from "../models/user.model.js";

// 🚀 SAAS: ASSISTANT SETTINGS SAVE KARNE WALI API 🚀
export const saveAssistantSettings = async (req, res) => {
    try {
        const { 
            userEmail, 
            assistantName, 
            businessName, 
            businessType, 
            businessDescription, 
            tone, 
            theme, 
            geminiApiKey 
        } = req.body;

        if (!userEmail) {
            return res.status(400).json({ error: "User email is required!" });
        }

        const updatedUser = await User.findOneAndUpdate(
            { email: userEmail }, 
            {
                assistantName,
                businessName,
                businessType,
                businessDescription,
                tone,
                theme,
                geminiApiKey,
                isSetupComplete: true 
            },
            { new: true, upsert: true } 
        );

        res.status(200).json({ 
            message: "Assistant Saved Successfully! ✨", 
            user: updatedUser 
        });

    } catch (error) {
        console.error("❌ Save Assistant Error:", error);
        res.status(500).json({ error: "Server Error: Failed to save assistant settings." });
    }
};

// 🔍 GET SETTINGS API (Dashboard Form pre-fill karne ke liye)
export const getUserSettings = async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("❌ Get Settings Error:", error);
        res.status(500).json({ error: "Server Error: Failed to fetch settings." });
    }
};

// 👤 GET CURRENT USER API
export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user?._id || req.userId; 
        
        if (!userId && req.user) {
            return res.status(200).json(req.user);
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("❌ Get Current User Error:", error);
        res.status(500).json({ error: "Server Error: Failed to get current user." });
    }
};

// 🚪 LOGOUT USER API
export const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token"); 
        res.status(200).json({ message: "Logged out successfully! 👋" });
    } catch (error) {
        console.error("❌ Logout Error:", error);
        res.status(500).json({ error: "Server Error: Failed to logout." });
    }
};