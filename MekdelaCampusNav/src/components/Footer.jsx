import React from 'react';
import { MapPin, Mail, Phone } from 'lucide-react';
import mkaulogo from '../assets/mkaulogo.jpg';

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);
const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-1 2.17-2.82 3.47c1.82 8.3-6.62 14.03-10.9 14.03-4.54 0-6.18-4.57-6.18-4.57 4.15.58 4.85-2.04 4.85-2.04-2.35-.19-3.23-2.26-3.23-2.26 1.64.04 1.6-.98 1.6-.98-1.48-.35-2.35-2.79-2.35-2.79.47.25 1.05.09 1.05.09-1.28-1.24-1.15-3.35-1.15-3.35 2.22 1.64 4.18 2.01 4.85 2.01.05-.65.13-1.24.33-1.74.81-2.04 2.91-3.22 5.02-2.87 1.21.2 2.2 1 2.67 2.1.5.07 1 .3 1.5.59-.2-.5-.5-.9-.9-1.2 1-.1 1.9.2 1.9.2z"></path></svg>
);
const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const Footer = () => {
  return (
    <footer className="bg-[#006064] text-white pt-16 md:pt-24 pb-8 md:pb-12 px-6 md:px-16 border-t-[8px] md:border-t-[12px] border-[#fbc02d] italic font-bold">
       <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-20 mb-16 md:mb-24 text-left">
          <div className="space-y-6">
             <div className="flex items-center gap-4">
                <img src={mkaulogo} className="w-12 h-12 md:w-16 md:h-16 object-contain rounded-full border-2 border-[#fbc02d]/20 shadow-md" alt="Logo" />
                <h4 className="text-sm md:text-xl font-black uppercase leading-tight tracking-tight">Mekdela Amba University</h4>
             </div>
             <p className="text-xs font-bold text-white/60 leading-relaxed italic uppercase tracking-wider">Empowering minds, building the future.</p>
          </div>

          <div>
             <h4 className="text-[10px] md:text-sm font-black uppercase tracking-[3px] md:tracking-[5px] mb-6 md:mb-10 text-[#fbc02d]">Quick Links</h4>
             <ul className="grid grid-cols-2 sm:grid-cols-1 gap-3 md:gap-5 text-[10px] md:text-xs font-bold text-white/70">
                {['Home', 'Map', 'Campuses', 'About Us', 'Services', 'Contact'].map((link) => (
                  <li key={link} className="hover:text-[#fbc02d] cursor-pointer transition-colors uppercase">{link}</li>
                ))}
             </ul>
          </div>

          <div>
             <h4 className="text-[10px] md:text-sm font-black uppercase tracking-[3px] md:tracking-[5px] mb-6 md:mb-10 text-[#fbc02d]">Contact Info</h4>
             <ul className="space-y-4 md:space-y-8">
                <li className="flex items-center gap-4 text-[10px] md:text-xs font-bold"><MapPin size={18} className="text-[#fbc02d]"/> Mekdela Amba, Ethiopia</li>
                <li className="flex items-center gap-4 text-[10px] md:text-xs font-bold"><Mail size={18} className="text-[#fbc02d]"/> info@mau.edu.et</li>
                <li className="flex items-center gap-4 text-[10px] md:text-xs font-bold"><Phone size={18} className="text-[#fbc02d]"/> +251 900 000 000</li>
             </ul>
          </div>

          <div>
             <h4 className="text-[10px] md:text-sm font-black uppercase tracking-[3px] md:tracking-[5px] mb-6 md:mb-10 text-[#fbc02d]">Follow Us</h4>
             <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#fbc02d] hover:text-[#006064] cursor-pointer transition-all"><FacebookIcon /></div>
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#fbc02d] hover:text-[#006064] cursor-pointer transition-all"><TwitterIcon /></div>
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#fbc02d] hover:text-[#006064] cursor-pointer transition-all"><InstagramIcon /></div>
             </div>
          </div>
       </div>

       <div className="container mx-auto pt-8 border-t border-white/10 text-center">
          <p className="text-[9px] md:text-[11px] font-black text-white/30 tracking-[4px] md:tracking-[10px] uppercase italic">
             © {new Date().getFullYear()} MEKDELA AMBA UNIVERSITY.
          </p>
       </div>
    </footer>
  );
};

export default Footer;