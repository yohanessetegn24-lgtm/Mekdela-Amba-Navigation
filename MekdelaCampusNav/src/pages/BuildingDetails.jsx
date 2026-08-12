import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Navigation, Clock, Ruler, ArrowLeft, Heart, Share2 } from 'lucide-react';

const BuildingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [building, setBuilding] = useState(null);

  useEffect(() => {
    api.get(`/Buildings/${id}`).then(res => setBuilding(res.data));
  }, [id]);

  if (!building) return <div className="h-screen flex items-center justify-center font-black italic text-ma-blue">Loading Building Info...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-28 pb-10 container mx-auto px-6 max-w-4xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-ma-blue"><ArrowLeft size={20}/> Back to Map</button>
        
        <div className="bg-white rounded-[50px] shadow-2xl overflow-hidden border border-gray-100">
           {/* Building Image */}
           <div className="h-96 relative">
              <img src={building.imageUrl || 'https://via.placeholder.com/800x400'} className="w-full h-full object-cover" alt={building.name} />
              <div className="absolute top-8 right-8 flex gap-3">
                 <button className="bg-white/90 p-3 rounded-2xl shadow-xl text-red-500 hover:scale-110 transition"><Heart size={24}/></button>
                 <button className="bg-white/90 p-3 rounded-2xl shadow-xl text-ma-blue hover:scale-110 transition"><Share2 size={24}/></button>
              </div>
           </div>

           {/* Building Content */}
           <div className="p-12">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h2 className="text-5xl font-black text-ma-blue italic tracking-tighter">{building.name}</h2>
                    <span className="bg-ma-gold/10 text-ma-gold px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest mt-4 inline-block italic">Academic Center</span>
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-10">
                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center"><Ruler size={24} className="mx-auto mb-2 text-ma-blue"/><p className="text-xl font-black text-ma-blue">450m</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Distance</p></div>
                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center"><Clock size={24} className="mx-auto mb-2 text-ma-blue"/><p className="text-xl font-black text-ma-blue">6 min</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Walking</p></div>
                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center"><Map size={24} className="mx-auto mb-2 text-ma-blue"/><p className="text-xl font-black text-ma-blue">2nd Floor</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Location</p></div>
              </div>

              <p className="text-lg text-gray-500 italic leading-relaxed mb-10">{building.description || "Detailed information about this facility is coming soon."}</p>

              <button className="w-full bg-ma-blue text-white py-6 rounded-[30px] font-black text-2xl uppercase tracking-tighter hover:bg-blue-900 shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-transform">
                 <Navigation size={32} /> Navigate to this building
              </button>
           </div>
        </div>
      </main>
    </div>
  );
};

export default BuildingDetails;