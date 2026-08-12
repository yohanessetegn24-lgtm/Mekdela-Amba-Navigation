import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Map, LogIn, LogOut, User } from 'lucide-react';
import logo from '../assets/mekdelaambauniversity.jpg'; 

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');

  return (
    <nav className="fixed top-0 w-full z-[2000] bg-white border-b border-gray-100 h-20 px-8 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-4">
        <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
        <div className="leading-none italic font-bold">
          <h1 className="text-[#00204E] text-xl tracking-tighter uppercase">Mekdela Amba</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-[2px]">University</p>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-8 font-bold italic text-gray-600">
        <Link to="/" className="hover:text-[#00204E] flex items-center gap-2"><Home size={18}/> Home</Link>
        <Link to="/campuses" className="hover:text-[#00204E] flex items-center gap-2"><Map size={18}/> Campuses</Link>
      </div>
      <div className="flex items-center gap-4">
        {role ? (
          <button onClick={() => {localStorage.clear(); navigate('/');}} className="flex items-center gap-2 text-red-500 font-bold italic">
            <LogOut size={18}/> Logout
          </button>
        ) : (
          <button onClick={() => navigate('/login')} className="bg-[#00204E] text-white px-6 py-2.5 rounded-xl font-bold italic">Login</button>
        )}
      </div>
    </nav>
  );
};
export default Navbar;