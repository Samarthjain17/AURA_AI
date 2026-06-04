import React from 'react';
import axios from 'axios';
import { auth } from '../utils/firebase';
import { signOut } from 'firebase/auth';

const Navbar = ({ user }) => {
  
  // Logout Function
  const handleLogout = async () => {
    try {
      // 1. Firebase se bahar niklo
      await signOut(auth);
      
      // 2. Backend se token (cookie) clear karo
      await axios.post("http://localhost:8000/api/auth/logout", {}, {
        withCredentials: true 
      });

      // 3. Page ko refresh karke Login par bhej do
      window.location.href = "/login";
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <nav className="w-full bg-[#131825] border-b border-gray-800 px-6 py-4 flex justify-between items-center shadow-lg">
      
      {/* Left Side: AURA AI Logo */}
      <h1 className="text-2xl font-bold text-white tracking-wider cursor-pointer">
        AURA <span className="text-purple-500">AI</span>
      </h1>

      {/* Right Side: User Profile & Logout */}
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="text-gray-300 font-medium">{user?.name}</span>
        </div>
        
        <button 
          onClick={handleLogout}
          className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-5 py-2 rounded-lg font-medium transition-all duration-300"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;