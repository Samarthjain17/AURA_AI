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

// 🔥 LOGOUT CONTROLLER (Cookie Killer)
export const logoutUser = async (req, res) => {
  try {
    // res.clearCookie ke andar us cookie ka naam daalna jo tum login ke time set karte ho.
    // Usually ye 'token' ya 'access_token' hota hai. Main 'token' maan kar chal raha hoon:
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    return res.status(200).json({
      success: true,
      message: "Successfully logged out and cookie cleared!"
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error during logout" });
  }
};