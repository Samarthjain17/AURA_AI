import React from 'react';
import axios from 'axios';
import { auth } from '../utils/firebase';
import { signOut } from 'firebase/auth';

const Sidebar = ({ user }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      await axios.post("http://localhost:8000/api/auth/logout", {}, { withCredentials: true });
      window.location.href = "/login";
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <div className="w-72 bg-[#0F131F] border-r border-gray-800/50 flex flex-col justify-between p-4 hidden md:flex h-full shadow-2xl">
      
      {/* Top Section */}
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-8 px-2 tracking-wide">
          AURA AI
        </h1>
        
        {/* 3D New Chat Button */}
        <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl p-3 font-semibold shadow-[0_0_15px_rgba(147,51,234,0.4)] hover:shadow-[0_0_25px_rgba(147,51,234,0.6)] transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2">
          <span className="text-xl">+</span> New Chat
        </button>
      </div>

      {/* Bottom Section: Profile & Logout */}
      <div className="border-t border-gray-800/80 pt-4 flex items-center justify-between px-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="text-gray-300 text-sm font-medium truncate">{user?.name}</span>
        </div>
        
        {/* Logout Icon Button */}
        <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>
      
    </div>
  );
};

export default Sidebar;