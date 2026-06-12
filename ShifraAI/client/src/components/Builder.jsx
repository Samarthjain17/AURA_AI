import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Builder = ({ user, setUser }) => {
  // States
  const [assistantName, setAssistantName] = useState(user?.assistantName || "AURA");
  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [businessType, setBusinessType] = useState(user?.businessType || "");
  const [businessDescription, setBusinessDescription] = useState(user?.businessDescription || "");
  const [tone, setTone] = useState(user?.tone || "friendly");
  const [theme, setTheme] = useState(user?.theme || "dark");
  const [geminiApiKey, setGeminiApiKey] = useState(user?.geminiApiKey || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Naya state script copy animation ke liye
  const [copied, setCopied] = useState(false);

  // SaaS Metrics Calculations
  const messagesUsed = user?.totalMessages || 0;
  const limit = user?.requestLimit || 200;
  const usagePercentage = Math.min((messagesUsed / limit) * 100, 100).toFixed(1);
  const costSaved = (messagesUsed * 0.05).toFixed(2); // Assuming each human chat costs $0.05

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
      const response = await axios.post("http://localhost:8000/api/user/save-assistant", {
        userEmail: user.email,
        assistantName,
        businessName,
        businessType,
        businessDescription,
        tone,
        theme,
        geminiApiKey
      });

      setMessage("✅ Assistant Saved & Trained Successfully!");
      // Update global user state so UI reflects changes immediately
      if (setUser && response.data.user) {
         setUser(response.data.user);
      }
    } catch (error) {
      console.error("Save Error:", error);
      setMessage("❌ Failed to save assistant settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const embedCode = `<script src="http://localhost:5173/assistant.js" data-user-id="${user?._id}"></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-10 px-4 sm:px-6 lg:px-8 overflow-y-auto w-full">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* 🔥 THE FLEX: SaaS Analytics Dashboard 🔥 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-down">
          {/* Card 1: Usage */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col justify-between hover:scale-105 transition-transform">
            <div>
              <h3 className="text-gray-500 font-medium text-sm">API Usage (Free Tier)</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-indigo-600">{messagesUsed}</span>
                <span className="text-gray-400 text-sm">/ {limit} msgs</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full ${usagePercentage > 80 ? 'bg-red-500' : 'bg-indigo-600'}`} style={{ width: `${usagePercentage}%` }}></div>
              </div>
              <p className="text-xs text-right text-gray-400 mt-1">{usagePercentage}% Used</p>
            </div>
          </div>

          {/* Card 2: Business Value */}
          <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl p-6 shadow-xl text-white flex flex-col justify-between hover:scale-105 transition-transform">
            <div>
              <h3 className="font-medium text-sm text-emerald-50">Estimated Value Generated</h3>
              <div className="mt-2 text-4xl font-extrabold">${costSaved}</div>
            </div>
            <p className="text-xs text-emerald-100 mt-4">Based on $0.05/chat human agent cost.</p>
          </div>

          {/* Card 3: Widget Status */}
          <div className="bg-gray-900 rounded-3xl p-6 shadow-xl text-white flex flex-col justify-between hover:scale-105 transition-transform">
            <div>
              <h3 className="font-medium text-sm text-gray-400">Current Plan</h3>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-3xl font-bold uppercase tracking-wider">{user?.plan || "FREE"}</span>
                {user?.plan === "pro" && <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-md">ACTIVE</span>}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${user?.geminiApiKey ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {user?.geminiApiKey ? "Custom API Connected" : "Using Default Keys"}
              </p>
            </div>
          </div>
        </div>

        {/* Builder Form */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in-up">
          
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-8 px-10 text-white">
            <h1 className="text-3xl font-extrabold tracking-tight">AI Assistant Builder</h1>
            <p className="mt-2 text-indigo-100 text-sm">
              Customize your AI voice agent. Fill in the details to train AURA for your specific business.
            </p>
          </div>

          <form onSubmit={handleSaveAssistant} className="py-8 px-10 space-y-8">
            {message && (
              <div className={`p-4 rounded-xl font-medium ${message.includes("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {message}
              </div>
            )}

            {/* 1. Basic Info */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">1. Brand Identity</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assistant Name</label>
                  <input type="text" value={assistantName} onChange={(e) => setAssistantName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50" placeholder="e.g. AURA" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50" placeholder="e.g. Acme Corp" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Type / Industry</label>
                  <input type="text" value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50" placeholder="e.g. E-commerce, SaaS, Real Estate" required />
                </div>
              </div>
            </div>

            {/* 2. Training Data */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">2. Core Knowledge (Training Data)</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Description & Rules</label>
                <textarea rows="5" value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 resize-none" placeholder="Explain what your business does. Give the AI instructions on how to answer. E.g., 'We sell red shoes. Always offer a 10% discount on first orders...'" required></textarea>
              </div>
            </div>

            {/* 3. Appearance */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">3. Widget Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Voice Tone</label>
                  <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50">
                    <option value="friendly">Friendly & Casual</option>
                    <option value="professional">Professional & Formal</option>
                    <option value="sales">Sales-Oriented (Persuasive)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bring Your Own Key (Optional)</label>
                  <input type="password" value={geminiApiKey} onChange={(e) => setGeminiApiKey(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50" placeholder="AIzaSy..." />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={isLoading} className={`w-full py-4 px-6 text-white text-lg font-bold rounded-2xl shadow-xl transition-all duration-300 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.01] hover:shadow-indigo-500/40'}`}>
                {isLoading ? "Saving & Training AI..." : "Deploy Assistant 🚀"}
              </button>
            </div>
          </form>

          {/* 🔥 EMBED CODE SECTION 🔥 */}
          {user?._id && (
            <div className="bg-gray-50 px-10 py-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Embed on your Website</h3>
              <p className="text-sm text-gray-500 mb-4">Copy and paste this script tag just before the closing <code>&lt;/body&gt;</code> tag of your HTML file.</p>
              <div className="relative">
                <pre className="bg-gray-900 text-emerald-400 p-4 rounded-xl text-sm overflow-x-auto border border-gray-700 shadow-inner">
                  <code>{embedCode}</code>
                </pre>
                <button onClick={copyToClipboard} className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors backdrop-blur-md">
                  {copied ? "Copied! ✅" : "Copy"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Builder;