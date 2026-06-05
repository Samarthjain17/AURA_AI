import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';

const Home = ({ user }) => {
  const [currentChatId, setCurrentChatId] = useState(Date.now().toString());
  const [isTemporary, setIsTemporary] = useState(false); // 🕵️‍♂️ Naya Switch

  return (
    <div className="flex h-screen bg-[#080B14] font-sans overflow-hidden">
      <Sidebar 
        user={user} 
        currentChatId={currentChatId} 
        setCurrentChatId={setCurrentChatId} 
        isTemporary={isTemporary} 
        setIsTemporary={setIsTemporary} // Switch bheja
      />

      <div className="flex-1 flex flex-col relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1f35] via-[#080B14] to-[#080B14]">
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <ChatBox 
            user={user} 
            currentChatId={currentChatId} 
            isTemporary={isTemporary} // Chatbox ko bataya ki Incognito hai ya nahi
          />
        </div>
      </div>
    </div>
  );
};

export default Home;