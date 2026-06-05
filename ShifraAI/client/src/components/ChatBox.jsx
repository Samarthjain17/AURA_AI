import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const ChatBox = ({ user, currentChatId, isTemporary }) => { 
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, isLoading]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.email || !currentChatId) return;

      // 🕵️‍♂️ Agar temporary mode hai, toh Database se mat fetch karo
      if (isTemporary) {
        setMessages([{ role: "ai", text: "🕵️‍♂️ **Temporary Chat Active.** Your messages in this session will NOT be saved to the database." }]);
        return;
      }

      try {
        const response = await axios.post("http://localhost:8000/api/chat/history", {
          userEmail: user.email, chatId: currentChatId
        });
        if (response.data.messages.length > 0) setMessages(response.data.messages);
        else setMessages([{ role: "ai", text: "Hello! I am AURA. How can I assist you today? ✨" }]);
      } catch (error) {
        console.error("Failed to load history:", error);
      }
    };
    fetchHistory();
  }, [user, currentChatId, isTemporary]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || !user?.email) return;

    const userText = prompt;
    // Pura array save kar rahe hain taaki temp me bhej sakein
    const currentMessages = [...messages, { role: "user", text: userText }];
    setMessages(currentMessages);
    setPrompt(""); 
    setIsLoading(true); 

    try {
      const response = await axios.post("http://localhost:8000/api/chat/generate", {
        prompt: userText,
        userEmail: user.email,
        chatId: currentChatId,
        isTemporary: isTemporary,
        frontendMessages: currentMessages // Incognito me memory ke liye frontend se data bhej rahe
      });
      setMessages((prev) => [...prev, { role: "ai", text: response.data.answer }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "Oops! Connection error. 🔴" }]);
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    // UI bilkul same wahi purana rakho (divs wagera sab same):
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[85vh] bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl shadow-md overflow-x-auto ${
              msg.role === 'user' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none' : 'bg-[#1A2031] border border-gray-700/50 text-gray-200 rounded-bl-none'
            }`}>
              {msg.role === 'user' ? <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p> : <div className="leading-relaxed whitespace-pre-wrap flex flex-col gap-3"><ReactMarkdown>{msg.text}</ReactMarkdown></div>}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-[#1A2031] border border-gray-700/50 p-4 rounded-2xl rounded-bl-none flex gap-2 items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 sm:p-6 bg-transparent">
        <form onSubmit={handleSend} className="flex gap-3 relative group">
          <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={isLoading || !user} placeholder={isLoading ? "AURA is typing..." : "Message AURA AI..."} className="flex-1 bg-[#131825]/80 text-white px-6 py-4 rounded-2xl border border-gray-700 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40 transition-all duration-300 placeholder-gray-500 shadow-inner disabled:opacity-50" />
          <button type="submit" disabled={isLoading || !user} className={`absolute right-2 top-2 bottom-2 text-white px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 flex items-center justify-center ${isTemporary ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_0_10px_rgba(234,88,12,0.3)]' : 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_10px_rgba(147,51,234,0.3)]'}`}>Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;