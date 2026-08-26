import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, GraduationCap, MapPinned, Users2 } from 'lucide-react';

const Services = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 font-sans p-16 italic">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#006064] font-black uppercase text-xs mb-10"><ChevronLeft /> Back</button>
      <h1 className="text-6xl font-black text-[#006064] uppercase mb-16 text-center">Our Services</h1>
      <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        <div className="bg-white p-12 rounded-[40px] shadow-xl text-center space-y-6">
          <GraduationCap size={50} className="mx-auto text-[#fbc02d]"/>
          <h3 className="text-xl font-black uppercase text-[#006064]">Quality Education</h3>
          <p className="text-xs font-bold text-gray-400">Leading undergraduate and postgraduate programs.</p>
        </div>
        <div className="bg-white p-12 rounded-[40px] shadow-xl text-center space-y-6">
          <MapPinned size={50} className="mx-auto text-[#fbc02d]"/>
          <h3 className="text-xl font-black uppercase text-[#006064]">Smart Navigation</h3>
          <p className="text-xs font-bold text-gray-400">Advanced campus mapping for students and visitors.</p>
        </div>
      </div>
    </div>
  );
};
export default Services;