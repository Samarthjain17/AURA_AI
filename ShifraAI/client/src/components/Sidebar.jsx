import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../utils/firebase.js'; 
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Sidebar = ({ user, currentChatId, setCurrentChatId, isTemporary, setIsTemporary }) => {
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState([]);
  
  // 🟢 States Pop-up aur Undo ke liye
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, chatId: null });
  const [pendingDelete, setPendingDelete] = useState(null);
  const deleteTimeoutRef = useRef(null); 

  // Backend se saari chats fetch karo
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
    setCurrentChatId(Date.now().toString());
  };

  const handleTempChat = () => {
    setIsTemporary(true); 
    setCurrentChatId("temp-" + Date.now()); 
  };

  // 🗑️ Delete logic with UNDO Timeout
  const confirmDelete = () => {
    const chatId = deleteConfirm.chatId;
    const chatToDelete = chatHistory.find(c => c.chatId === chatId);

    // 1. Pehle screen se turant gayab kardo
    setChatHistory(prev => prev.filter(chat => chat.chatId !== chatId));
    if (currentChatId === chatId) handleNewChat();
    
    // 2. Undo Box dikhane ke liye data save karo aur Modal band karo
    setPendingDelete(chatToDelete);
    setDeleteConfirm({ isOpen: false, chatId: null });

    if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);

    // 3. 5 Second ka Timer lagao asli Delete ke liye
    deleteTimeoutRef.current = setTimeout(async () => {
      try {
        await axios.post("http://localhost:8000/api/chat/clear", { 
          userEmail: user.email, 
          chatId: chatId 
        });
      } catch (error) {
        console.error("Error deleting:", error);
      }
      setPendingDelete(null); 
    }, 5000); 
  };

  // ⏪ UNDO Function: Delete rokne ke liye
  const handleUndo = () => {
    if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current); 
    if (pendingDelete) {
      setChatHistory(prev => [pendingDelete, ...prev]);
      setPendingDelete(null); 
    }
  };

  return (
    <div className="w-64 bg-[#0A0D14] border-r border-gray-800 flex flex-col h-full shadow-2xl relative z-10 hidden md:flex">
      
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 tracking-wider">
          AURA AI
        </h1>
      </div>

      <div className="px-4 mb-4 flex flex-col gap-2">
        <button onClick={handleNewChat} className={`w-full text-white rounded-xl p-3 font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${!isTemporary ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-gray-800 hover:bg-gray-700'}`}>
          <span className="text-xl">+</span> New Chat
        </button>
        <button onClick={handleTempChat} className={`w-full text-white rounded-xl p-3 font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${isTemporary ? 'bg-gradient-to-r from-orange-600 to-red-600 shadow-[0_0_15px_rgba(234,88,12,0.4)]' : 'bg-gray-800 hover:bg-gray-700'}`}>
          <span className="text-xl">🕵️‍♂️</span> Temporary
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <p className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wider">Recent Chats</p>
        <div className="flex flex-col gap-2">
          {chatHistory.map((chat) => (
            <div key={chat.chatId} className={`group flex items-center justify-between p-2 rounded-xl transition-all duration-200 text-sm ${currentChatId === chat.chatId && !isTemporary ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}>
              <button onClick={() => { setIsTemporary(false); setCurrentChatId(chat.chatId); }} className="flex-1 text-left truncate px-1">
                💬 {chat.title}
              </button>
              
              <button 
                onClick={() => setDeleteConfirm({ isOpen: true, chatId: chat.chatId })} 
                className="opacity-0 group-hover:opacity-100 text-white hover:text-red-500 p-1 transition-all duration-300 transform hover:scale-110" 
                title="Delete Chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-800 bg-[#0D111A]">
        <div className="flex items-center gap-3 mb-4 px-2">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-purple-500/50 shadow-[0_0_10px_rgba(147,51,234,0.2)]" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
              {user?.displayName ? user.displayName.charAt(0) : 'U'}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-200 truncate">{user?.displayName || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-red-500/20 hover:border-red-500/50 border border-transparent p-2 rounded-lg transition-all duration-300 group">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:text-red-400 transition-colors">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          <span className="font-medium group-hover:text-red-400 transition-colors">Logout</span>
        </button>
      </div>

      {/* 🔴 CONFIRMATION POP-UP (Modal) - Poori Screen Par */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1A2031] border border-gray-700 p-6 rounded-2xl w-80 shadow-2xl transform transition-all">
            <h3 className="text-white font-bold mb-2 text-lg flex items-center gap-2">
              ⚠️ Delete Chat?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirm({ isOpen: false, chatId: null })} 
                className="flex-1 bg-gray-700 text-white py-2.5 rounded-xl hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-500 transition-colors font-medium shadow-[0_0_15px_rgba(220,38,38,0.4)]"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⏪ UNDO TOAST NOTIFICATION (Bottom Right Corner) */}
      {pendingDelete && (
        <div className="fixed bottom-10 right-10 w-72 bg-[#1A2031] text-gray-200 text-base p-4 rounded-2xl flex justify-between items-center shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-gray-700 z-[100] transform transition-all animate-fade-in-up">
          <div className="flex items-center gap-3">
            <span className="text-xl">🗑️</span>
            <span className="font-medium">Chat deleted</span>
          </div>
          <button onClick={handleUndo} className="text-purple-400 font-bold hover:text-purple-300 transition-colors px-2 py-1 hover:bg-purple-500/20 rounded-lg">
            Undo
          </button>
        </div>
      )}

    </div>
  );
};

export default Sidebar;