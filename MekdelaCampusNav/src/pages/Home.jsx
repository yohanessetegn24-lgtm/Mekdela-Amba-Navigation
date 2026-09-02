import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Map as MapIcon, LogIn, ChevronRight, Search, 
  MapPinned, Navigation, School, Info, Mail, Phone, 
  ArrowRight, MapPin, Menu, X 
} from 'lucide-react';

// 🚀 Assets
import mkaulogo from '../assets/mkaulogo.jpg';
import campusImg from '../assets/mekdelaambauniversity.jpg'; 
import tuluImg from '../assets/mekdelaambauniversity.jpg'; 
import mekaneImg from '../assets/homepage.jpg'; 

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);
const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-1 2.17-2.82 3.47c1.82 8.3-6.62 14.03-10.9 14.03-4.54 0-6.18-4.57-6.18-4.57 4.15.58 4.85-2.04 4.85-2.04-2.35-.19-3.23-2.26-3.23-2.26 1.64.04 1.6-.98 1.6-.98-1.48-.35-2.35-2.79-2.35-2.79.47.25 1.05.09 1.05.09-1.28-1.24-1.15-3.35-1.15-3.35 2.22 1.64 4.18 2.01 4.85 2.01.05-.65.13-1.24.33-1.74.81-2.04 2.91-3.22 5.02-2.87 1.21.2 2.2 1 2.67 2.1.5.07 1 .3 1.5.59-.2-.5-.5-.9-.9-1.2 1-.1 1.9.2 1.9.2z"></path></svg>
);
const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Hamburger state

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) navigate(`/map/1?search=${searchQuery}`);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Campuses', path: '/campuses' },
    { name: 'Map', path: '/map/1' },
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans overflow-x-hidden italic font-bold">
      
      {/* 🏛️ 1. TOP NAVIGATION BAR */}
      <nav className="w-full bg-white px-4 md:px-8 py-4 md:py-5 flex justify-between items-center shadow-sm sticky top-0 z-[1000] border-b border-gray-100">
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
               className={`text-sm font-black uppercase tracking-[1px] transition-all ${link.name === 'Home' ? 'text-[#006064] border-b-4 border-[#006064] pb-1' : 'text-gray-400 hover:text-[#006064]'}`}
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
          
          {/* Hamburger Toggle */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-[#006064]">
             {isMenuOpen ? <X size={28}/> : <Menu size={28}/>}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
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

      {/* 🖼️ 2. HERO SECTION */}
      <section className="relative min-h-[60vh] md:h-[70vh] flex items-center py-12 md:py-0">
        <div className="absolute inset-0 z-0">
          <img src={campusImg} className="w-full h-full object-cover" alt="Hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 md:px-16 z-10 text-white text-left">
          <div className="max-w-4xl space-y-4 md:space-y-8">
             <h2 className="text-4xl md:text-6xl lg:text-8xl font-black leading-tight md:leading-none italic uppercase tracking-tighter">
                Discover. Navigate. <br />
                <span className="text-[#fbc02d]">Experience Excellence.</span>
             </h2>
             <p className="text-lg md:text-2xl font-bold text-gray-200 max-w-2xl leading-relaxed italic">
                Find your way around Mekdela Amba University with interactive maps and real-time navigation.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 pt-4 md:pt-6">
                <button onClick={() => navigate('/map/1')} className="bg-[#006064] text-white px-8 md:px-10 py-4 md:py-5 rounded-xl font-black uppercase text-xs md:text-sm flex items-center justify-center gap-3 hover:bg-[#004d40] shadow-xl transition-all">
                   <MapPinned size={20} /> EXPLORE MAP
                </button>
                <button onClick={() => navigate('/map/1')} className="bg-white text-[#006064] px-8 md:px-10 py-4 md:py-5 rounded-xl font-black uppercase text-xs md:text-sm flex items-center justify-center gap-3 hover:bg-gray-100 shadow-xl transition-all">
                   <Navigation size={20} className="rotate-45" /> DIRECTIONS
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* 🔍 3. SEARCH SECTION */}
      <section className="container mx-auto px-4 md:px-6 -mt-8 md:-mt-12 relative z-20">
         <form onSubmit={handleSearch} className="max-w-5xl mx-auto bg-white rounded-2xl md:rounded-full shadow-2xl p-2 md:p-3 flex flex-col sm:flex-row items-center gap-2 md:gap-4 border border-gray-100">
            <div className="flex-1 flex items-center px-4 md:px-10 w-full">
               <Search size={22} className="text-gray-300 mr-3 md:mr-5 shrink-0" />
               <input 
                 type="text" 
                 placeholder="Search buildings, departments..." 
                 className="w-full bg-transparent outline-none text-sm md:text-lg font-bold text-[#006064] py-3 placeholder-gray-300"
                 value={searchQuery}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <button type="submit" className="w-full sm:w-auto bg-[#006064] text-white px-10 md:px-16 py-4 md:py-5 rounded-xl md:rounded-full font-black uppercase text-xs md:text-sm tracking-[2px] hover:bg-[#004d40] transition-all">SEARCH</button>
         </form>
      </section>

      {/* 🧱 4. FEATURES SECTION */}
      <section className="container mx-auto px-6 md:px-16 py-16 md:py-28 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
   {[
     { title: 'Interactive Map', desc: 'Explore campus with high-quality satellite maps.', icon: <MapIcon size={30}/>, path: '/map/1', action: 'Open Map', bg: 'bg-blue-50' },
     { title: 'Get Directions', desc: 'Step-by-step navigation from your GPS location.', icon: <Navigation size={30} className="rotate-45" />, path: '/map/1', action: 'Get Started', bg: 'bg-indigo-50' },
     { title: 'Our Campuses', desc: 'Discover facilities at Tulu Awulia and Mekane Selam.', icon: <School size={30}/>, path: '/campuses', action: 'View Campuses', bg: 'bg-teal-50' },
     { title: 'Learn More', desc: 'Access university news and campus info.', icon: <Info size={30}/>, path: '/about', action: 'About Us', bg: 'bg-purple-50' }
   ].map((feat, i) => (
     <div 
        key={i} 
        onClick={() => navigate(feat.path)} 
        className="bg-white p-8 md:p-10 rounded-[30px] md:rounded-[40px] border border-gray-50 hover:shadow-2xl transition-all group flex flex-col items-start gap-4 md:gap-5 cursor-pointer"
     >
        <div className={`p-4 md:p-5 ${feat.bg} text-[#006064] rounded-[20px] md:rounded-[25px] group-hover:bg-[#006064] group-hover:text-white transition-all`}>
           {feat.icon}
        </div>
        <h3 className="text-lg md:text-xl font-black text-[#006064] uppercase italic">{feat.title}</h3>
        <p className="text-xs md:text-sm font-bold text-gray-400 leading-relaxed italic">{feat.desc}</p>
        <button className="mt-2 md:mt-4 text-[10px] font-black uppercase text-[#006064] flex items-center gap-2 tracking-[2px] transition-all">
           {feat.action} <ArrowRight size={14} />
        </button>
     </div>
   ))}
</section>

      {/* 🏫 5. OUR CAMPUSES SECTION */}
      <section className="bg-gray-50 py-16 md:py-32 px-6 md:px-16">
         <div className="container mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 md:mb-16 border-b-2 border-gray-200 pb-6 md:pb-8 gap-4">
               <div className="text-left">
                  <h2 className="text-3xl md:text-5xl font-black text-[#006064] uppercase italic tracking-tighter">Our Campuses</h2>
                  <div className="h-1.5 md:h-2 w-16 md:w-24 bg-[#fbc02d] mt-2 md:mt-4 rounded-full"></div>
               </div>
               <button onClick={() => navigate('/map/1')} className="text-[10px] md:text-xs font-black text-[#006064] uppercase flex items-center gap-2 hover:underline tracking-[2px]">View All <ArrowRight size={18}/></button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
               {[
                 { name: 'Tulu Awulia Main Campus', loc: 'Amba Alage', img: tuluImg, id: 1 },
                 { name: 'Mekane Selam Campus', loc: 'South Wollo', img: mekaneImg, id: 2 }
               ].map((camp, i) => (
                 <div key={i} className="bg-white rounded-[30px] md:rounded-[50px] overflow-hidden flex flex-col md:flex-row shadow-xl border border-white">
                    <div className="md:w-1/2 h-56 md:h-72"><img src={camp.img} className="w-full h-full object-cover" alt={camp.name} /></div>
                    <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center gap-3 md:gap-5 text-left">
                       <h3 className="text-xl md:text-3xl font-black text-[#006064] uppercase tracking-tighter italic leading-tight">{camp.name}</h3>
                       <div className="flex items-center gap-2 text-gray-400 font-bold"><MapPin size={16} className="text-[#fbc02d]"/> <span className="text-[10px] md:text-xs tracking-widest">{camp.loc}</span></div>
                       <button onClick={() => navigate(`/map/${camp.id}`)} className="mt-4 md:mt-6 bg-[#006064] text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-[2px] shadow-lg">EXPLORE SITE</button>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 🏁 6. FOOTER */}
      <footer className="bg-[#006064] text-white pt-16 md:pt-24 pb-8 md:pb-12 px-6 md:px-16 border-t-[8px] md:border-t-[12px] border-[#fbc02d]">
         <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-20 mb-16 md:mb-24 text-left">
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <img src={mkaulogo} className="w-12 h-12 md:w-16 md:h-16 object-contain rounded-full border-2 border-[#fbc02d]/20 shadow-md" alt="Logo" />
                  <div className="flex flex-col">
                    <h4 className="text-sm md:text-xl font-black uppercase leading-tight tracking-tight">Mekdela Amba University</h4>
                  </div>
               </div>
               <p className="text-xs font-bold text-white/60 leading-relaxed italic uppercase tracking-wider">Empowering minds, building the future. Providing world-class quality education.</p>
            </div>

            <div>
               <h4 className="text-[10px] md:text-sm font-black uppercase tracking-[3px] md:tracking-[5px] mb-6 md:mb-10 text-[#fbc02d]">Quick Links</h4>
               <ul className="grid grid-cols-2 sm:grid-cols-1 gap-3 md:gap-5 text-[10px] md:text-xs font-bold text-white/70">
                  {['Home', 'University Map', 'Campuses', 'About Us', 'Services', 'Contact'].map((link) => (
                    <li key={link} className="hover:text-[#fbc02d] cursor-pointer transition-colors uppercase">{link}</li>
                  ))}
               </ul>
            </div>

            <div>
               <h4 className="text-[10px] md:text-sm font-black uppercase tracking-[3px] md:tracking-[5px] mb-6 md:mb-10 text-[#fbc02d]">Contact Info</h4>
               <ul className="space-y-4 md:space-y-8">
                  <li className="flex items-center gap-4 text-[10px] md:text-xs font-bold"><MapPin size={18} className="text-[#fbc02d]"/> Mekdela Amba, Ethiopia</li>
                  <li className="flex items-center gap-4 text-[10px] md:text-xs font-bold"><Mail size={18} className="text-[#fbc02d]"/> info@mau.edu.et</li>
                  <li className="flex items-center gap-4 text-[10px] md:text-xs font-bold"><Phone size={18} className="text-[#fbc02d]"/> +251 900 000 000</li>
               </ul>
            </div>

            <div>
               <h4 className="text-[10px] md:text-sm font-black uppercase tracking-[3px] md:tracking-[5px] mb-6 md:mb-10 text-[#fbc02d]">Follow Us</h4>
               <div className="flex gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#fbc02d] hover:text-[#006064] cursor-pointer shadow-xl transition-all"><FacebookIcon /></div>
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#fbc02d] hover:text-[#006064] cursor-pointer shadow-xl transition-all"><TwitterIcon /></div>
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#fbc02d] hover:text-[#006064] cursor-pointer shadow-xl transition-all"><InstagramIcon /></div>
               </div>
            </div>
         </div>

         <div className="container mx-auto pt-8 border-t border-white/10 text-center">
            <p className="text-[9px] md:text-[11px] font-black text-white/30 tracking-[4px] md:tracking-[10px] uppercase italic">
               © {new Date().getFullYear()} MEKDELA AMBA UNIVERSITY. ALL RIGHTS RESERVED.
            </p>
         </div>
      </footer>
    </div>
  );
};

export default Home;