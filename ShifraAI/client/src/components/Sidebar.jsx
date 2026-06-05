import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../utils/firebase.js'; 
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Sidebar = ({ user, currentChatId, setCurrentChatId, isTemporary, setIsTemporary, theme, THEMES, activeThemeId, setActiveThemeId }) => {
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [editingChatId, setEditingChatId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, chatId: null });
  const [pendingDelete, setPendingDelete] = useState(null);
  const deleteTimeoutRef = useRef(null); 

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      if (user?.email) {
        try {
          const res = await axios.post("http://localhost:8000/api/chat/all", { userEmail: user.email });
          setChatHistory(res.data);
        } catch (error) {
          console.error("Error fetching chats", error);
        }
      }
    };
    if (!isTemporary) fetchChats();
  }, [user, currentChatId, isTemporary]);

  const handleLogout = async () => {
    try { await signOut(auth); navigate('/login'); } catch (error) {}
  };

  const handleNewChat = () => {
    setIsTemporary(false); 
    const newId = Date.now().toString();
    setCurrentChatId(newId);
    localStorage.setItem('activeChatId', newId);
  };

  const handleTempChat = () => {
    setIsTemporary(true); 
    const newId = "temp-" + Date.now();
    setCurrentChatId(newId); 
    localStorage.setItem('activeChatId', newId);
  };

  const handleRenameSubmit = async (chatId) => {
    if (!newTitle.trim()) { setEditingChatId(null); return; }
    setChatHistory(prev => prev.map(chat => chat.chatId === chatId ? { ...chat, title: newTitle } : chat));
    setEditingChatId(null);
    try {
      await axios.put("http://localhost:8000/api/chat/rename", { userEmail: user.email, chatId: chatId, newTitle: newTitle });
    } catch (error) {}
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
    <div className={`w-64 ${theme.sidebarBg} border-r border-white/5 flex flex-col h-full shadow-2xl relative z-[100] hidden md:flex shrink-0 transition-colors duration-500`}>
      
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <h1 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${theme.gradientText} tracking-wider`}>
          AURA AI
        </h1>
      </div>

      {/* Action Buttons */}
      <div className="px-4 mb-4 flex flex-col gap-2">
        <button onClick={handleNewChat} className={`w-full text-white rounded-xl p-3 font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${!isTemporary ? theme.buttonBg + ' ' + theme.shadowBtn : 'bg-white/5 hover:bg-white/10'}`}>
          <span className="text-xl">+</span> New Chat
        </button>
        <button onClick={handleTempChat} className={`w-full text-white rounded-xl p-3 font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${isTemporary ? 'bg-gradient-to-r from-orange-600 to-red-600 shadow-[0_0_15px_rgba(234,88,12,0.4)]' : 'bg-white/5 hover:bg-white/10'}`}>
          <span className="text-xl">🕵️‍♂️</span> Temporary
        </button>
      </div>

      {/* Chat History Section */}
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar flex flex-col">
        
        {/* Search Bar */}
        <div className="mb-4 relative shrink-0">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-black/20 border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none ${theme.accentBorder} ${theme.accentRing} transition-all placeholder-gray-500`}
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-3.5 top-3 text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>

        <p className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wider shrink-0">Recent Chats</p>
        
        <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar pb-2">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div key={chat.chatId} className={`group flex items-center justify-between p-2 rounded-xl transition-all duration-200 text-sm shrink-0 ${currentChatId === chat.chatId && !isTemporary ? theme.accentBgLight + ' ' + theme.accentText + ' border ' + theme.accentBorder : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'}`}>
                {editingChatId === chat.chatId ? (
                  <div className="flex-1 flex items-center gap-1 pr-1 w-full">
                    <input 
                      type="text" 
                      value={newTitle} 
                      onChange={(e) => setNewTitle(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(chat.chatId)} 
                      autoFocus 
                      className={`flex-1 bg-black/30 border ${theme.accentBorder} text-white px-2 py-1.5 rounded-lg text-xs focus:outline-none w-full`} 
                    />
                    <button onClick={() => handleRenameSubmit(chat.chatId)} className="text-green-400 hover:text-green-300 p-1" title="Save">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                    </button>
                    <button onClick={() => setEditingChatId(null)} className="text-red-400 hover:text-red-300 p-1" title="Cancel">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => { setIsTemporary(false); setCurrentChatId(chat.chatId); localStorage.setItem('activeChatId', chat.chatId); }} className="flex-1 text-left truncate px-1">
                      💬 {chat.title}
                    </button>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 shrink-0">
                      <button onClick={() => { setEditingChatId(chat.chatId); setNewTitle(chat.title); }} className={`text-gray-400 ${theme.hoverText} p-1 transition-all transform hover:scale-110`} title="Rename Chat">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                      </button>
                      <button onClick={() => setDeleteConfirm({ isOpen: true, chatId: chat.chatId })} className="text-gray-400 hover:text-red-500 p-1 transition-all transform hover:scale-110" title="Delete Chat">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
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

      {/* User Profile & Settings */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-3 mb-4 px-2">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className={`w-10 h-10 rounded-full border ${theme.accentBorder} ${theme.shadowAi}`} />
          ) : (
            <div className={`w-10 h-10 rounded-full ${theme.aiIconBg} flex items-center justify-center text-white font-bold`}>{user?.displayName ? user.displayName.charAt(0) : 'U'}</div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-200 truncate">{user?.displayName || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setShowSettings(true)} className="flex-1 flex items-center justify-center gap-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-all duration-300 font-medium text-sm">
            ⚙️ Settings
          </button>
          
          <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 text-gray-400 hover:text-white bg-white/5 hover:bg-red-500/20 hover:border-red-500/50 border border-transparent p-2 rounded-lg transition-all duration-300 group font-medium text-sm">
            <span className="group-hover:text-red-400 transition-colors">Logout</span>
          </button>
        </div>
      </div>

      {/* THEME SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className={`${theme.sidebarBg} border border-white/10 p-6 rounded-2xl w-[350px] shadow-2xl transform transition-all`}>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-white">⚙️ App Settings</h2>
            <h3 className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">Select Theme</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {Object.values(THEMES).map((t) => (
                <button 
                  key={t.id}
                  onClick={() => setActiveThemeId(t.id)}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${activeThemeId === t.id ? t.accentBorder + ' ' + t.accentBgLight : 'border-transparent bg-white/5 hover:bg-white/10'}`}
                >
                  <div className={`w-full h-8 rounded-lg ${t.buttonBg}`}></div>
                  <span className={`text-xs font-semibold ${activeThemeId === t.id ? 'text-white' : 'text-gray-400'}`}>{t.name}</span>
                </button>
              ))}
            </div>

            <button onClick={() => setShowSettings(false)} className={`w-full py-3 rounded-xl text-white font-medium shadow-lg transition-all hover:scale-[1.02] ${theme.buttonBg}`}>
              Save & Close
            </button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className={`${theme.sidebarBg} border border-white/10 p-6 rounded-2xl w-80 shadow-2xl transform transition-all`}>
            <h3 className="text-white font-bold mb-2 text-lg flex items-center gap-2">⚠️ Delete Chat?</h3>
            <p className="text-gray-400 text-sm mb-6">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirm({ isOpen: false, chatId: null })} 
                className="flex-1 bg-white/10 text-white py-2.5 rounded-xl hover:bg-white/20 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 bg-red-600/80 text-white py-2.5 rounded-xl hover:bg-red-500 transition-colors font-medium shadow-[0_0_15px_rgba(220,38,38,0.4)]"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNDO TOAST NOTIFICATION */}
      {pendingDelete && (
        <div className={`fixed bottom-10 right-10 w-72 ${theme.sidebarBg} text-gray-200 text-base p-4 rounded-2xl flex justify-between items-center shadow-2xl border border-white/10 z-[200] transform transition-all animate-fade-in-up`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">🗑️</span>
            <span className="font-medium">Chat deleted</span>
          </div>
          <button onClick={handleUndo} className={`${theme.accentText} font-bold hover:opacity-80 transition-opacity px-2 py-1 rounded-lg`}>
            Undo
          </button>
        </div>
      )}

    </div>
  );
};

export default Sidebar;