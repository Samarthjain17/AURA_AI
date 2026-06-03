import React from 'react';
// React icons se hum ek chamakta hua 'Sparkle' icon laa rahe hain
import { HiOutlineSparkles } from 'react-icons/hi2'; 

const Login = () => {
  return (
    // 1. Main Background Wrapper (Pura screen cover karega dark theme ke sath)
    <div className="min-h-screen relative bg-[#0B0F19] overflow-hidden flex items-center justify-center">

      {/* 2. Custom Glowing Background Effects (Ye humara unique touch hai - background me glow karega) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      {/* 3. Main Content Container (Grid Layout) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* --- LEFT SECTION --- */}
        <div className="space-y-8">
          
          {/* Badge (Chhota sa tag) */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <HiOutlineSparkles className="text-blue-400 text-xl" />
            <span className="text-sm font-medium text-blue-200">Next-Gen Voice Platform</span>
          </div>

          {/* Main Heading (Gradient color ke sath) */}
          <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight">
            Build AI Agents <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              For Any Website
            </span>
          </h1>

          {/* Paragraph (Description) */}
          <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
            Create customizable AI voice assistants that talk, guide users, and integrate into your website instantly. Give your brand a real voice.
          </p>

        </div>

        {/* --- RIGHT SECTION --- */}
        <div className="hidden lg:block">
            {/* Bhai agle 5 minute ke chunk me hum yahan ek glass ka box banayenge jisme features likhe honge */}
        </div>

      </div>
    </div>
  );
}

export default Login;