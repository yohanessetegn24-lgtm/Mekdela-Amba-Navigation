import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map as MapIcon, LogIn, ChevronRight, GraduationCap } from 'lucide-react';
// 🚀 ፎቶውን ወደ አንተ እውነተኛ የግቢ ፎቶ ቀየርኩት
import campusImg from '../assets/mekdelaambauniversity.jpg'; 

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col font-sans italic font-bold">
      
      {/* 1. TOP NAVIGATION BAR */}
      <nav className="absolute top-0 w-full z-20 flex justify-between items-center px-8 py-6 bg-transparent">
        <div className="flex items-center gap-2">
          <div className="bg-ma-gold p-2 rounded-lg text-ma-blue shadow-lg leading-none">
            <GraduationCap size={28} />
          </div>
          <span className="text-white font-black text-xl tracking-tighter hidden sm:block leading-none">
            MAU <span className="text-ma-gold italic text-2xl">NAV</span>
          </span>
        </div>
        
        {/* 🚀 አሁን Login በተኑ በወርቃማ ቀለም ደምቆ እንዲታይ ተደርጓል */}
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 bg-ma-gold text-ma-blue px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white transition-all duration-300 shadow-[0_10px_30px_rgba(196,160,6,0.5)] leading-none transform active:scale-95 border-2 border-ma-gold"
        >
          <LogIn size={20} strokeWidth={3} />
           Login
        </button>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative flex-1 flex items-center justify-center text-white overflow-hidden">
        
        {/* 📸 Background Image - አሁን ፎቶው በደማቁ እንዲታይ ተደርጓል */}
        <div className="absolute inset-0 z-0">
          <img 
            src={campusImg} 
            alt="Mekdela Amba University" 
            className="w-full h-full object-cover" 
          />
          {/* 🌓 Overlay ማስተካከያ - ፎቶው በደንብ እንዲታይ (ቀጭን ጥላ ብቻ ነው ያለው) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-8 z-10 grid lg:grid-cols-2 items-center gap-12 mt-10">
          <div className="space-y-8 animate-fade-in leading-none text-left">
            <div className="inline-block bg-ma-gold text-ma-blue px-4 py-1.5 rounded-full text-[10px] font-black tracking-[3px] uppercase shadow-2xl leading-none">
              Smart Campus Map Navigation
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tighter drop-shadow-2xl italic uppercase">
              Mekdela Amba <br />
              <span className="text-ma-gold">University</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white max-w-xl font-black leading-tight drop-shadow-2xl italic">
              Experience the future of campus navigation. Find buildings, offices, and services with real-time precision.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 pt-4 leading-none text-left">
              <button 
                onClick={() => navigate('/campuses')}
                className="group flex items-center justify-center gap-3 bg-ma-gold text-ma-blue px-10 py-6 rounded-3xl font-black text-xl hover:bg-white transition-all duration-300 shadow-[0_20px_60px_rgba(0,32,78,0.4)] uppercase tracking-widest leading-none"
              >
                Explore Campuses
                <ChevronRight className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Decoration - Glass Box */}
          <div className="hidden lg:flex justify-end items-center leading-none">
            <div className="relative leading-none">
              <div className="w-80 h-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[60px] shadow-2xl flex items-center justify-center transform rotate-6 hover:rotate-0 transition-all duration-700">
                <div className="p-10 text-center space-y-6 leading-none">
                   <div className="w-24 h-24 bg-ma-gold rounded-[35px] mx-auto flex items-center justify-center shadow-2xl leading-none">
                      <MapIcon size={50} className="text-ma-blue" />
                   </div>
                   <h3 className="font-black text-3xl italic tracking-tighter text-white uppercase leading-none">Satellite<br/>Map</h3>
                   <p className="text-ma-gold text-xs font-black uppercase tracking-widest leading-none">Real-time Location</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOOTER INFO */}
      <footer className="absolute bottom-8 w-full z-20 text-center text-white font-black text-[10px] tracking-[6px] uppercase drop-shadow-lg leading-none">
        © {new Date().getFullYear()} Mekdela Amba University • Developed by "YSGH" Team
      </footer>
    </div>
  );
};

export default Home;