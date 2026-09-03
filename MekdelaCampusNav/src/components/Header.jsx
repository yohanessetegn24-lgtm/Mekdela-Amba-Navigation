import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Menu, X } from 'lucide-react';
import mkaulogo from '../assets/mkaulogo.jpg';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Campuses', path: '/campuses' },
    { name: 'Map', path: '/map/1' },
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="w-full bg-white px-4 md:px-8 py-4 md:py-5 flex justify-between items-center shadow-sm sticky top-0 z-[1000] border-b border-gray-100 italic font-bold">
      <div className="flex items-center gap-2 md:gap-4 cursor-pointer" onClick={() => navigate('/')}>
        <img src={mkaulogo} className="w-10 h-10 md:w-14 md:h-14 object-contain rounded-full border border-gray-100" alt="MAU Logo" />
        <div className="flex flex-col text-left">
          <h1 className="text-[#006064] font-black text-sm md:text-2xl leading-none uppercase tracking-tight">Mekdela Amba University</h1>
          <span className="text-[#006064]/60 text-[8px] md:text-[11px] font-bold mt-1 uppercase">መቅደላ አምባ ዩኒቨርሲቲ</span>
        </div>
      </div>

      {/* Desktop Links */}
      <div className="hidden lg:flex items-center gap-8">
        {navLinks.map((link) => (
          <button 
            key={link.name}
            onClick={() => navigate(link.path)} 
            className={`text-sm font-black uppercase tracking-[1px] transition-all ${
              location.pathname === link.path ? 'text-[#006064] border-b-4 border-[#006064] pb-1' : 'text-gray-400 hover:text-[#006064]'
            }`}
          >
            {link.name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => navigate('/login')}
          className="bg-[#fbc02d] text-[#006064] px-4 md:px-8 py-2 md:py-3 rounded-full font-black uppercase text-[10px] md:text-xs flex items-center gap-2 hover:bg-[#f9a825] shadow-md transition-all"
        >
          <LogIn size={16} strokeWidth={3} /> <span className="hidden sm:inline">LOGIN</span>
        </button>
        
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-[#006064]">
           {isMenuOpen ? <X size={28}/> : <Menu size={28}/>}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-xl border-b border-gray-100 flex flex-col p-6 gap-4 lg:hidden animate-in slide-in-from-top">
          {navLinks.map((link) => (
            <button 
              key={link.name}
              onClick={() => { navigate(link.path); setIsMenuOpen(false); }}
              className="text-left text-sm font-black uppercase text-[#006064] py-2 border-b border-gray-50"
            >
              {link.name}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Header;