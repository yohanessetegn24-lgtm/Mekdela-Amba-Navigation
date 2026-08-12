import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // 🚀 ማእከላዊ API አገልግሎት
import { LogIn, Lock, Mail, AlertCircle, ChevronLeft } from 'lucide-react';
// 🚀 ያንተ እውነተኛ ፎቶ
import sidePhoto from '../assets/mekdelaambauniversity.jpg';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/Auth/login', { email, password });
      
      localStorage.setItem('userRole', res.data.role);
      localStorage.setItem('userName', res.data.userName);
      localStorage.setItem('isLoggedIn', 'true');

      if (res.data.role === 'Admin') {
        navigate('/admin/dashboard'); 
      } else {
        navigate('/campuses'); 
      }
    } catch (err) {
      setError('የመግቢያ ስህተት! እባክዎ ኢሜይልዎን ወይም ባክኤንድ መብራቱን ያረጋግጡ።');
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans italic font-bold overflow-hidden leading-none">
      
      {/* 📸 1. የግራ በኩል ክፍል - ደማቅ ሙሉ ፎቶ */}
      <div className="hidden lg:block lg:w-1/2 relative h-screen">
        <img 
          src={sidePhoto} 
          className="absolute inset-0 w-full h-full object-cover" 
          alt="Mekdela Amba University" 
        />
        {/* ለጽሁፉ መታየት ብቻ በስሱ ከስር ጥላ (Gradient) ተጨምሯል */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        <div className="absolute bottom-16 left-12 text-white z-10 leading-none">
          <h1 className="text-6xl font-black tracking-tighter uppercase leading-none italic drop-shadow-2xl">
             Mekdela Amba <br/> 
             <span className="text-ma-gold">University</span>
          </h1>
          <p className="text-xl font-medium mt-4 opacity-90 leading-none drop-shadow-lg">
             Mekdela Amba University Campus Navigation Portal
          </p>
        </div>
      </div>

      {/* 폼 2. የቀኝ በኩል ክፍል - የሎጊን ካርዱ (ምስል #4 ዲዛይን) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 relative">
        
        {/* የጀርባ ማስጌጫ */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-ma-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-ma-blue/5 rounded-full blur-3xl"></div>

        <div className="bg-white w-full max-w-md rounded-[50px] shadow-[0_25px_70px_rgba(0,32,78,0.15)] p-12 z-10 border-t-[14px] border-ma-gold animate-in zoom-in duration-500 leading-none">
          
          <div className="flex flex-col items-center mb-10 leading-none">
             <div className="w-20 h-20 bg-ma-blue rounded-3xl flex items-center justify-center text-ma-gold shadow-2xl mb-6 border-b-4 border-ma-gold/50 leading-none">
                <LogIn size={40} />
             </div>
             <h2 className="text-4xl font-black text-ma-blue tracking-tighter italic uppercase leading-none">Login</h2>
             <p className="text-center text-gray-400 text-[10px] mt-3 font-bold tracking-[4px] uppercase leading-none italic">
                Enter your credentials
             </p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 flex items-center gap-3 text-xs font-black border border-red-100 animate-pulse leading-none">
              <AlertCircle size={18}/>
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6 leading-none">
            {/* ኢሜይል */}
            <div className="space-y-3 leading-none">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 leading-none">Institutional Email</label>
              <div className="relative leading-none">
                <Mail className="absolute left-5 top-5 text-gray-300" size={20} />
                <input 
                  type="email" 
                  required 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-3xl focus:ring-4 focus:ring-ma-gold/20 outline-none font-bold text-ma-blue italic shadow-inner leading-none" 
                  placeholder="name@gmail.com" 
                />
              </div>
            </div>

            {/* ፓስዎርድ */}
            <div className="space-y-3 leading-none">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 leading-none">Security Key</label>
              <div className="relative leading-none">
                <Lock className="absolute left-5 top-5 text-gray-300" size={20} />
                <input 
                  type="password" 
                  required 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-3xl focus:ring-4 focus:ring-ma-gold/20 outline-none font-bold text-ma-blue shadow-inner leading-none" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-ma-blue text-white py-6 rounded-[30px] font-black text-xl hover:bg-black transition-all shadow-2xl shadow-ma-blue/20 active:scale-95 transform tracking-widest uppercase italic mt-6 leading-none"
            >
              Access Portal
            </button>
          </form>

          <button 
            onClick={() => navigate('/')}
            className="w-full mt-10 flex items-center justify-center gap-2 text-gray-400 hover:text-ma-gold transition-colors text-xs font-black uppercase tracking-widest leading-none italic"
          >
            <ChevronLeft size={16} /> Return to Home
          </button>
        </div>
      </div>

    </div>
  );
};

export default Login;