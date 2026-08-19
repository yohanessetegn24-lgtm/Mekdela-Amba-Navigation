import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { LogIn, Lock, Mail, AlertCircle, ChevronLeft } from 'lucide-react';
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

      if (res.data.role === 'Admin') navigate('/admin/dashboard'); 
      else navigate('/campuses'); 
    } catch (err) {
      setError('የመግቢያ ስህተት! እባክዎ ኢሜይልዎን ያረጋግጡ።');
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans italic font-bold overflow-hidden leading-none">
      {/* የግራ በኩል ፎቶ */}
      <div className="hidden lg:block lg:w-1/2 relative h-screen">
        <img src={sidePhoto} className="absolute inset-0 w-full h-full object-cover" alt="MAU" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-16 left-12 text-white z-10 leading-none">
          <h1 className="text-6xl font-black uppercase italic">Mekdela Amba <br/> <span className="text-ma-gold">University</span></h1>
          <p className="text-xl font-medium mt-4 opacity-90 leading-none">Campus Navigation Portal</p>
        </div>
      </div>

      {/* የሎጊን ፎርም */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 relative">
        <div className="bg-white w-full max-w-md rounded-[50px] shadow-2xl p-12 z-10 border-t-[14px] border-ma-gold animate-in zoom-in duration-500">
          <div className="flex flex-col items-center mb-10">
             <div className="w-20 h-20 bg-ma-blue rounded-3xl flex items-center justify-center text-ma-gold shadow-2xl mb-6 border-b-4 border-ma-gold/50"><LogIn size={40} /></div>
             <h2 className="text-4xl font-black text-ma-blue italic uppercase">Login</h2>
             <p className="text-gray-400 text-[10px] mt-3 font-bold tracking-[4px] uppercase italic">Enter your credentials</p>
          </div>
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 flex items-center gap-3 text-xs font-black border border-red-100 animate-pulse"><AlertCircle size={18}/>{error}</div>}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Enter your Email</label>
              <div className="relative"><Mail className="absolute left-5 top-5 text-gray-300" size={20} /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-3xl focus:ring-4 focus:ring-ma-gold/20 font-bold text-ma-blue shadow-inner" placeholder="name@gmail.com" /></div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Security Key</label>
              <div className="relative"><Lock className="absolute left-5 top-5 text-gray-300" size={20} /><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-3xl font-bold text-ma-blue shadow-inner" placeholder="••••••••" /></div>
              <div className="flex justify-end pr-4">
                {/* 🚀 ወደ Forgot Password ገጽ እንዲወስድ ተደርጓል */}
                <button type="button" onClick={() => navigate('/forgot-password')} className="text-[9px] font-black text-ma-gold uppercase tracking-[2px] hover:text-ma-blue transition-colors italic">Forgot Password?</button>
              </div>
            </div>
            <button type="submit" className="w-full bg-ma-blue text-white py-6 rounded-[30px] font-black text-xl hover:bg-black transition-all shadow-2xl active:scale-95 transform tracking-widest uppercase italic mt-6">Login</button>
          </form>
          <button onClick={() => navigate('/')} className="w-full mt-10 flex items-center justify-center gap-2 text-gray-400 hover:text-ma-gold text-xs font-black uppercase tracking-widest italic"><ChevronLeft size={16} /> Return to Home</button>
        </div>
      </div>
    </div>
  );
};
export default Login;