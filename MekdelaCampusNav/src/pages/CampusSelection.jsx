import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

// 🚀 ያንተን ፎቶዎች እዚህ ጋር እናስገባለን
import tuluImg from '../assets/mekdelaambauniversity.jpg'; 
import mekaneImg from '../assets/homepage.jpg'; 

const CampusSelection = () => {
  const navigate = useNavigate();

  const campuses = [
    { 
      id: 1, 
      name: 'Tulu Awulia', 
      type: 'Main Campus', 
      img: tuluImg // 👈 የቱሉ አውልያ ፎቶ
    },
    { 
      id: 2, 
      name: 'Mekane Selam', 
      type: 'Secondary Campus', 
      img: mekaneImg // 👈 ለጊዜው ሆም ፔጅ ላይ ያለው ፎቶ
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans italic font-bold">
      {/* 1. ናቭባር ተጨምሯል */}
      <Navbar />

      <div className="pt-32 px-6 max-w-6xl mx-auto pb-20">
        
        {/* 2. ወደ ኋላ መመለሻ በተን (Back Button) */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-ma-blue mb-8 hover:text-ma-gold transition-all group"
        >
          <div className="bg-white p-2 rounded-full shadow-md group-hover:bg-ma-gold group-hover:text-white transition-all">
            <ChevronLeft size={20} />
          </div>
          <span className="uppercase tracking-widest text-xs">Back to Home</span>
        </button>

        {/* ርዕስ */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
          <h2 className="text-5xl md:text-6xl font-black text-ma-blue mb-4 tracking-tighter leading-none">
            Choose Your <span className="text-ma-gold">Campus</span>
          </h2>
          <div className="w-24 h-2 bg-ma-gold mx-auto rounded-full"></div>
          <p className="text-gray-400 mt-6 text-lg font-medium italic">Select a location to start your smart navigation journey</p>
        </div>

        {/* የካምፓስ ካርዶች */}
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto leading-none">
          {campuses.map((c, index) => (
            <div 
              key={c.id} 
              className={`group bg-white rounded-[50px] shadow-2xl overflow-hidden border border-gray-100 hover:border-ma-gold transition-all duration-500 transform hover:-translate-y-4 animate-in fade-in zoom-in duration-700 delay-${index * 200}`}
            >
              <div className="h-72 relative overflow-hidden">
                <img 
                  src={c.img} 
                  alt={c.name} 
                  className="w-full h-full object-cover transition duration-1000 group-hover:scale-110" 
                />
                {/* የሚያምር ሼድ (Gradient) */}
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