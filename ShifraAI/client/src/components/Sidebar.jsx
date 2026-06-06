import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../utils/firebase.js'; 
import { signOut } from 'firebase/auth';
import axios from 'axios';

const Sidebar = ({ user, currentChatId, setCurrentChatId, isTemporary, setIsTemporary, theme, THEMES, activeThemeId, setActiveThemeId, isSidebarOpen, setIsSidebarOpen }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingChatId, setEditingChatId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, chatId: null });
  const [pendingDelete, setPendingDelete] = useState(null);
  const deleteTimeoutRef = useRef(null); 
  const [showSettings, setShowSettings] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      if (user?.email) {
        try {
          const res = await axios.post("http://localhost:8000/api/chat/all", { userEmail: user.email });
          setChatHistory(res.data);
        } catch (error) {}
      }
    };
    if (!isTemporary) fetchChats();
  }, [user, currentChatId, isTemporary]);

  const confirmLogout = async () => {
    // Popup band karo pehle hi
    setLogoutConfirm(false); 
    
    // 1. Firebase Logout (Agar fail hua toh bhi aage badho)
    try {
      await signOut(auth);
    } catch (error) {
      console.log("Firebase logout skip hua:", error.message);
    }

    // 2. Backend Cookie Clear (Agar server band ho toh bhi aage badho)
    try {
      await axios.post("http://localhost:8000/api/user/logout", {}, { withCredentials: true });
    } catch (error) {
      console.log("Backend cookie clear skip hua.");
    }

    // 3. BRAHMASTRA: Chahe jo ho jaye, Login page par bhej do!
    window.location.replace('/login'); 
  };
  const handleNewChat = () => { setIsTemporary(false); const newId = Date.now().toString(); setCurrentChatId(newId); localStorage.setItem('activeChatId', newId); };
  const handleTempChat = () => { setIsTemporary(true); const newId = "temp-" + Date.now(); setCurrentChatId(newId); localStorage.setItem('activeChatId', newId); };

  const handleRenameSubmit = async (chatId) => {
    if (!newTitle.trim()) { setEditingChatId(null); return; }
    setChatHistory(prev => prev.map(chat => chat.chatId === chatId ? { ...chat, title: newTitle } : chat));
    setEditingChatId(null);
    try { await axios.put("http://localhost:8000/api/chat/rename", { userEmail: user.email, chatId: chatId, newTitle: newTitle }); } catch (error) {}
  };

  const confirmDelete = () => {
    const chatId = deleteConfirm.chatId;
    const chatToDelete = chatHistory.find(c => c.chatId === chatId);
    setChatHistory(prev => prev.filter(chat => chat.chatId !== chatId));
    if (currentChatId === chatId) handleNewChat();
    setPendingDelete(chatToDelete);
    setDeleteConfirm({ isOpen: false, chatId: null });
    if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
    deleteTimeoutRef.current = setTimeout(async () => {
      try { await axios.post("http://localhost:8000/api/chat/clear", { userEmail: user.email, chatId: chatId }); } catch (error) {}
      setPendingDelete(null); 
    }, 5000); 
  };

  const handleUndo = () => {
    if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current); 
    if (pendingDelete) { setChatHistory(prev => [pendingDelete, ...prev]); setPendingDelete(null); }
  };

  const filteredChats = chatHistory.filter(chat => chat.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={`w-72 ${theme.sidebarBg} border-r border-white/5 flex-col h-full shadow-2xl relative z-[100] ${isSidebarOpen ? 'flex' : 'hidden'} shrink-0 transition-colors duration-500`}>
      
      <div className="p-6 pb-4 flex justify-between items-center">
        <h1 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${theme.gradientText} tracking-wider`}>
          AURA AI
        </h1>
        <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors" title="Close Sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
      </div>

      <div className="px-5 mb-4 flex flex-col gap-3">
        <button onClick={handleNewChat} className={`w-full text-white rounded-xl p-3.5 font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${!isTemporary ? theme.buttonBg + ' ' + theme.shadowBtn : 'bg-white/5 hover:bg-white/10'}`}>
          <span className="text-xl">+</span> New Chat
        </button>
        <button onClick={handleTempChat} className={`w-full text-white rounded-xl p-3.5 font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${isTemporary ? 'bg-gradient-to-r from-orange-600 to-red-600 shadow-[0_0_15px_rgba(234,88,12,0.4)]' : 'bg-white/5 hover:bg-white/10'}`}>
          <span className="text-xl">🕵️‍♂️</span> Temporary
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 custom-scrollbar flex flex-col">
        <div className="mb-4 relative shrink-0">
          <input type="text" placeholder="Search chats..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full bg-black/20 border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none ${theme.accentBorder} ${theme.accentRing} transition-all placeholder-gray-500`} />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
        </div>

        <p className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wider shrink-0 pl-1">Recent Chats</p>
        
        <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar pb-2">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div key={chat.chatId} className={`group flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 text-sm shrink-0 ${currentChatId === chat.chatId && !isTemporary ? theme.accentBgLight + ' ' + theme.accentText + ' border ' + theme.accentBorder : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'}`}>
                {editingChatId === chat.chatId ? (
                  <div className="flex-1 flex items-center gap-1 pr-1 w-full">
                    <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(chat.chatId)} autoFocus className={`flex-1 bg-black/30 border ${theme.accentBorder} text-white px-2 py-1.5 rounded-lg text-xs focus:outline-none w-full`} />
                    <button onClick={() => handleRenameSubmit(chat.chatId)} className="text-green-400 hover:text-green-300 p-1">✔</button>
                    <button onClick={() => setEditingChatId(null)} className="text-red-400 hover:text-red-300 p-1">✕</button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => { setIsTemporary(false); setCurrentChatId(chat.chatId); localStorage.setItem('activeChatId', chat.chatId); }} className="flex-1 text-left truncate px-1 font-medium">💬 {chat.title}</button>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 shrink-0">
                      <button onClick={() => { setEditingChatId(chat.chatId); setNewTitle(chat.title); }} className={`text-gray-400 ${theme.hoverText} p-1.5 transition-all transform hover:scale-110`} title="Rename Chat">✏️</button>
                      <button onClick={() => setDeleteConfirm({ isOpen: true, chatId: chat.chatId })} className="text-gray-400 hover:text-red-500 p-1.5 transition-all transform hover:scale-110" title="Delete Chat">🗑️</button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-600 text-xs mt-4">{searchQuery ? "No chats found" : "No recent chats"}</div>
          )}
        </div>
      </div>

      <div className="p-5 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-3 mb-5 px-1">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className={`w-11 h-11 rounded-full border-2 ${theme.accentBorder} ${theme.shadowAi}`} />
          ) : (
            <div className={`w-11 h-11 rounded-full ${theme.aiIconBg} flex items-center justify-center text-white font-bold text-lg`}>{user?.displayName ? user.displayName.charAt(0) : 'U'}</div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-200 truncate">{user?.displayName || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowSettings(true)} className="flex-1 flex items-center justify-center gap-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2.5 rounded-lg transition-all duration-300 font-medium text-sm">⚙️ Settings</button>
          <button onClick={() => setLogoutConfirm(true)} className="flex-1 flex items-center justify-center gap-2 text-gray-400 hover:text-white bg-white/5 hover:bg-red-500/20 hover:border-red-500/50 border border-transparent p-2.5 rounded-lg transition-all duration-300 group font-medium text-sm">
            <span className="group-hover:text-red-400 transition-colors">Logout</span>
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className={`${theme.sidebarBg} border border-white/10 p-6 rounded-2xl w-[350px] shadow-2xl transform transition-all`}>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-white">⚙️ App Settings</h2>
            <h3 className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">Select Theme</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {Object.values(THEMES).map((t) => (
                <button key={t.id} onClick={() => setActiveThemeId(t.id)} className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${activeThemeId === t.id ? t.accentBorder + ' ' + t.accentBgLight : 'border-transparent bg-white/5 hover:bg-white/10'}`}>
                  <div className={`w-full h-8 rounded-lg ${t.buttonBg}`}></div>
                  <span className={`text-xs font-semibold ${activeThemeId === t.id ? 'text-white' : 'text-gray-400'}`}>{t.name}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowSettings(false)} className={`w-full py-3 rounded-xl text-white font-medium shadow-lg transition-all hover:scale-[1.02] ${theme.buttonBg}`}>Save & Close</button>
          </div>
        </div>
      )}

      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className={`${theme.sidebarBg} border border-white/10 p-6 rounded-2xl w-80 shadow-2xl`}><h3 className="text-white font-bold mb-2">⚠️ Delete Chat?</h3><div className="flex gap-3 mt-6"><button onClick={() => setDeleteConfirm({ isOpen: false, chatId: null })} className="flex-1 bg-white/10 text-white py-2 rounded-xl hover:bg-white/20 transition-colors">Cancel</button><button onClick={confirmDelete} className="flex-1 bg-red-600/80 text-white py-2 rounded-xl hover:bg-red-500 transition-colors">Yes, Delete</button></div></div>
        </div>
      )}

      {logoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className={`${theme.sidebarBg} border border-white/10 p-6 rounded-2xl w-80 shadow-2xl transform transition-all animate-fade-in-up`}>
            <h3 className="text-white font-bold mb-2 text-lg flex items-center gap-2">👋 Leaving so soon?</h3>
            <p className="text-gray-400 text-sm mb-6">Are you sure you want to log out of AURA AI?</p>
            <div className="flex gap-3">
              <button onClick={() => setLogoutConfirm(false)} className="flex-1 bg-white/10 text-white py-2.5 rounded-xl hover:bg-white/20 transition-colors font-medium">Cancel</button>
              <button onClick={confirmLogout} className="flex-1 bg-red-600/80 text-white py-2.5 rounded-xl hover:bg-red-500 transition-colors font-medium shadow-[0_0_15px_rgba(220,38,38,0.4)]">Yes, Logout</button>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className={`fixed bottom-10 right-10 w-72 ${theme.sidebarBg} text-gray-200 text-base p-4 rounded-2xl flex justify-between items-center shadow-2xl border border-white/10 z-[200]`}>
          <div className="flex items-center gap-3"><span>🗑️</span><span className="font-medium">Deleted</span></div>
          <button onClick={handleUndo} className={`${theme.accentText} font-bold hover:opacity-80 transition-opacity`}>Undo</button>
        </div>
      )}

    </div>
  );
};

export default Sidebar;