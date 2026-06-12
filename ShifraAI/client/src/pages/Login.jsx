import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { HiOutlineSparkles, HiOutlineMicrophone, HiOutlineBolt, HiOutlineCodeBracket } from 'react-icons/hi2';
import { FaRobot } from 'react-icons/fa6';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const features = [
  {
    icon: <HiOutlineMicrophone className="text-blue-400 text-2xl" />,
    title: "Voice AI",
    desc: "Natural real-time conversational agent."
  },
  {
    icon: <HiOutlineSparkles className="text-purple-400 text-2xl" />,
    title: "Smart Navigation",
    desc: "Navigate pages using voice commands."
  },
  {
    icon: <HiOutlineCodeBracket className="text-emerald-400 text-2xl" />,
    title: "Easy Embed",
    desc: "Add assistant using one script tag."
  },
  {
    icon: <HiOutlineBolt className="text-amber-400 text-2xl" />,
    title: "Fast Response",
    desc: "Optimized Gemini AI responses."
  }
];

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const { displayName, email } = result.user;
      const response = await axios.post(
        "http://localhost:8000/api/auth/google",
        { name: displayName, email: email },
        { withCredentials: true }
      );
      console.log("Backend Response:", response.data);
      navigate('/');
    } catch (error) {
      console.log("Login Error:", error);
    }
  };

  return (
    <div className="min-h-screen relative bg-[#0B0F19] overflow-hidden flex items-center justify-center">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      <div className="absolute top-8 left-8 flex items-center gap-3 z-20">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-emerald-500 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.5)]">
          <FaRobot className="text-white text-2xl" />
        </div>
        <span className="text-white text-2xl font-black tracking-wider">
          AURA<span className="text-purple-500">.AI</span>
        </span>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <HiOutlineSparkles className="text-blue-400 text-xl" />
            <span className="text-sm font-medium text-blue-200">Next-Gen Voice Platform</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight">
            Build AI Agents <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              For Any Website
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
            Create customizable AI voice assistants that talk, guide users, and integrate into your website instantly. Give your brand a real voice.
          </p>

          <div>
            <button
              onClick={handleLogin}
              className="group relative inline-flex items-center gap-4 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <FcGoogle className="text-3xl bg-white rounded-full p-1" />
              <span className="text-lg tracking-wide">Continue with Google</span>
            </button>
            <p className="text-sm text-gray-500 mt-4">Free plan includes 200 AI responses. No credit card required.</p>
          </div>
        </div>

        <div className="hidden lg:block relative">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
            <h2 className="text-2xl font-bold text-white mb-8">Platform Features</h2>
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-5 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center border border-white/10 shadow-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-xl">{feature.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;