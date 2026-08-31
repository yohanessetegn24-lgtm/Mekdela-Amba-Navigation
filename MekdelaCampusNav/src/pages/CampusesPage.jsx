import React, { useState, useEffect } from 'react'; // useState እና useEffect ተጨምሯል
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // api ተጨምሯል
import { ChevronLeft, MapPin, Building2, Users, School, Loader2 } from 'lucide-react';
import tuluImg from '../assets/mekdelaambauniversity.jpg'; 
import mekaneImg from '../assets/homepage.jpg'; 

const CampusesPage = () => {
  const navigate = useNavigate();
  const [campuses, setCampuses] = useState([]); // ዳታቤዝ የሚመጡ ካምፓሶች መያዣ
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ካምፓሶችን ከዳታቤዝ መጥራት
    api.get('/Campuses')
      .then(res => {
        setCampuses(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching campuses:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center text-[#006064]">
        <Loader2 className="animate-spin mb-4" size={60} />
        <h2 className="font-black tracking-widest uppercase italic">Loading Campuses...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-10 italic">
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center gap-2 text-[#006064] font-black uppercase text-xs mb-10"
      >
        <ChevronLeft /> Back to Home
      </button>

      <h1 className="text-5xl font-black text-[#006064] uppercase mb-16 tracking-tighter">
        Our University Campuses
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
        {campuses.map(c => (
          <div key={c.Id || c.id} className="bg-white rounded-[50px] overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
            <div className="h-80">
              <img 
                src={c.ImageUrl || (c.Id === 2 ? mekaneImg : tuluImg)} 
                className="w-full h-full object-cover" 
                alt={c.Name || c.name} 
              />
            </div>
            <div className="p-12 space-y-6 flex-1 flex flex-col">
              <h2 className="text-3xl font-black text-[#006064] uppercase leading-tight">
                {c.Name || c.name}
              </h2>
              
              <p className="text-gray-400 text-xs font-bold uppercase line-clamp-2 italic">
                {c.Description || "Discover world-class education at our university campus."}
              </p>

              <div className="grid grid-cols-2 gap-6 mt-auto">
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                  <MapPin className="text-[#fbc02d]"/>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    {c.Location || "የሚገኝበት ቦታ"}
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                  <Users className="text-[#fbc02d]"/>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    የብዙ ተማሪዎች የእውቀትና የሥነ-ምግባር ማሳደጊያ ተቋም
                  </span>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/map/${c.Id || c.id}`)} 
                className="w-full bg-[#006064] text-white py-5 rounded-2xl font-black uppercase text-sm shadow-xl hover:bg-[#004d40] transition-all"
              >
                Open Campus Map
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampusesPage;