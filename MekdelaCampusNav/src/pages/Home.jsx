import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Map as MapIcon, LogIn, ChevronRight, Search, 
  MapPinned, Navigation, School, Info, Mail, Phone, 
  ArrowRight, MapPin 
} from 'lucide-react';

// 🚀 Assets - እነዚህ ፋይሎች በ assets ፎልደር ውስጥ መኖራቸውን አረጋግጥ
import mkaulogo from '../assets/mkaulogo.jpg';
import campusImg from '../assets/mekdelaambauniversity.jpg'; 
import tuluImg from '../assets/mekdelaambauniversity.jpg'; 
import mekaneImg from '../assets/homepage.jpg'; 

// የሶሻል ሚዲያ SVG አይኮኖች (Import ስህተት እንዳይፈጠር በSVG ተተክተዋል)
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) navigate(`/map/1?search=${searchQuery}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans overflow-x-hidden italic font-bold">
      
      {/* 🏛️ 1. TOP NAVIGATION BAR */}
      <nav className="w-full bg-white px-8 py-5 flex justify-between items-center shadow-sm sticky top-0 z-[1000] border-b border-gray-100">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
          <img src={mkaulogo} className="w-14 h-14 object-contain rounded-full border border-gray-100" alt="MAU Logo" />
          <div className="flex flex-col text-left">
            <h1 className="text-[#006064] font-black text-2xl leading-none uppercase tracking-tight">Mekdela Amba University</h1>
            <span className="text-[#006064]/60 text-[11px] font-bold mt-1 uppercase">መቅደላ አምባ ዩኒቨርሲቲ</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-10">
           <button onClick={() => navigate('/')} className="text-sm font-black uppercase text-[#006064] border-b-4 border-[#006064] pb-1 tracking-[2px]">Home</button>
           <button onClick={() => navigate('/campuses')} className="text-sm font-black uppercase text-gray-400 hover:text-[#006064] tracking-[2px] transition-all">Campuses</button>
           <button onClick={() => navigate('/map/1')} className="text-sm font-black uppercase text-gray-400 hover:text-[#006064] tracking-[2px] transition-all">Map</button>
           <button onClick={() => navigate('/about')} className="text-sm font-black uppercase text-gray-400 hover:text-[#006064] tracking-[2px] transition-all">About Us</button>
           <button onClick={() => navigate('/services')} className="text-sm font-black uppercase text-gray-400 hover:text-[#006064] tracking-[2px] transition-all">Services</button>
           <button onClick={() => navigate('/contact')} className="text-sm font-black uppercase text-gray-400 hover:text-[#006064] tracking-[2px] transition-all">Contact</button>
        </div>

        <button 
          onClick={() => navigate('/login')}
          className="bg-[#fbc02d] text-[#006064] px-10 py-3 rounded-full font-black uppercase text-xs flex items-center gap-3 hover:bg-[#f9a825] shadow-lg transition-all"
        >
          <LogIn size={18} strokeWidth={3} /> LOGIN
        </button>
      </nav>

      {/* 🖼️ 2. HERO SECTION */}
      <section className="relative h-[70vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img src={campusImg} className="w-full h-full object-cover" alt="Hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"></div>
        </div>

        <div className="container mx-auto px-16 z-10 text-white text-left">
          <div className="max-w-4xl space-y-8 animate-in fade-in duration-700">
             <h2 className="text-6xl md:text-8xl font-black leading-none italic uppercase tracking-tighter">
                Discover. Navigate. <br />
                <span className="text-[#fbc02d]">Experience Excellence.</span>
             </h2>
             <p className="text-2xl font-bold text-gray-200 max-w-2xl leading-relaxed italic">
                Find your way around Mekdela Amba University with interactive maps and real-time navigation.
             </p>
             <div className="flex gap-6 pt-6">
                <button onClick={() => navigate('/map/1')} className="bg-[#006064] text-white px-10 py-5 rounded-xl font-black uppercase text-sm flex items-center gap-3 hover:bg-[#004d40] shadow-2xl transition-all">
                   <MapPinned size={22} /> EXPLORE MAP
                </button>
                <button onClick={() => navigate('/map/1')} className="bg-white text-[#006064] px-10 py-5 rounded-xl font-black uppercase text-sm flex items-center gap-3 hover:bg-gray-100 shadow-2xl transition-all">
                   <Navigation size={22} className="rotate-45" /> GET DIRECTIONS
                </button>
             </div>
          </div>
        </div>

        {/* Floating Banner (As per photo) */}
        <div className="absolute bottom-12 right-20 hidden lg:block bg-white/10 backdrop-blur-xl p-1 rounded-2xl border border-white/20 shadow-2xl">
           <div className="bg-white/90 p-8 flex items-center gap-5 border border-white rounded-xl">
              <img src={mkaulogo} className="w-12 h-12 object-contain rounded-lg" alt="MAU Logo" />
              <div className="text-[#006064]">
                 <p className="text-[11px] font-black uppercase tracking-widest text-[#006064]/50">መቅደላ አምባ ዩኒቨርሲቲ</p>
                 <h4 className="text-lg font-black uppercase leading-none italic">Tulu Awulia Main Campus</h4>
              </div>
           </div>
        </div>
      </section>

      {/* 🔍 3. SEARCH SECTION */}
      <section className="container mx-auto px-6 -mt-12 relative z-20">
         <form onSubmit={handleSearch} className="max-w-5xl mx-auto bg-white rounded-full shadow-2xl p-3 flex items-center gap-4 border border-gray-100">
            <div className="flex-1 flex items-center px-10">
               <Search size={26} className="text-gray-300 mr-5" />
               <input 
                 type="text" 
                 placeholder="Search buildings, places, departments..." 
                 className="w-full bg-transparent outline-none text-lg font-bold text-[#006064] placeholder-gray-300"
                 value={searchQuery}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <button type="submit" className="bg-[#006064] text-white px-16 py-5 rounded-full font-black uppercase text-sm tracking-[3px] hover:bg-[#004d40] transition-all">SEARCH</button>
         </form>
      </section>

      {/* 🧱 4. FEATURES SECTION */}
      <section className="container mx-auto px-16 py-28 grid md:grid-cols-4 gap-10">
   {[
     { title: 'Interactive Map', desc: 'Explore campus with high-quality satellite maps.', icon: <MapIcon size={30}/>, path: '/map/1', action: 'Open Map', bg: 'bg-blue-50' },
     { title: 'Get Directions', desc: 'Step-by-step navigation from your GPS location.', icon: <Navigation size={30} className="rotate-45" />, path: '/map/1', action: 'Get Started', bg: 'bg-indigo-50' },
     { title: 'Our Campuses', desc: 'Discover facilities at Tulu Awulia and Mekane Selam.', icon: <School size={30}/>, path: '/campuses', action: 'View Campuses', bg: 'bg-teal-50' },
     { title: 'Learn More', desc: 'Access university news and campus info.', icon: <Info size={30}/>, path: '/about', action: 'About Us', bg: 'bg-purple-50' }
   ].map((feat, i) => (
     /* 🚀 እዚህ ጋር onClick ተጨምሯል - ሙሉው ካርድ ጠቅ ሲደረግ እንዲሄድ */
     <div 
        key={i} 
        onClick={() => navigate(feat.path)} 
        className="bg-white p-10 rounded-[40px] border border-gray-50 hover:shadow-3xl transition-all group flex flex-col items-start gap-5 hover:-translate-y-2 cursor-pointer"
     >
        <div className={`p-5 ${feat.bg} text-[#006064] rounded-[25px] group-hover:bg-[#006064] group-hover:text-white transition-all duration-500`}>
           {feat.icon}
        </div>
        <h3 className="text-xl font-black text-[#006064] uppercase italic text-left">{feat.title}</h3>
        <p className="text-sm font-bold text-gray-400 leading-relaxed italic text-left">{feat.desc}</p>
        
        {/* 🚀 በተኑም ቢሆን ወደ ተፈለገው ገጽ እንዲወስድ ተደርጓል */}
        <button className="mt-4 text-[11px] font-black uppercase text-[#006064] flex items-center gap-3 tracking-[4px] group-hover:gap-5 transition-all">
           {feat.action} <ArrowRight size={16} />
        </button>
     </div>
   ))}
</section>

      {/* 🏫 5. OUR CAMPUSES SECTION */}
      <section className="bg-gray-50 py-32 px-16">
         <div className="container mx-auto">
            <div className="flex justify-between items-end mb-16 border-b-2 border-gray-100 pb-8">
               <div className="text-left">
                  <h2 className="text-5xl font-black text-[#006064] uppercase italic tracking-tighter">Our Campuses</h2>
                  <div className="h-2 w-24 bg-[#fbc02d] mt-4 rounded-full"></div>
               </div>
               <button onClick={() => navigate('/map/1')} className="text-xs font-black text-[#006064] uppercase flex items-center gap-3 hover:underline tracking-[5px]">View All Sites <ArrowRight size={20}/></button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
               {[
                 { name: 'Tulu Awulia Main Campus', loc: 'Amba Alage', img: tuluImg, id: 1 },
                 { name: 'Mekane Selam Campus', loc: 'South Wollo', img: mekaneImg, id: 2 }
               ].map((camp, i) => (
                 <div key={i} className="bg-white rounded-[50px] overflow-hidden flex flex-col md:flex-row shadow-2xl hover:scale-[1.02] transition-all border border-white">
                    <div className="md:w-1/2 h-72"><img src={camp.img} className="w-full h-full object-cover" alt={camp.name} /></div>
                    <div className="md:w-1/2 p-12 flex flex-col justify-center gap-5 text-left">
                       <h3 className="text-3xl font-black text-[#006064] uppercase tracking-tighter italic leading-tight">{camp.name}</h3>
                       <div className="flex items-center gap-3 text-gray-400 font-bold"><MapPin size={18} className="text-[#fbc02d]"/> <span className="text-xs tracking-widest">{camp.loc}</span></div>
                       <button onClick={() => navigate(`/map/${camp.id}`)} className="mt-6 bg-[#006064] text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-[4px] hover:bg-[#004d40] transition-all shadow-xl">EXPLORE SITE</button>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 🏁 6. FOOTER (Professional Design) */}
      <footer className="bg-[#006064] text-white pt-24 pb-12 px-16 border-t-[12px] border-[#fbc02d]">
         <div className="container mx-auto grid md:grid-cols-4 gap-20 mb-24 text-left">
            <div className="space-y-8">
               <div className="flex items-center gap-5">
                  {/* ✅ Fixed: Using mkaulogo instead of white box */}
                  <img src={mkaulogo} className="w-16 h-16 object-contain rounded-full border-2 border-[#fbc02d]/20 shadow-md" alt="Logo" />
                  <div className="flex flex-col">
                    <h4 className="text-xl font-black uppercase leading-none tracking-tight">Mekdela Amba University</h4>
                    <span className="text-[11px] font-bold text-white/50 mt-1 uppercase">መቅደላ አምባ ዩኒቨርሲቲ</span>
                  </div>
               </div>
               <p className="text-sm font-bold text-white/60 leading-relaxed italic uppercase tracking-wider">Empowering minds, building the future. Providing world-class quality education for all excellence.</p>
            </div>

            <div>
               <h4 className="text-sm font-black uppercase tracking-[5px] mb-10 text-[#fbc02d]">Quick Links</h4>
               <ul className="space-y-5 text-xs font-bold text-white/70">
                  {['Home', 'University Map', 'Campuses', 'About Us', 'Services', 'News', 'Contact', 'FAQs'].map((link) => (
                    <li key={link} className="hover:text-[#fbc02d] cursor-pointer transition-colors uppercase tracking-[2px]">{link}</li>
                  ))}
               </ul>
            </div>

            <div>
               <h4 className="text-sm font-black uppercase tracking-[5px] mb-10 text-[#fbc02d]">Contact Info</h4>
               <ul className="space-y-8">
                  <li className="flex items-center gap-5 text-xs font-bold tracking-widest"><MapPin size={22} className="text-[#fbc02d]"/> Mekdela Amba, Ethiopia</li>
                  <li className="flex items-center gap-5 text-xs font-bold tracking-widest"><Mail size={22} className="text-[#fbc02d]"/> info@mau.edu.et</li>
                  <li className="flex items-center gap-5 text-xs font-bold tracking-widest"><Phone size={22} className="text-[#fbc02d]"/> +251 900 000 000</li>
               </ul>
            </div>

            <div>
               <h4 className="text-sm font-black uppercase tracking-[5px] mb-10 text-[#fbc02d]">Follow Us</h4>
               <div className="flex gap-5">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-[#fbc02d] hover:text-[#006064] cursor-pointer transition-all shadow-2xl"><FacebookIcon /></div>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-[#fbc02d] hover:text-[#006064] cursor-pointer transition-all shadow-2xl"><TwitterIcon /></div>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-[#fbc02d] hover:text-[#006064] cursor-pointer transition-all shadow-2xl"><InstagramIcon /></div>
               </div>
            </div>
         </div>

         <div className="container mx-auto pt-12 border-t border-white/10 text-center">
            <p className="text-[11px] font-black text-white/30 tracking-[10px] uppercase italic">
               © {new Date().getFullYear()} MEKDELA AMBA UNIVERSITY. ALL RIGHTS RESERVED. | DEVELOPED BY "YGSH"
            </p>
         </div>
      </footer>
    </div>
  );
};

export default Home;