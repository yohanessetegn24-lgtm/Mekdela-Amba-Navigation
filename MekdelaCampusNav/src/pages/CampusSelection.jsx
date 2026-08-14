import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Home } from 'lucide-react'; // Home icon ተጨምሯል

// 🚀 ያንተን ፎቶዎች እና ሎጎ እዚህ ጋር እናስገባለን
import tuluImg from '../assets/mekdelaambauniversity.jpg'; 
import mekaneImg from '../assets/homepage.jpg'; 
import mauLogo from '../assets/mkaulogo.jpg'; // 🚀 Point 1: ሎጎ ተጨምሯል

const CampusSelection = () => {
  const navigate = useNavigate();

  const campuses = [
    { 
      id: 1, 
      name: 'Tulu Awulia', 
      type: 'Main Campus', 
      img: tuluImg 
    },
    { 
      id: 2, 
      name: 'Mekane Selam', 
      type: 'Secondary Campus', 
      img: mekaneImg 
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans italic font-bold leading-none">
      
      {/* 🚀 የተስተካከለ ናቭባር (Navbar) */}
      <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md z-50 px-8 py-4 flex justify-between items-center shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-8">
          {/* Point 1: ሎጎ እና የዩኒቨርሲቲው ስም */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src={mauLogo} alt="Logo" className="w-12 h-12 rounded-xl object-cover shadow-lg border-2 border-white" />
            <div className="leading-none">
              <h1 className="text-ma-blue font-black text-xl tracking-tighter uppercase italic">Mekdela Amba</h1>
              <p className="text-ma-gold text-[9px] font-black tracking-[3px] uppercase">University</p>
            </div>
          </div>

          {/* Point 2: የ "Home" ሊንክ ወደ ግራ ተወስዷል */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-ma-blue hover:text-ma-gold transition-all border-l-2 border-gray-100 pl-8 h-10"
          >
            <Home size={20} className="text-ma-gold" />
            <span className="text-sm font-black uppercase tracking-widest">Home</span>
          </button>
        </div>

        {/* Point 3: 'Campuses' የሚለው ሊንክ እዚህ ጋር ተወግዷል */}

        <button 
          onClick={() => navigate('/login')}
          className="bg-ma-blue text-white px-10 py-3 rounded-xl font-black text-sm hover:bg-blue-900 transition-all shadow-xl italic"
        >
          Login
        </button>
      </nav>

      <div className="pt-40 px-6 max-w-6xl mx-auto pb-20">
        
        {/* Point 4: 'Back to Home' የሚለው በተን ከዚህ ጋር ተወግዷል */}

        {/* ርዕስ */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
          <h2 className="text-5xl md:text-6xl font-black text-ma-blue mb-4 tracking-tighter leading-none">
            Choose Your <span className="text-ma-gold">Campus</span>
          </h2>
          <div className="w-24 h-2 bg-ma-gold mx-auto rounded-full"></div>
          <p className="text-gray-400 mt-6 text-lg font-medium italic">Select a location to start your smart navigation journey</p>
        </div>

        {/* የካምፓስ ካርዶች (ምንም አልተቀየሩም) */}
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto leading-none">
          {campuses.map((c, index) => (
            <div 
              key={c.id} 
              className={`group bg-white rounded-[50px] shadow-2xl overflow-hidden border border-gray-100 hover:border-ma-gold transition-all duration-500 transform hover:-translate-y-4 animate-in fade-in zoom-in duration-700`}
            >
              <div className="h-72 relative overflow-hidden">
                <img 
                  src={c.img} 
                  alt={c.name} 
                  className="w-full h-full object-cover transition duration-1000 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ma-blue/90 via-ma-blue/20 to-transparent"></div>
                
                <div className="absolute bottom-8 left-10 text-white">
                  <p className="text-ma-gold font-black text-xs uppercase tracking-[4px] mb-2 drop-shadow-md leading-none">
                    {c.type}
                  </p>
                  <h3 className="text-4xl font-black italic tracking-tighter drop-shadow-lg leading-none">
                    {c.name}
                  </h3>
                </div>
              </div>

              <div className="p-10 bg-white">
                <button 
                  onClick={() => navigate(`/map/${c.id}`)}
                  className="w-full flex items-center justify-center gap-4 bg-ma-blue text-white py-6 rounded-[25px] font-black text-lg group-hover:bg-ma-gold group-hover:text-ma-blue transition-all duration-300 shadow-xl shadow-blue-900/20 uppercase tracking-widest active:scale-95 leading-none"
                >
                  Select Campus <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* የታችኛው ጽሑፍ */}
      <footer className="text-center pb-10">
         <p className="text-gray-300 text-[10px] font-black uppercase tracking-[10px]">
            Explore Mekdela Amba
         </p>
      </footer>
    </div>
  );
};

export default CampusSelection;