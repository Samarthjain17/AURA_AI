import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
    {
        name: String,
        path: String,
        keywords: {
            type: [String],
            default: [],
        },
    },
    { _id: false }
);

const userSchema = new mongoose.Schema({
    // Basic Authentication Details
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },

    // SaaS Custom Assistant Details
    assistantName: {
        type: String,
        default: "AURA"
    },
    businessName: {
        type: String,
        default: ""
    },
    businessType: {
        type: String,
        default: ""
    },
    businessDescription: {
        type: String,
        default: ""
    },
    tone: {
        type: String,
        enum: ["friendly", "professional", "sales"],
        default: "friendly"
    },
    theme: {
        type: String,
        enum: ["dark", "light", "glass", "neon"],
        default: "dark"
    },
    
    // Feature Toggles & Customization
    enableVoice: {
        type: Boolean,
        default: true
    },
    enableNavigation: {
        type: Boolean,
        default: true
    },
    pages: {
        type: [pageSchema],
        default: []
    },

    // Gemini Engine Details
    geminiApiKey: {
        type: String,
        default: ""
    },
    geminiStatus: {
        type: String,
        enum: ["active", "quota exceeded", "invalid"],
        default: "active"
    },

    // SaaS Billing & Plan Limits
    totalMessages: {
        type: Number,
        default: 0
    },
    plan: {
        type: String,
        enum: ["free", "pro"],
        default: "free"
    },
    requestLimit: {
        type: Number,
        default: 200,
    },
    proExpiresAt: {
        type: Date,
        default: null,
    },

    // Setup Status
    isSetupComplete: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;