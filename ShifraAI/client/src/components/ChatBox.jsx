import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const ChatBox = () => {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState([
        { role: "ai", text: "Hello! I am AURA. How can I assist you today? ✨" }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        const userText = prompt;

        setMessages((prev) => [...prev, { role: "user", text: userText }]);
        setPrompt("");
        setIsLoading(true);

        try {
            const response = await axios.post("http://localhost:8000/api/chat/generate", {
                prompt: userText
            });

            setMessages((prev) => [...prev, { role: "ai", text: response.data.answer }]);

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "ai", text: "Oops! Connection error. Make sure backend is running properly. 🔴" }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col h-[85vh] bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">

            {/* 🟢 Messages Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar">

                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {/* overflow-x-auto add kiya hai taaki code block screen ke bahar na jaye */}
                        <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl shadow-md overflow-x-auto ${msg.role === 'user'
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none'
                                : 'bg-[#1A2031] border border-gray-700/50 text-gray-200 rounded-bl-none'
                            }`}>

                            {/* Yahan Markdown ka Magic hai */}
                            {msg.role === 'user' ? (
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            ) : (
                                <div className="leading-relaxed whitespace-pre-wrap flex flex-col gap-3">
                                    <ReactMarkdown>
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* ⏳ Loading Animation */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-[#1A2031] border border-gray-700/50 p-4 rounded-2xl rounded-bl-none flex gap-2 items-center">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                )}
            </div>

            {/* 🔵 Input Area */}
            <div className="p-4 sm:p-6 bg-transparent">
                <form onSubmit={handleSend} className="flex gap-3 relative group">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isLoading}
                        placeholder={isLoading ? "AURA is typing..." : "Message AURA AI..."}
                        className="flex-1 bg-[#131825]/80 text-white px-6 py-4 rounded-2xl border border-gray-700 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40 transition-all duration-300 placeholder-gray-500 shadow-inner disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white px-6 rounded-xl font-medium transition-all duration-300 shadow-[0_0_10px_rgba(147,51,234,0.3)] hover:shadow-[0_0_20px_rgba(147,51,234,0.6)] transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center"
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