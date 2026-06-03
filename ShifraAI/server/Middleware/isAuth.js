import jwt from "jsonwebtoken";

export const isAuth = async (req, res, next) => {
    try {
        // 1. Cookie se token nikalo
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "User does not have a token" });
        }

        // 2. Token ko verify karo apni secret key se
        const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);

        if (!verifiedToken) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // 3. Token se userId nikal kar aage bhej do
        req.userId = verifiedToken.userId;
        
        // 4. Sab theek hai toh aage jane do (next controller par)
        next();
        
    } catch (error) {
        console.log("Auth Middleware Error:", error);
        return res.status(500).json({ message: "Authentication failed" });
    }
};