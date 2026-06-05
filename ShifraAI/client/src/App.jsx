import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import ChatBox from './components/ChatBox';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load hote hi localStorage se purani ID nikal lo
  const [currentChatId, setCurrentChatId] = useState(() => {
    return localStorage.getItem('activeChatId') || null;
  });

  // Agar purani chat temporary thi, toh isTemporary bhi true set karo
  const [isTemporary, setIsTemporary] = useState(() => {
    const savedId = localStorage.getItem('activeChatId');
    return savedId ? savedId.startsWith('temp-') : false;
  });

  // Jab bhi chat badle, browser ko yaad dila do
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('activeChatId', currentChatId);
    }
  }, [currentChatId]);

  // Backend se user mango
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/user/current-user", {
          withCredentials: true 
        });
        setUser(response.data.user); 
      } catch (error) {
        console.log("User not authenticated");
        setUser(null); 
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#0B0F19] text-white">Loading...</div>;

  return (
    // 🔥 Pura width aur height cover karega, overflow hide kardega
    <div className="flex h-screen w-full bg-[#0B0F19] text-white overflow-hidden">
      <Sidebar 
        user={user} 
        currentChatId={currentChatId} 
        setCurrentChatId={setCurrentChatId} 
        isTemporary={isTemporary} 
        setIsTemporary={setIsTemporary} 
      />
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <ChatBox 
          user={user} 
          currentChatId={currentChatId} 
          isTemporary={isTemporary} 
        />
      </div>
    </div>
  );
}

export default App;
