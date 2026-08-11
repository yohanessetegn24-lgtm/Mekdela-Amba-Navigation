import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map as MapIcon, LogIn, ChevronRight, GraduationCap } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      
      {/* 1. TOP NAVIGATION BAR */}
      <nav className="absolute top-0 w-full z-20 flex justify-between items-center px-8 py-6 bg-transparent">
        <div className="flex items-center gap-2">
          <div className="bg-ma-gold p-2 rounded-lg text-ma-blue shadow-lg">
            <GraduationCap size={28} />
          </div>
          <span className="text-white font-black text-xl tracking-tighter hidden sm:block">
            MAU <span className="text-ma-gold italic">NAV</span>
          </span>
        </div>
        
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2 rounded-full font-bold hover:bg-ma-gold hover:text-ma-blue transition-all duration-300 shadow-xl"
        >
          <LogIn size={18} />
           Login
        </button>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative flex-1 flex items-center justify-center text-white overflow-hidden">
        
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://mau.edu.et/wp-content/uploads/2022/10/MAU-Gate.jpg" 
            alt="University Gate" 
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ma-blue/95 via-ma-blue/80 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-8 z-10 grid lg:grid-cols-2 items-center gap-12">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-block bg-ma-gold/20 border border-ma-gold/30 text-ma-gold px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase">
              Smart Campus Experience
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tighter">
              Mekdela Amba <br />
              <span className="text-ma-gold underline decoration-ma-gold/30 underline-offset-8">University</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 max-w-xl font-light leading-relaxed">
              Experience the future of campus navigation. Find buildings, offices, and services with real-time precision and smart routing.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <button 
                onClick={() => navigate('/campuses')}
                className="group flex items-center justify-center gap-3 bg-ma-gold text-ma-blue px-10 py-5 rounded-2xl font-black text-xl hover:bg-yellow-500 hover:shadow-[0_0_30px_rgba(196,160,6,0.4)] transform hover:-translate-y-1 transition-all duration-300"
              >
                Explore Campuses
                <ChevronRight className="group-hover:translate-x-2 transition-transform" />
              </button>
              
              <button className="flex items-center justify-center gap-3 bg-white/5 backdrop-blur-lg border border-white/10 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white/10 transition-all duration-300">
                View Services
              </button>
            </div>
          </div>

          {/* Right Decoration (Hidden on mobile) */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              <div className="absolute -inset-10 bg-ma-gold/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="w-80 h-80 bg-ma-blue/40 backdrop-blur-2xl border border-white/10 rounded-[60px] shadow-2xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-700 overflow-hidden">
                <MapIcon size={150} className="text-ma-gold/20 absolute -bottom-10 -right-10" />
                <div className="p-10 text-center space-y-4">
                   <div className="w-20 h-20 bg-ma-gold rounded-3xl mx-auto flex items-center justify-center shadow-2xl">
                      <MapIcon size={40} className="text-ma-blue" />
                   </div>
                   <h3 className="font-bold text-2xl">Live Map</h3>
                   <p className="text-blue-200 text-sm italic">"Navigate with confidence anywhere in the campus."</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOOTER INFO */}
      <footer className="absolute bottom-8 w-full z-20 text-center text-blue-200/50 text-sm font-medium tracking-widest px-4 uppercase">
        © {new Date().getFullYear()} Mekdela Amba University • Excellence in Navigation
      </footer>
    </div>
  );
};

export default Home;