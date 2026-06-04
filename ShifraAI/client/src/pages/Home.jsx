import React from 'react';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';

const Home = ({ user }) => {
  return (
    // Flex row for Sidebar (Left) and Main Content (Right)
    <div className="flex h-screen bg-[#080B14] font-sans overflow-hidden">
      
      {/* Sidebar on the Left */}
      <Sidebar user={user} />

      {/* Main Content Area on the Right */}
      <div className="flex-1 flex flex-col relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1f35] via-[#080B14] to-[#080B14]">
        
        {/* Chat Area */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <ChatBox user={user} />
        </div>

      </div>
    </div>
  );
};

export default Home;