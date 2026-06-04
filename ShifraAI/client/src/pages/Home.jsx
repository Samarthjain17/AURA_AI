import React from 'react';
import Navbar from '../components/Navbar';
import ChatBox from '../components/ChatBox';

const Home = ({ user }) => {
  return (
    // 'h-screen' use kiya hai taaki page screen se bahar na jaye
    <div className="h-screen bg-[#0B0F19] flex flex-col font-sans overflow-hidden">
      
      <Navbar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center pt-8 px-4 pb-6 w-full">
        
        {/* Header Text (Thoda chota kiya taaki chatbox ko jagah mile) */}
        <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight text-white">
          Welcome to <span className="text-purple-500">AURA AI</span> 🚀
        </h1>
        <p className="text-gray-400 text-sm md:text-base max-w-2xl text-center mb-4">
          Your intelligent assistant is ready. Ask anything, brainstorm ideas, or generate code.
        </p>

        {/* 💬 Chat Box Component */}
        <ChatBox />
        
      </div>
    </div>
  );
};

export default Home;