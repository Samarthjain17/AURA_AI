import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import ChatBox from './components/ChatBox';

// 🔥 THEME CONFIGURATION (Sunset hatakar Pink daal diya)
export const THEMES = {
  midnight: {
    id: 'midnight', name: '🌌 Midnight Aura',
    mainBg: 'bg-[#0B0F19]', sidebarBg: 'bg-[#0A0D14]',
    accentText: 'text-purple-400', accentTextLight: 'text-purple-300',
    accentBgLight: 'bg-purple-500/20', accentBorder: 'border-purple-500/50',
    accentRing: 'focus-within:ring-purple-500/30', userMsgBg: 'bg-gradient-to-br from-purple-600 to-indigo-600',
    aiIconBg: 'bg-gradient-to-tr from-purple-500 to-indigo-500', buttonBg: 'bg-gradient-to-r from-purple-600 to-indigo-600',
    hoverText: 'hover:text-purple-400', shadowAi: 'shadow-[0_0_10px_rgba(147,51,234,0.3)]',
    shadowBtn: 'shadow-[0_0_15px_rgba(147,51,234,0.4)]', loader: 'bg-purple-500', gradientText: 'from-purple-400 to-indigo-400'
  },
  cyber: {
    id: 'cyber', name: '🟢 Cyber Matrix',
    mainBg: 'bg-[#050505]', sidebarBg: 'bg-[#000000]',
    accentText: 'text-emerald-400', accentTextLight: 'text-emerald-300',
    accentBgLight: 'bg-emerald-500/20', accentBorder: 'border-emerald-500/50',
    accentRing: 'focus-within:ring-emerald-500/30', userMsgBg: 'bg-gradient-to-br from-green-600 to-emerald-800',
    aiIconBg: 'bg-gradient-to-tr from-green-400 to-emerald-500', buttonBg: 'bg-gradient-to-r from-green-600 to-emerald-600',
    hoverText: 'hover:text-emerald-400', shadowAi: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    shadowBtn: 'shadow-[0_0_15px_rgba(16,185,129,0.4)]', loader: 'bg-emerald-500', gradientText: 'from-green-400 to-emerald-400'
  },
  pink: {
    id: 'pink', name: '🌸 Sakura Pink',
    mainBg: 'bg-[#170a11]', sidebarBg: 'bg-[#0d0509]',
    accentText: 'text-pink-400', accentTextLight: 'text-pink-300',
    accentBgLight: 'bg-pink-500/20', accentBorder: 'border-pink-500/50',
    accentRing: 'focus-within:ring-pink-500/30', userMsgBg: 'bg-gradient-to-br from-pink-600 to-rose-600',
    aiIconBg: 'bg-gradient-to-tr from-pink-500 to-rose-500', buttonBg: 'bg-gradient-to-r from-pink-600 to-rose-600',
    hoverText: 'hover:text-pink-400', shadowAi: 'shadow-[0_0_10px_rgba(236,72,153,0.3)]',
    shadowBtn: 'shadow-[0_0_15px_rgba(236,72,153,0.4)]', loader: 'bg-pink-500', gradientText: 'from-pink-400 to-rose-400'
  },
  ocean: {
    id: 'ocean', name: '🌊 Deep Ocean',
    mainBg: 'bg-[#040f1a]', sidebarBg: 'bg-[#020810]',
    accentText: 'text-cyan-400', accentTextLight: 'text-cyan-300',
    accentBgLight: 'bg-cyan-500/20', accentBorder: 'border-cyan-500/50',
    accentRing: 'focus-within:ring-cyan-500/30', userMsgBg: 'bg-gradient-to-br from-cyan-600 to-blue-700',
    aiIconBg: 'bg-gradient-to-tr from-cyan-400 to-blue-500', buttonBg: 'bg-gradient-to-r from-cyan-600 to-blue-600',
    hoverText: 'hover:text-cyan-400', shadowAi: 'shadow-[0_0_10px_rgba(6,182,212,0.3)]',
    shadowBtn: 'shadow-[0_0_15px_rgba(6,182,212,0.4)]', loader: 'bg-cyan-500', gradientText: 'from-cyan-400 to-blue-400'
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentChatId, setCurrentChatId] = useState(() => localStorage.getItem('activeChatId') || null);
  const [isTemporary, setIsTemporary] = useState(() => {
    const savedId = localStorage.getItem('activeChatId');
    return savedId ? savedId.startsWith('temp-') : false;
  });

  // Crash prevent karne ka naya logic
  const [activeThemeId, setActiveThemeId] = useState(() => {
    const saved = localStorage.getItem('aura-theme');
    return THEMES[saved] ? saved : 'midnight';
  });
  
  const theme = THEMES[activeThemeId];

  useEffect(() => {
    if (currentChatId) localStorage.setItem('activeChatId', currentChatId);
  }, [currentChatId]);

  useEffect(() => {
    localStorage.setItem('aura-theme', activeThemeId);
  }, [activeThemeId]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/user/current-user", { withCredentials: true });
        setUser(response.data.user); 
      } catch (error) {
        setUser(null); 
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return <div className={`flex h-screen items-center justify-center ${theme.mainBg} text-white transition-colors duration-500`}>Loading...</div>;

  return (
    // 🔥 Pura background theme.mainBg se control hoga
    <div className={`flex h-screen w-full ${theme.mainBg} text-white overflow-hidden transition-colors duration-500`}>
      <Sidebar 
        user={user} 
        currentChatId={currentChatId} setCurrentChatId={setCurrentChatId} 
        isTemporary={isTemporary} setIsTemporary={setIsTemporary} 
        theme={theme} THEMES={THEMES} activeThemeId={activeThemeId} setActiveThemeId={setActiveThemeId}
      />
      <div className="flex-1 w-full h-full relative overflow-hidden">
        {/* 🔥 Yahan theme ChatBox ko bheji ja rahi hai */}
        <ChatBox user={user} currentChatId={currentChatId} isTemporary={isTemporary} theme={theme} />
      </div>
    </div>
  );
}

export default App;