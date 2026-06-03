import React from 'react';

// Props me 'user' mil raha hai App.jsx se
const Home = ({ user }) => {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">
        Welcome back, <span className="text-purple-500">{user?.name}</span>! 🔥
      </h1>
      <p className="text-gray-400 text-lg">Your Unique AI Agent Dashboard is ready.</p>
    </div>
  );
};

export default Home;