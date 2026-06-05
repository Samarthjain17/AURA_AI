import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
// 🔥 Naye imports syntax highlighter ke liye
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatBox = ({ user, currentChatId, isTemporary }) => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(null);
  
  const [imagePreview, setImagePreview] = useState(null); 
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null); 
  const menuRef = useRef(null); 

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => scrollToBottom(), [messages, isLoading]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.email || !currentChatId) return;

      if (isTemporary) {
        setMessages([{ role: "ai", text: "🕵️‍♂️ **Temporary Chat Active.** Your messages will disappear once you leave." }]);
        return;
      }

      try {
        const response = await axios.post("http://localhost:8000/api/chat/history", {
          userEmail: user.email, chatId: currentChatId
        });
        if (response.data.messages.length > 0) {
          setMessages(response.data.messages);
        } else {
          setMessages([{ role: "ai", text: "Hello! I am AURA. How can I assist you today? ✨" }]);
        }
      } catch (error) {
        console.error("Failed to load history:", error);
      }
    };
    fetchHistory();
  }, [user, currentChatId, isTemporary]);

  const handleListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Your browser doesn't support Voice Typing."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; 
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => setPrompt(event.results[0][0].transcript);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const handleSpeak = (text, index) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking === index) {
        window.speechSynthesis.cancel(); 
        setIsSpeaking(null); return;
      }
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`]/g, ''); 
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setIsSpeaking(null);
      setIsSpeaking(index);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result); 
      reader.readAsDataURL(file);
    }
    e.target.value = null; 
    setShowAttachMenu(false); 
  };

  const handleSend = async (e, customPrompt = null) => {
    if (e) e.preventDefault();
    const userText = customPrompt || prompt;
    
    if (!userText.trim() && !imagePreview) return;

    const displayMessage = userText || (imagePreview ? "🖼️ Sent an image" : "");
    const currentMessages = [...messages, { role: "user", text: displayMessage, image: imagePreview }];
    
    setMessages(currentMessages);
    
    const sentPrompt = userText;
    const sentImage = imagePreview;
    
    setPrompt(""); 
    setImagePreview(null);
    setShowAttachMenu(false);
    setIsLoading(true); 

    try {
      const response = await axios.post("http://localhost:8000/api/chat/generate", {
        prompt: sentPrompt,
        userEmail: user.email,
        chatId: currentChatId,
        isTemporary: isTemporary,
        frontendMessages: currentMessages,
        imageBase64: sentImage 
      });
      setMessages((prev) => [...prev, { role: "ai", text: response.data.answer }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "Oops! Connection error. 🔴 Please try again." }]);
    } finally {
      setIsLoading(false); 
    }
  };

  const suggestions = [
    { icon: "💻", text: "Write a React component for a Navbar" },
    { icon: "📝", text: "Summarize the concept of Black Holes" },
    { icon: "✈️", text: "Plan a 3-day trip to Goa, India" }
  ];

  return (
    <div className="w-full flex flex-col h-full bg-transparent overflow-x-hidden relative">
      <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
        <div className="max-w-5xl mx-auto w-full p-4 sm:p-8 flex flex-col gap-8">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group animate-fade-in-up w-full`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xs mr-3 mt-1 shadow-[0_0_10px_rgba(147,51,234,0.3)] shrink-0">✨</div>
              )}

              <div className={`max-w-[85%] md:max-w-[80%] p-5 rounded-3xl shadow-lg relative ${msg.role === 'user' ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-sm' : 'bg-[#131825]/90 border border-white/5 text-gray-200 rounded-bl-sm'}`}>
                {msg.role === 'user' ? (
                  <div className="flex flex-col gap-3">
                    {msg.image && (
                      <img src={msg.image} alt="Uploaded preview" className="max-w-[200px] md:max-w-[250px] rounded-xl border border-white/20 shadow-md object-cover"/>
                    )}
                    {msg.text !== "🖼️ Sent an image" && msg.text && (
                      <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                    )}
                  </div>
                ) : (
                  <div className="leading-relaxed whitespace-pre-wrap flex flex-col gap-3 text-sm md:text-base prose prose-invert max-w-none break-words">
                    
                    {/* 🔥 Yahan humne ReactMarkdown ko Code Highlighter sikha diya hai */}
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          const codeString = String(children).replace(/\n$/, '');
                          
                          return !inline && match ? (
                            <div className="relative mt-4 mb-4 rounded-xl overflow-hidden bg-[#1E1E1E] border border-white/10 shadow-lg">
                              <div className="flex justify-between items-center px-4 py-2 bg-[#2D2D2D] text-xs text-gray-400 border-b border-white/5">
                                <span className="uppercase font-semibold tracking-wider">{match[1]}</span>
                                <button 
                                  onClick={(e) => {
                                    navigator.clipboard.writeText(codeString);
                                    e.target.innerText = "Copied! ✔";
                                    setTimeout(() => e.target.innerText = "Copy", 2000);
                                  }}
                                  className="hover:text-white transition-colors flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md hover:bg-white/10"
                                >
                                  Copy
                                </button>
                              </div>
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                                {...props}
                              >
                                {codeString}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-md font-mono text-sm" {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>

                  </div>
                )}
                
                {msg.role === 'ai' && (
                  <button onClick={() => handleSpeak(msg.text, index)} className={`absolute -right-10 top-2 p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 ${isSpeaking === index ? 'text-purple-400 opacity-100' : 'text-gray-500 hover:text-white hover:bg-white/10'}`} title="Read Aloud">
                    {isSpeaking === index ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 animate-pulse"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.073.844-2.192 1.974A4.39 4.39 0 002.31 12c0 1.378.536 2.637 1.413 3.565.115 1.121 1.05 1.957 2.191 1.957h1.93l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06z" /><path d="M17.026 5.378c.328-.147.697-.04.935.253a9 9 0 010 12.738c-.238.293-.607.4-.935.253a.75.75 0 01-.426-.91 7.5 7.5 0 000-10.512.75.75 0 01.426-.91z" /><path d="M19.146 2.296c.351-.115.733.003.951.294a12 12 0 010 18.82c-.218.29-.6.41-.951.294a.75.75 0 01-.482-.93 10.5 10.5 0 000-16.618.75.75 0 01.482-.93z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>}
                  </button>
                )}
              </div>
            </div>
          ))}

          {messages.length === 1 && !isLoading && !isTemporary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-auto mb-4">
              {suggestions.map((sug, i) => (
                <button key={i} onClick={() => handleSend(null, sug.text)} className="bg-[#1A2031]/60 hover:bg-[#232B40] border border-white/5 p-4 rounded-3xl text-left transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(147,51,234,0.2)] group">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{sug.icon}</div>
                  <p className="text-sm text-gray-400 group-hover:text-gray-200">{sug.text}</p>
                </button>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xs mr-3 shadow-[0_0_10px_rgba(147,51,234,0.5)] animate-pulse shrink-0">✨</div>
              <div className="bg-[#131825]/90 border border-white/5 p-5 rounded-3xl rounded-bl-sm flex gap-2 items-center h-[52px]">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="w-full bg-transparent px-4 pb-4 sm:px-6 sm:pb-6 relative z-10">
        <div className="max-w-5xl mx-auto w-full relative">
          {showAttachMenu && (
            <div ref={menuRef} className="absolute bottom-[75px] left-4 bg-[#1A2031] border border-gray-700 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 z-50 animate-fade-in-up w-56">
              <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-3 text-sm text-gray-300 hover:bg-[#232B40] hover:text-white p-3 rounded-xl transition-colors text-left font-medium">
                <span className="text-xl">🖼️</span> Upload image
              </button>
              <button onClick={() => cameraInputRef.current.click()} className="flex items-center gap-3 text-sm text-gray-300 hover:bg-[#232B40] hover:text-white p-3 rounded-xl transition-colors text-left font-medium">
                <span className="text-xl">📸</span> Take photo
              </button>
            </div>
          )}
          <form onSubmit={handleSend} className="flex flex-col bg-[#131825] rounded-[32px] border border-gray-700/60 shadow-[0_0_40px_rgba(0,0,0,0.5)] focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/30 transition-all overflow-hidden relative">
            {imagePreview && (
              <div className="px-5 pt-5 pb-1 animate-fade-in-up">
                <div className="relative inline-block group">
                  <img src={imagePreview} alt="Preview" className="h-16 w-16 md:h-20 md:w-20 object-cover rounded-2xl border border-gray-600/50 shadow-md" />
                  <button type="button" onClick={() => setImagePreview(null)} className="absolute -top-2 -right-2 bg-gray-700 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors shadow-lg" title="Remove Image">✕</button>
                </div>
              </div>
            )}
            <div className="flex gap-2 items-center p-2 pl-3">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
              <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageChange} className="hidden" />
              <button type="button" onClick={() => setShowAttachMenu(!showAttachMenu)} disabled={isLoading || !user} className={`p-3 rounded-full transition-all duration-300 shrink-0 ${showAttachMenu ? 'bg-white/10 text-white transform rotate-45' : 'text-gray-400 hover:text-white hover:bg-white/10'}`} title="Add attachment">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </button>
              <button type="button" onClick={handleListen} disabled={isLoading || !user} className={`p-3 rounded-full transition-all duration-300 shrink-0 ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/10'}`} title="Voice Typing">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
              </button>
              <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={isLoading || !user || isListening} placeholder={isListening ? "Listening..." : imagePreview ? "Add a message..." : "Ask AURA anything..."} className="flex-1 bg-transparent text-white px-2 py-3 focus:outline-none placeholder-gray-500 disabled:opacity-50 min-w-0" />
              <button type="submit" disabled={isLoading || !user || (!prompt.trim() && !imagePreview)} className="bg-white hover:bg-gray-200 text-black p-3.5 rounded-full font-medium transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.2)] disabled:opacity-30 disabled:grayscale flex items-center justify-center mr-1 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transform -rotate-45 ml-1 mb-1"><path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" /></svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;