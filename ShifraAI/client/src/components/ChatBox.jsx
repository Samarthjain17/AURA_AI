import React, { useState } from 'react';

const ChatBox = () => {
  const [prompt, setPrompt] = useState("");
  // Messages store karne ke liye state (ek dummy welcome message ke sath)
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I am AURA. How can I assist you today? ✨" }
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // 1. User ka message screen par dikhao
    const newUserMessage = { role: "user", text: prompt };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    
    // Input box khali karo
    setPrompt(""); 

    // 2. Dummy AI Response (Jab tak hum asli backend nahi lagate)
    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages, 
        { role: "ai", text: "I'm processing your request. Real AI connection coming soon! 🚀" }
      ]);
    }, 1000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[85vh] bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
      
      {/* 🟢 Messages Area (Yahan hamari baatcheet dikhegi) */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
        
        {messages.length === 0 ? (
          // Agar koi message nahi hai toh ye dikhao
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
             <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-pulse">
                <span className="text-2xl">✨</span>
             </div>
            <h2 className="text-2xl font-semibold text-white tracking-wide">How can I help you today?</h2>
          </div>
        ) : (
          // Agar messages hain toh unko map karke dikhao
          messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl shadow-md ${
                msg.role === 'user' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none' 
                : 'bg-[#1A2031] border border-gray-700/50 text-gray-200 rounded-bl-none'
              }`}>
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🔵 3D Input Area */}
      <div className="p-4 sm:p-6 bg-transparent">
        <form onSubmit={handleSend} className="flex gap-3 relative group">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Message AURA AI..."
            className="flex-1 bg-[#131825]/80 text-white px-6 py-4 rounded-2xl border border-gray-700 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40 transition-all duration-300 placeholder-gray-500 shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white px-6 rounded-xl font-medium transition-all duration-300 shadow-[0_0_10px_rgba(147,51,234,0.3)] hover:shadow-[0_0_20px_rgba(147,51,234,0.6)] transform hover:scale-105 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </form>
        <p className="text-center text-xs text-gray-500 mt-3">AURA AI can make mistakes. Consider verifying important information.</p>
      </div>
      
    </div>
  );
};

export default ChatBox;