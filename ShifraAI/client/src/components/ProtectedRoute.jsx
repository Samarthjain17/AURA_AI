import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, loading, children }) => {
  // 1. Agar backend se data aane me time lag raha hai, toh Loader dikhao
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. Agar backend ne bola user nahi hai (cookie nahi mili), toh Login pe bhej do
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Sab theek hai toh page dikhne do
  return children;
};

export default ProtectedRoute;