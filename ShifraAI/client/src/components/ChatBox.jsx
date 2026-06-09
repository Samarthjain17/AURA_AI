import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatBox = ({ user, currentChatId, isTemporary, theme, isSidebarOpen, setIsSidebarOpen, activeVoiceURI, appLanguage }) => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); 
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isAgentMode, setIsAgentMode] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null); 
  const menuRef = useRef(null); 
  const recognitionRef = useRef(null); 
  const messagesEndRef = useRef(null);

  const isSpeakingRef = useRef(false); 
  const isAgentModeRef = useRef(false);
  const latestMessages = useRef([]);

  useEffect(() => { latestMessages.current = messages; }, [messages]);
  useEffect(() => { isAgentModeRef.current = isAgentMode; }, [isAgentMode]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, isLoading]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setShowAttachMenu(false);
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
        const response = await axios.post("http://localhost:8000/api/chat/history", { userEmail: user.email, chatId: currentChatId });
        if (response.data.messages.length > 0) setMessages(response.data.messages);
        else setMessages([{ role: "ai", text: "Hello! Pick a voice, set your language, and let's talk! ✨" }]);
      } catch (error) { console.error("Failed to load history:", error); }
    };
    fetchHistory();
  }, [user, currentChatId, isTemporary]);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (isAgentMode && lastMsg && lastMsg.role === 'ai' && !isLoading) {
       handleSpeak(lastMsg.text, messages.length - 1);
    }
  }, [messages, isLoading, isAgentMode]);

  // 🔥 NAYA FIX: THE UNIVERSAL MIC TOGGLE BUTTON 🔥
  const handleMicClick = () => {
    // 1. Agar AI bol raha hai, toh use chup karao (Stop Speaking)
    if (isSpeaking !== null) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
      setIsSpeaking(null);
    } 
    // 2. Agar mic already sun raha hai, toh use band karo (Stop Listening)
    else if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null; // Agent mode ko loop me fasne se rokne ke liye
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } 
    // 3. Agar kuch nahi ho raha, toh mic start karo (Start Listening)
    else {
      handleListen();
    }
  };

  const handleListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    
    if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = appLanguage === 'Hindi' ? 'hi-IN' : 'en-IN'; 
    recognition.continuous = true; 
    recognition.interimResults = true; 
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      let currentTranscript = '';
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
        if (event.results[i].isFinal) isFinal = true;
      }

      const textLoudAndClear = currentTranscript.trim();
      
      // True Barge-In: Jaise hi aawaz aayi, AI ko roko
      if (textLoudAndClear.length > 0 && isSpeakingRef.current) {
         window.speechSynthesis.cancel();
         isSpeakingRef.current = false;
         setIsSpeaking(null);
      }

      setPrompt(currentTranscript);
      
      // Agent Mode auto-sends on finish
      if (isFinal && isAgentModeRef.current && textLoudAndClear) {
        handleSendEvent(textLoudAndClear);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Agent Mode mein auto-restart
      if (isAgentModeRef.current) {
          try { recognition.start(); } catch(e) {} 
      }
    };
    
    recognition.onerror = (e) => {
      setIsListening(false);
      if (e.error === 'not-allowed') setIsAgentMode(false);
    };

    try { recognition.start(); } catch(e) {}
  };

  const handleSpeak = (text, index) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const cleanText = text.replace(/[*_#`]/g, ''); 
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      const isHindi = /[\u0900-\u097F]/.test(cleanText);
      const allVoices = window.speechSynthesis.getVoices();
      
      if (isHindi) {
          utterance.lang = 'hi-IN';
          utterance.rate = 0.9; 
          
          let hindiVoice = allVoices.find(v => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('aditi'));
          if (hindiVoice) {
              utterance.voice = hindiVoice;
          }
      } else if (activeVoiceURI) {
          utterance.lang = 'en-US';
          const selectedVoice = allVoices.find(v => v.voiceURI === activeVoiceURI);
          if (selectedVoice) utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
         setIsSpeaking(index);
         isSpeakingRef.current = true;
         if (isAgentModeRef.current && !isListening) {
             try { recognitionRef.current.start(); } catch(e){}
         }
      };

      utterance.onend = () => {
        setIsSpeaking(null);
        isSpeakingRef.current = false;
      };

      utterance.onerror = () => {
        setIsSpeaking(null);
        isSpeakingRef.current = false;
      };
      
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
    e.target.value = null; setShowAttachMenu(false); 
  };

  const getLanguageInstruction = () => {
     if (appLanguage === 'Hinglish') return "\n[SYSTEM RULE: You must write your response using the English alphabet (Hinglish). Do NOT use Devanagari script. Talk naturally.]";
     if (appLanguage === 'Hindi') return "\n[SYSTEM RULE: You must write your response purely in Hindi using the Devanagari script.]";
     return ""; 
  };

  const handleSendEvent = async (transcriptText) => {
     if (!transcriptText.trim()) return;
     window.speechSynthesis.cancel();
     isSpeakingRef.current = false;
     setIsSpeaking(null);

     const displayMessage = transcriptText;
     const currentMessages = [...latestMessages.current, { role: "user", text: displayMessage, image: null }];
     setMessages(currentMessages);
     setPrompt(""); 
     setIsLoading(true); 

     const sentPrompt = transcriptText + getLanguageInstruction();

     try {
       const response = await axios.post("http://localhost:8000/api/chat/generate", {
         prompt: sentPrompt, userEmail: user.email, chatId: currentChatId,
         isTemporary: isTemporary, frontendMessages: currentMessages, imageBase64: null 
       });
       setMessages((prev) => [...prev, { role: "ai", text: response.data.answer }]);
     } catch (error) {
       setMessages((prev) => [...prev, { role: "ai", text: "Oops! Connection error." }]);
     } finally { setIsLoading(false); }
  };

  const handleSendForm = async (e, customPrompt = null) => {
    if (e) e.preventDefault();
    const userText = customPrompt || prompt;
    if (!userText.trim() && !imagePreview) return;

    window.speechSynthesis.cancel();
    isSpeakingRef.current = false;
    setIsSpeaking(null);

    const displayMessage = userText || (imagePreview ? "🖼️ Sent an image" : "");
    const currentMessages = [...latestMessages.current, { role: "user", text: displayMessage, image: imagePreview }];
    
    setMessages(currentMessages);
    
    const sentPrompt = userText + getLanguageInstruction(); 
    const sentImage = imagePreview;
    
    setPrompt(""); setImagePreview(null); setShowAttachMenu(false); setIsLoading(true); 

    try {
      const response = await axios.post("http://localhost:8000/api/chat/generate", {
        prompt: sentPrompt, userEmail: user.email, chatId: currentChatId,
        isTemporary: isTemporary, frontendMessages: currentMessages, imageBase64: sentImage 
      });
      setMessages((prev) => [...prev, { role: "ai", text: response.data.answer }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "Oops! Connection error." }]);
    } finally { setIsLoading(false); }
  };

  const handleExportChat = () => { 
    if (messages.length === 0) return;
    let exportText = "--- AURA AI Chat Export ---\n\n";
    messages.forEach((m) => exportText += `[${m.role === 'user' ? 'You' : 'AURA'}]: ${m.text}\n\n`);
    const blob = new Blob([exportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `AURA_Chat_${new Date().toISOString().slice(0, 10)}.txt`; link.click();
    URL.revokeObjectURL(url);
  };

  const suggestions = [
    { icon: "💻", text: "Write a React component for a Navbar" },
    { icon: "📝", text: "Summarize the concept of Black Holes" },
    { icon: "✈️", text: "Plan a 3-day trip to Goa, India" }
  ];

  const toggleAgentMode = () => {
    const newMode = !isAgentMode;
    setIsAgentMode(newMode);
    if (newMode) {
      window.speechSynthesis.cancel(); 
      setIsSpeaking(null);
      isSpeakingRef.current = false;
      handleListen(); 
    } else {
      if (recognitionRef.current) {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop(); 
      }
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      isSpeakingRef.current = false;
      setIsListening(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-full bg-transparent overflow-x-hidden relative transition-colors duration-500">
      
      {!isSidebarOpen && (
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-[60] animate-fade-in-down">
          <button onClick={() => setIsSidebarOpen(true)} className={`flex items-center justify-center p-2.5 ${theme.accentTextLight} hover:text-white bg-black/20 backdrop-blur-md border ${theme.accentBorder} hover:${theme.accentBgLight} rounded-xl transition-all shadow-lg hover:scale-105`} title="Open Sidebar">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>
          </button>
        </div>
      )}

      {!isTemporary && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-10 z-[60] animate-fade-in-down">
          <button onClick={handleExportChat} className={`flex items-center gap-2.5 text-sm font-bold ${theme.accentTextLight} hover:text-white bg-black/20 backdrop-blur-md border-2 ${theme.accentBorder} hover:${theme.accentBgLight} px-5 py-2.5 rounded-full transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:scale-105`} title="Download Conversation">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            Export Chat
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto w-full custom-scrollbar pt-16 sm:pt-20">
        <div className="max-w-5xl mx-auto w-full p-4 sm:p-8 flex flex-col gap-8">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group animate-fade-in-up w-full`}>
              {msg.role === 'ai' && (<div className={`w-8 h-8 rounded-full ${theme.aiIconBg} flex items-center justify-center text-xs mr-3 mt-1 ${theme.shadowAi} shrink-0`}>✨</div>)}
              <div className={`max-w-[85%] md:max-w-[80%] p-5 rounded-3xl shadow-lg relative ${msg.role === 'user' ? `${theme.userMsgBg} text-white rounded-br-sm` : 'bg-black/30 border border-white/5 text-gray-200 rounded-bl-sm backdrop-blur-md'}`}>
                {msg.role === 'user' ? (
                  <div className="flex flex-col gap-3">
                    {msg.image && <img src={msg.image} alt="Uploaded preview" className="max-w-[200px] md:max-w-[250px] rounded-xl border border-white/20 shadow-md object-cover"/>}
                    {msg.text !== "🖼️ Sent an image" && msg.text && <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>}
                  </div>
                ) : (
                  <div className="leading-relaxed whitespace-pre-wrap flex flex-col gap-3 text-sm md:text-base prose prose-invert max-w-none break-words">
                    <ReactMarkdown components={{ code({ node, inline, className, children, ...props }) { const match = /language-(\w+)/.exec(className || ''); const codeString = String(children).replace(/\n$/, ''); return !inline && match ? ( <div className="relative mt-4 mb-4 rounded-xl overflow-hidden bg-black/60 border border-white/10 shadow-lg"> <div className="flex justify-between items-center px-4 py-2 bg-black/40 text-xs text-gray-400 border-b border-white/5"><span className="uppercase font-semibold tracking-wider">{match[1]}</span><button onClick={(e) => { navigator.clipboard.writeText(codeString); e.target.innerText = "Copied! ✔"; setTimeout(() => e.target.innerText = "Copy", 2000); }} className="hover:text-white transition-colors flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md hover:bg-white/10">Copy</button></div> <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }} {...props}>{codeString}</SyntaxHighlighter> </div> ) : (<code className={`${theme.accentBgLight} ${theme.accentTextLight} px-1.5 py-0.5 rounded-md font-mono text-sm`} {...props}>{children}</code>); } }}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                )}
                
                {msg.role === 'ai' && !isAgentMode && (
                  <button onClick={() => handleSpeak(msg.text, index)} className={`absolute -right-10 top-2 p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 ${isSpeaking === index ? `${theme.accentText} opacity-100` : 'text-gray-500 hover:text-white hover:bg-white/10'}`} title="Read Aloud">
                    {isSpeaking === index ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 animate-pulse"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.073.844-2.192 1.974A4.39 4.39 0 002.31 12c0 1.378.536 2.637 1.413 3.565.115 1.121 1.05 1.957 2.191 1.957h1.93l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06z" /><path d="M17.026 5.378c.328-.147.697-.04.935.253a9 9 0 010 12.738c-.238.293-.607.4-.935.253a.75.75 0 01-.426-.91 7.5 7.5 0 000-10.512.75.75 0 01.426-.91z" /><path d="M19.146 2.296c.351-.115.733.003.951.294a12 12 0 010 18.82c-.218.29-.6.41-.951.294a.75.75 0 01-.482-.93 10.5 10.5 0 000-16.618.75.75 0 01.482-.93z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* MAIN ORB */}
          {messages.length === 1 && !isLoading && !isTemporary && (
            <div className="flex flex-col items-center justify-center mt-12 mb-8 animate-fade-in-up w-full">
              <div className="relative flex items-center justify-center w-48 h-48 mb-4 group cursor-pointer" onClick={handleMicClick}>
                <div className={`absolute inset-0 rounded-full ${isSpeaking !== null ? 'bg-indigo-500' : theme.accentBgLight} animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20`}></div>
                <div className={`absolute inset-4 rounded-full ${isSpeaking !== null ? 'bg-indigo-500' : theme.accentBgLight} animate-pulse opacity-40`}></div>
                <div className={`absolute inset-8 rounded-full border border-white/10 animate-[spin_4s_linear_infinite]`}></div>
                <div className={`relative z-10 w-24 h-24 rounded-full ${isSpeaking !== null ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_80px_rgba(99,102,241,0.6)]' : theme.buttonBg} flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)] transition-all duration-500 group-hover:scale-110 ${isListening ? 'scale-125 shadow-[0_0_80px_rgba(255,255,255,0.4)]' : ''}`}>
                  
                  {isListening || isSpeaking !== null ? (
                    <div className="flex gap-1.5 items-center justify-center h-10">
                       <div className="w-1.5 h-4 bg-white rounded-full animate-[bounce_0.8s_infinite] shadow-[0_0_10px_white]"></div>
                       <div className="w-1.5 h-8 bg-white rounded-full animate-[bounce_0.8s_infinite_0.1s] shadow-[0_0_10px_white]"></div>
                       <div className="w-1.5 h-10 bg-white rounded-full animate-[bounce_0.8s_infinite_0.2s] shadow-[0_0_10px_white]"></div>
                       <div className="w-1.5 h-6 bg-white rounded-full animate-[bounce_0.8s_infinite_0.3s] shadow-[0_0_10px_white]"></div>
                    </div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white drop-shadow-lg"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
                  )}
                </div>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-600 mb-2 text-center tracking-tight drop-shadow-sm">Next-Gen Voice Platform</h2>
              <p className={`text-sm md:text-base font-medium text-center transition-colors duration-300 ${isSpeaking !== null ? 'text-indigo-400 font-bold' : isListening ? theme.accentText + ' animate-pulse' : 'text-gray-400'}`}>
                {isSpeaking !== null ? "AI speaking... Just speak to interrupt!" : isListening ? "Listening to your voice..." : "Tap the orb to start speaking"}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl relative z-20 mt-12">
                {suggestions.map((sug, i) => (
                  <button key={i} onClick={() => handleSendForm(null, sug.text)} className={`bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/5 p-5 rounded-3xl text-left transition-all duration-300 transform hover:-translate-y-2 hover:${theme.shadowAi} group`}>
                    <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">{sug.icon}</div>
                    <p className="text-sm text-gray-400 group-hover:text-white transition-colors">{sug.text}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
             <div className="flex justify-start animate-fade-in-up"><div className={`w-8 h-8 rounded-full ${theme.aiIconBg} flex items-center justify-center text-xs mr-3 ${theme.shadowAi} animate-pulse shrink-0`}>✨</div><div className="bg-black/30 border border-white/5 p-5 rounded-3xl rounded-bl-sm flex gap-2 items-center h-[52px]"><div className={`w-2 h-2 ${theme.loader} rounded-full animate-bounce`}></div><div className={`w-2 h-2 ${theme.loader} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div><div className={`w-2 h-2 ${theme.loader} rounded-full animate-bounce`} style={{ animationDelay: '0.4s' }}></div></div></div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="w-full bg-transparent px-4 pb-4 sm:px-6 sm:pb-6 relative z-10">
        <div className="max-w-5xl mx-auto w-full relative flex flex-col gap-2">
          
          <div className="flex justify-end pr-2">
             <button onClick={toggleAgentMode} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg ${isAgentMode ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-pulse' : 'bg-black/40 border border-white/10 text-gray-400 hover:text-white hover:bg-black/60'}`}>
                <div className={`w-2 h-2 rounded-full ${isAgentMode ? 'bg-white animate-ping' : 'bg-gray-500'}`}></div>
                {isAgentMode ? 'AGENT MODE: LIVE' : 'AGENT MODE: OFF'}
             </button>
          </div>

          <form onSubmit={handleSendForm} className={`flex flex-col bg-black/40 backdrop-blur-lg rounded-[32px] border border-white/10 shadow-2xl ${isAgentMode ? theme.accentBorder + ' shadow-[0_0_20px_rgba(255,255,255,0.1)]' : ''} ${theme.accentRing} transition-all overflow-hidden relative`}>
            
            {showAttachMenu && (
              <div ref={menuRef} className={`absolute bottom-[90px] left-4 ${theme.sidebarBg} border border-white/10 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 z-50 animate-fade-in-up w-56`}>
                <button type="button" onClick={() => fileInputRef.current.click()} className="flex items-center gap-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white p-3 rounded-xl transition-colors text-left font-medium"><span className="text-xl">🖼️</span> Upload image</button>
                <button type="button" onClick={() => cameraInputRef.current.click()} className="flex items-center gap-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white p-3 rounded-xl transition-colors text-left font-medium"><span className="text-xl">📸</span> Take photo</button>
              </div>
            )}

            {imagePreview && (
              <div className="px-5 pt-5 pb-1 animate-fade-in-up">
                <div className="relative inline-block group">
                  <img src={imagePreview} alt="Preview" className="h-16 w-16 md:h-20 md:w-20 object-cover rounded-2xl border border-gray-600/50 shadow-md" />
                  <button type="button" onClick={() => setImagePreview(null)} className="absolute -top-2 -right-2 bg-gray-700 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors shadow-lg">✕</button>
                </div>
              </div>
            )}

            <div className="flex gap-2 items-center p-2 pl-3">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
              <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageChange} className="hidden" />
              
              <button type="button" onClick={() => setShowAttachMenu(!showAttachMenu)} disabled={isLoading || !user || isAgentMode} className={`p-3 rounded-full transition-all duration-300 shrink-0 ${showAttachMenu ? 'bg-white/10 text-white transform rotate-45' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg></button>
              
              {/* 🔥 UPDATED MIC BUTTON IN FORM 🔥 */}
              <button type="button" onClick={handleMicClick} disabled={isLoading || !user || isAgentMode} className={`p-3 rounded-full transition-all duration-300 shrink-0 ${isSpeaking !== null || isListening ? 'bg-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
                 {isSpeaking !== null || isListening ? (
                    // STOP ICON (Agar sun raha hai ya bol raha hai)
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 animate-pulse"><path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" /></svg>
                 ) : (
                    // MIC ICON
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
                 )}
              </button>
              
              <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={isLoading || !user || isAgentMode} placeholder={isAgentMode ? "Agent LIVE... Just speak out loud!" : "Ask AURA anything..."} className="flex-1 bg-transparent text-white px-2 py-3 focus:outline-none placeholder-gray-500 disabled:opacity-50 min-w-0" />
              
              <button type="submit" disabled={isLoading || !user || (!prompt.trim() && !imagePreview) || isAgentMode} className="bg-white hover:bg-gray-200 text-black p-3.5 rounded-full font-medium transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.2)] disabled:opacity-30 flex items-center justify-center mr-1 shrink-0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transform -rotate-45 ml-1 mb-1"><path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" /></svg></button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;