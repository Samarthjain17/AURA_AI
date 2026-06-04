import React from 'react';
import Navbar from '../components/Navbar';

const Home = ({ user }) => {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col font-sans">
      
      <Navbar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center text-white p-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          Welcome to <span className="text-purple-500">AURA AI</span> 🚀
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed border border-gray-800 bg-[#131825] p-6 rounded-2xl shadow-xl">
          Your intelligent assistant is ready. Experience a secure, premium, and lightning-fast AI workspace designed to elevate your productivity.
        </p>
      </div>
      
    </div>
  );
};

export default Home;