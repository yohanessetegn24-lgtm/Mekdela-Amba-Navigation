import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn, Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // ባክኤንዱን መጥራት (የፖርት ቁጥሩን አረጋግጥ)
      const res = await axios.post('https://localhost:7086/api/Auth/login', { email, password });
      
      // መረጃውን በlocalStorage እናስቀምጥ
      localStorage.setItem('userRole', res.data.role);
      localStorage.setItem('userName', res.data.userName);
      localStorage.setItem('isLoggedIn', 'true');

      // 🚀 አንተ የፈለግከው ስማርት ሪዳይሬክት
      if (res.data.role === 'Admin') {
        navigate('/admin/dashboard'); // አድሚን ከሆነ ዳሽቦርድ
      } else {
        navigate('/campuses'); // ተማሪ ከሆነ ካምፓስ ምርጫ
      }
    } catch (err) {
      setError('Login failed! Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-ma-blue flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 border-t-8 border-ma-gold">
        <h2 className="text-3xl font-black text-ma-blue text-center mb-2">Portal Login</h2>
        <p className="text-center text-gray-400 text-sm mb-8 font-bold tracking-widest uppercase">Mekdela Amba University</p>
        
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2 text-sm"><AlertCircle size={18}/>{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-gray-400" size={20} />
            <input type="email" required onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-ma-gold" placeholder="Email Address" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
            <input type="password" required onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-ma-gold" placeholder="Password" />
          </div>
          <button type="submit" className="w-full bg-ma-blue text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-900 transition shadow-xl">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default Login;