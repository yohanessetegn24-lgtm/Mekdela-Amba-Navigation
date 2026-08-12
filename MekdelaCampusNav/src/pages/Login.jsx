import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // 🚀 አዲሱ ማእከላዊ API አገልግሎት
import { LogIn, Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 🚀 አሁን አድራሻውን በሙሉ መጻፍ አያስፈልግም፣ api.js ራሱ ያውቀዋል
      const res = await api.post('/Auth/login', { email, password });
      
      // መረጃውን በlocalStorage እናስቀምጥ
      localStorage.setItem('userRole', res.data.role);
      localStorage.setItem('userName', res.data.userName);
      localStorage.setItem('isLoggedIn', 'true');

      // 🚀 ስማርት ሪዳይሬክት
      if (res.data.role === 'Admin') {
        navigate('/admin/dashboard'); // አድሚን ከሆነ ወደ ዳሽቦርድ
      } else {
        navigate('/campuses'); // ተማሪ ከሆነ ወደ ካምፓስ ምርጫ
      }
    } catch (err) {
      // ስህተት ሲፈጠር ለተጠቃሚው ግልጽ መልእክት እናሳያለን
      setError('የመግቢያ ስህተት! እባክዎ ኢሜይልዎን ወይም ባክኤንድ መብራቱን ያረጋግጡ።');
    }
  };

  return (
    <div className="min-h-screen bg-ma-blue flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 border-t-8 border-ma-gold">
        
        {/* የሎጎ እና የርዕስ ክፍል */}
        <div className="flex flex-col items-center mb-8">
           <div className="w-16 h-16 bg-ma-blue rounded-2xl flex items-center justify-center text-ma-gold shadow-lg mb-4">
              <LogIn size={32} />
           </div>
           <h2 className="text-3xl font-black text-ma-blue text-center leading-none">Portal Login</h2>
           <p className="text-center text-gray-400 text-[10px] mt-2 font-bold tracking-[3px] uppercase">
              Mekdela Amba University
           </p>
        </div>
        
        {/* ስህተት ካለ ማሳያ */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-center gap-3 text-xs font-bold border border-red-100 animate-pulse">
            <AlertCircle size={18}/>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          {/* የኢሜይል ሳጥን */}
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-gray-300" size={20} />
            <input 
              type="email" 
              required 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-ma-gold outline-none font-bold text-ma-blue italic" 
              placeholder="Email Address" 
            />
          </div>

          {/* የፓስዎርድ ሳጥን */}
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-gray-300" size={20} />
            <input 
              type="password" 
              required 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-ma-gold outline-none font-bold text-ma-blue" 
              placeholder="Password" 
            />
          </div>

          {/* መግቢያ በተን */}
          <button 
            type="submit" 
            className="w-full bg-ma-blue text-white py-5 rounded-[22px] font-black text-lg hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/20 active:scale-95 transform tracking-widest uppercase italic"
          >
            Sign In Now
          </button>
        </form>

        {/* የታችኛው ማሳሰቢያ */}
        <p className="text-center text-gray-400 text-[10px] mt-8 font-medium">
           © 2024 MAU CAMPUS NAVIGATION SYSTEM
        </p>
      </div>
    </div>
  );
};

export default Login;