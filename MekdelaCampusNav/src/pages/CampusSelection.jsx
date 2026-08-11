import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';

const CampusSelection = () => {
  const navigate = useNavigate();
  const campuses = [
    { id: 1, name: 'Tulu Awulia', type: 'Main Campus', img: 'https://mau.edu.et/wp-content/uploads/2022/10/MAU-Gate.jpg' },
    { id: 2, name: 'Mekane Selam', type: 'Medicine & Health', img: 'https://mau.edu.et/wp-content/uploads/2022/10/MAU-Gate.jpg' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-ma-blue mb-4">Choose Your Campus</h2>
          <div className="w-24 h-2 bg-ma-gold mx-auto rounded-full"></div>
          <p className="text-gray-500 mt-6 text-lg">Select a location to start your smart navigation journey</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {campuses.map(c => (
            <div key={c.id} className="group bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 hover:border-ma-gold transition-all duration-500 transform hover:-translate-y-4">
              <div className="h-64 relative overflow-hidden">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ma-blue/80 to-transparent"></div>
                <div className="absolute bottom-6 left-8 text-white">
                  <p className="text-ma-gold font-bold text-sm uppercase tracking-widest mb-1">{c.type}</p>
                  <h3 className="text-3xl font-black">{c.name}</h3>
                </div>
              </div>
              <div className="p-8">
                <button 
                  onClick={() => navigate(`/map/${c.id}`)}
                  className="w-full flex items-center justify-center gap-3 bg-ma-blue text-white py-5 rounded-[20px] font-bold text-lg group-hover:bg-ma-gold group-hover:text-ma-blue transition-all duration-300 shadow-xl"
                >
                  Select Campus <ArrowRight size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampusSelection;