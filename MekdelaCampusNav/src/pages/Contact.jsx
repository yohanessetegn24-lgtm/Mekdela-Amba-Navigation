import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white font-sans p-16 italic">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#006064] font-black uppercase text-xs mb-10"><ChevronLeft /> Back</button>
      <div className="max-w-2xl mx-auto bg-gray-50 p-16 rounded-[60px] shadow-2xl space-y-12">
        <h1 className="text-5xl font-black text-[#006064] uppercase text-center">Contact Us</h1>
        <div className="space-y-8">
          <div className="flex items-center gap-6"><Mail className="text-[#fbc02d]"/><span className="text-lg font-black text-[#006064]">info@mau.edu.et</span></div>
          <div className="flex items-center gap-6"><Phone className="text-[#fbc02d]"/><span className="text-lg font-black text-[#006064]">+251 900 000 000</span></div>
          <div className="flex items-center gap-6"><MapPin className="text-[#fbc02d]"/><span className="text-lg font-black text-[#006064]">Mekdela Amba, Ethiopia</span></div>
        </div>
      </div>
    </div>
  );
};
export default Contact;