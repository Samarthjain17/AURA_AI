import User from '../models/user.model.js';
import { generateToken } from '../config/token.js';

export const googleAuth = async (req, res) => {
    try {
        // 1. Frontend se Name aur Email lo
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Name and email are required" });
        }

        // 2. Check karo ki user pehle se database me hai ya nahi
        let user = await User.findOne({ email });

        // 3. Agar user nahi hai, toh naya user create karo (Sign Up)
        if (!user) {
            user = await User.create({ name, email });
        }

        // 4. Token generate karo
        const token = generateToken(user._id);

        // 5. Token ko browser ki cookie me save karo
        res.cookie("token", token, {
            httpOnly: true, // Browser JS isko access nahi kar sakti (security)
            secure: process.env.NODE_ENV === 'production', // Production me HTTPS ke liye
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });

        // 6. User data wapas frontend ko bhej do
        return res.status(200).json({
            message: "Login successful",
            user: user
        });

    } catch (error) {
        console.log("Google Auth Error:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        // Logout ka matlab hai cookie se token hata do
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "strict",
        });

        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Logout failed" });
    }
};