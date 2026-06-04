import React, { useState } from 'react';

const ChatBox = () => {
  const [prompt, setPrompt] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return; // Agar khali hai toh kuch mat karo
    console.log("User Prompt:", prompt); 
    // Agle chapter me hum isko actual AI backend se connect karenge!
    setPrompt(""); 
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 flex flex-col h-[70vh] bg-[#131825] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* 🟢 Messages Area (Yahan hamari baatcheet dikhegi) */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="h-full flex items-center justify-center text-gray-500">
          <p className="border border-gray-700/50 bg-[#0F131D] px-6 py-3 rounded-full text-sm">
            Send a message to start chatting with AURA AI... ✨
          </p>
        </div>
      </div>

      {/* 🔵 Input Box Area (Jahan user type karega) */}
      <div className="p-4 bg-[#0F131D] border-t border-gray-800">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Message AURA AI..."
            className="flex-1 bg-[#1A2031] text-white px-6 py-4 rounded-xl border border-gray-700 focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-500"
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-purple-500/20"
          >
            Send
          </button>
        </form>
      </div>
      
    </div>
  );
};

export default ChatBox;