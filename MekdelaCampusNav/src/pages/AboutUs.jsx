import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Award, Target, Eye } from 'lucide-react';

const AboutUs = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white font-sans p-16 italic">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#006064] font-black uppercase text-xs mb-10"><ChevronLeft /> Back</button>
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <h1 className="text-6xl font-black text-[#006064] uppercase tracking-tighter">About Mekdela Amba</h1>
        <p className="text-xl font-bold text-gray-400 leading-relaxed uppercase">Mekdela Amba University is a center of academic excellence dedicated to producing competent graduates and conducting impactful research.</p>
        <div className="grid md:grid-cols-3 gap-8 pt-10 text-[#006064]">
          <div className="bg-gray-50 p-10 rounded-3xl space-y-4"><Award size={40}/><h4 className="font-black uppercase">Excellence</h4></div>
          <div className="bg-gray-50 p-10 rounded-3xl space-y-4"><Target size={40}/><h4 className="font-black uppercase">Mission</h4></div>
          <div className="bg-gray-50 p-10 rounded-3xl space-y-4"><Eye size={40}/><h4 className="font-black uppercase">Vision</h4></div>
        </div>
      </div>
    </div>
  );
};
export default AboutUs;