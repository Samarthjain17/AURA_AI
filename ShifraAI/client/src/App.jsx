import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Jaise hi App load ho, backend se current user mango
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/user/current-user", {
          withCredentials: true // Cookie bhejna zaroori hai
        });
        setUser(response.data.user); // User mil gaya!
      } catch (error) {
        console.log("User not authenticated");
        setUser(null); // User nahi mila
      } finally {
        setLoading(false); // Checking khatam, loader band karo
      }
    };

    fetchUser();
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* 🔥 Protected Route: Iske andar ka Home page sirf tab dikhega jab user logged in ho */}
      <Route path="/" element={
        <ProtectedRoute user={user} loading={loading}>
          <Home user={user} />
        </ProtectedRoute>
      } />
      
      {/* Faltu URLs ko login par redirect kar do */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;