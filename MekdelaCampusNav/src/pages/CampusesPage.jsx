import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Building2, Users, School } from 'lucide-react';
import tuluImg from '../assets/mekdelaambauniversity.jpg'; 
import mekaneImg from '../assets/homepage.jpg'; 

const CampusesPage = () => {
  const navigate = useNavigate();
  const campuses = [
    { id: 1, name: 'Tulu Awulia Main Campus', location: 'Amba Alage', img: tuluImg, students: '8,000+', faculties: '5' },
    { id: 2, name: 'Mekane Selam Campus', location: 'South Wollo', img: mekaneImg, students: '4,000+', faculties: '3' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-10 italic">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#006064] font-black uppercase text-xs mb-10"><ChevronLeft /> Back to Home</button>
      <h1 className="text-5xl font-black text-[#006064] uppercase mb-16 tracking-tighter">Our University Campuses</h1>
      <div className="grid md:grid-cols-2 gap-12 max-w-7xl mx-auto">
        {campuses.map(c => (
          <div key={c.id} className="bg-white rounded-[50px] overflow-hidden shadow-2xl border border-gray-100">
            <div className="h-80"><img src={c.img} className="w-full h-full object-cover" alt={c.name} /></div>
            <div className="p-12 space-y-6">
              <h2 className="text-3xl font-black text-[#006064] uppercase leading-tight">{c.name}</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl"><MapPin className="text-[#fbc02d]"/><span className="text-xs font-bold text-gray-500">{c.location}</span></div>
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl"><Users className="text-[#fbc02d]"/><span className="text-xs font-bold text-gray-500">{c.students} Students</span></div>
              </div>
              <button onClick={() => navigate(`/map/${c.id}`)} className="w-full bg-[#006064] text-white py-5 rounded-2xl font-black uppercase text-sm shadow-xl hover:bg-[#004d40]">Open Campus Map</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default CampusesPage;