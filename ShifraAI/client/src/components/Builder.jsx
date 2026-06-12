import React, { useState } from 'react';
import axios from 'axios';

const Builder = ({ user }) => {
  // States for all the SaaS fields
  const [assistantName, setAssistantName] = useState("AURA");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [tone, setTone] = useState("friendly");
  const [theme, setTheme] = useState("dark");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSaveAssistant = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (!user || !user.email) {
      setMessage("❌ User not logged in!");
      setIsLoading(false);
      return;
    }

    try {
      // Backend par data bhej rahe hain (Port check kar lena agar 8000 nahi hai toh)
      const response = await axios.post("http://localhost:8000/api/save-assistant", {
        userEmail: user.email,
        assistantName,
        businessName,
        businessType,
        businessDescription,
        tone,
        theme,
        geminiApiKey
      });

      setMessage("✅ " + response.data.message);
    } catch (error) {
      console.error("Save Error:", error);
      setMessage("❌ Failed to save assistant settings.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-8 px-10 text-white">
          <h1 className="text-3xl font-extrabold tracking-tight">AI Assistant Builder</h1>
          <p className="mt-2 text-indigo-100 text-sm">
            Customize your AI voice agent for your website. Fill in the details below to train AURA.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSaveAssistant} className="py-8 px-10 space-y-8">
          
          {/* Status Message */}
          {message && (
            <div className={`p-4 rounded-xl font-medium ${message.includes("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {message}
            </div>
          )}

          {/* 1. Basic Info */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">1. Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assistant Name</label>
                <input 
                  type="text" 
                  value={assistantName} 
                  onChange={(e) => setAssistantName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="e.g. AURA"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input 
                  type="text" 
                  value={businessName} 
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="e.g. Interview IQ"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                <input 
                  type="text" 
                  value={businessType} 
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="e.g. SaaS App / E-commerce"
                  required
                />
              </div>
            </div>
          </div>

          {/* 2. Training Data */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">2. Train Your AI</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Description (Prompt)</label>
              <textarea 
                rows="4"
                value={businessDescription} 
                onChange={(e) => setBusinessDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                placeholder="Describe your business in detail. The AI will read this to answer your users' questions..."
                required
              ></textarea>
              <p className="text-xs text-gray-500 mt-2">
                *This is the most important part. The better you describe your business, the smarter your AI will be.
              </p>
            </div>
          </div>

          {/* 3. Appearance & Behavior */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">3. Appearance & Behavior</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Voice Tone</label>
                <select 
                  value={tone} 
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                >
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="sales">Sales & Pitch</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Widget Theme</label>
                <select 
                  value={theme} 
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                >
                  <option value="dark">Dark Mode</option>
                  <option value="light">Light Mode</option>
                  <option value="glass">Glassmorphism</option>
                  <option value="neon">Neon Green</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. API Key */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">4. Bring Your Own API (BYOK)</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gemini API Key</label>
              <input 
                type="password" 
                value={geminiApiKey} 
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="AIzaSy............................."
              />
              <p className="text-xs text-gray-500 mt-2">
                *Your API key is encrypted and stored securely. This ensures you never run out of free limits.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-4 px-6 text-white text-lg font-bold rounded-2xl shadow-lg transition-all duration-300 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.02] hover:shadow-indigo-500/30'}`}
            >
              {isLoading ? "Saving Assistant..." : "Save & Train Assistant 🚀"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Builder;