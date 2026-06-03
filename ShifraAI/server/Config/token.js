import jwt from 'jsonwebtoken';

// Ye function ek naya token banata hai user ID ka use karke
export const generateToken = (userId) => {
    try {
        // jwt.sign() 3 cheezein leta hai: data (userId), secret key, aur expiry time (7 days)
        const token = jwt.sign(
            { userId }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );
        return token;
    } catch (error) {
        console.log("Token generation error:", error);
    }
};