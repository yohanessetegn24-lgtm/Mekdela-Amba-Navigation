import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white font-sans p-16 italic">
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center gap-2 text-[#006064] font-black uppercase text-xs mb-10 hover:text-black transition-colors"
      >
        <ChevronLeft /> Back
      </button>
      
      <div className="max-w-2xl mx-auto bg-gray-50 p-16 rounded-[60px] shadow-2xl space-y-12">
        <h1 className="text-5xl font-black text-[#006064] uppercase text-center">Contact Us</h1>
        
        <div className="space-y-8">
          
          {/* 🚀 አዲስ ዘዴ፡ በቀጥታ የ Gmail ዌብሳይትን አዲስ ታብ ላይ ይከፍታል */}
          <a 
            href="https://mail.google.com/mail/?view=cm&fs=1&to=felegediget@gmail.com&su=Contact+from+Website" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-6 group cursor-pointer hover:bg-gray-200 p-3 rounded-2xl transition-all w-fit"
          >
            <Mail className="text-[#fbc02d] group-hover:scale-110 transition-transform" />
            <span className="text-lg font-black text-[#006064] group-hover:text-black transition-colors">
              felegediget@gmail.com
            </span>
          </a>

          {/* Phone - Clickable (Opens Phone Dialer) */}
          <a 
            href="tel:+251977292982" 
            className="flex items-center gap-6 group cursor-pointer hover:bg-gray-200 p-3 rounded-2xl transition-all w-fit"
          >
            <Phone className="text-[#fbc02d] group-hover:scale-110 transition-transform" />
            <span className="text-lg font-black text-[#006064] group-hover:text-black transition-colors">
              +251 977 292 982
            </span>
          </a>

          {/* Location / Address */}
          <div className="flex items-center gap-6 p-3 w-fit cursor-default">
            <MapPin className="text-[#fbc02d]" />
            <span className="text-lg font-black text-[#006064]">
              Mekdela Amba, Ethiopia
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
