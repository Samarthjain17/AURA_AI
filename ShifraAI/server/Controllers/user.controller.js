import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
    try {
        // req.userId humein isAuth middleware se mila hai
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // User mil gaya toh frontend ko bhej do
        return res.status(200).json({
            message: "User found successfully",
            user: user
        });

    } catch (error) {
        console.log("Get Current User Error:", error);
        return res.status(500).json({ message: "Server Error fetching user" });
    }
};