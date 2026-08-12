import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import api from '../services/api'; 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Navigation, Clock, Ruler, ChevronLeft, LocateFixed, Menu, Loader2, LogOut, 
  Search, Building2, Map as MapIcon, X, MapPin, Footprints, Car 
} from 'lucide-react';

// --- Icons Setup ---
const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
});

const buildingIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41]
});

function MapViewUpdater({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] !== 0) {
      map.setView(coords, 18, { animate: true, duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}

const MapPage = () => {
  const { campusId } = useParams();
  const navigate = useNavigate();
  
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [buildings, setBuildings] = useState([]);
  const [currentCampus, setCurrentCampus] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [routePath, setRoutePath] = useState([]); 
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [navMode, setNavMode] = useState('walking');

  useEffect(() => {
    const loadCampusData = async () => {
      try {
        const [campusRes, bldgsRes] = await Promise.all([
          api.get(`/Campuses/${campusId}`),
          api.get(`/Buildings/campus/${campusId}`)
        ]);
        setCurrentCampus(campusRes.data);
        setBuildings(bldgsRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setLoading(false);
      }
    };
    loadCampusData();

    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error("GPS Error:", err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [campusId]);

  const startNav = (target) => {
    setSelectedBuilding(target);
    if (userPos) {
       setRoutePath([[userPos[0], userPos[1]], [target.latitude, target.longitude]]);
       const distVal = 480; 
       setDistance(distVal);
       setEta(navMode === 'walking' ? Math.round(distVal / 80) : Math.round(distVal / 300));
    }
    setSearchTerm(""); 
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const filteredBuildings = buildings.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen w-full bg-[#001838] flex flex-col items-center justify-center text-white italic">
      <Loader2 className="animate-spin mb-4 text-ma-gold" size={60} />
      <h2 className="text-xl font-black tracking-widest uppercase italic">Mekdela Amba Navigator...</h2>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden font-sans italic font-bold">
      
      {/* 🟢 1. BOLDER RESPONSIVE SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-[#001838] text-white transition-all duration-500 transform shadow-[5px_0_50px_rgba(0,0,0,0.5)] flex flex-col border-r-4 border-ma-gold/20
        ${isSidebarOpen ? 'translate-x-0 w-85' : '-translate-x-full w-0'}`}>
        
        <div className="p-8 border-b border-white/10 flex items-center gap-4 bg-[#000d26] leading-none">
          <div className="bg-ma-gold p-2.5 rounded-2xl text-[#001838] shadow-2xl shadow-ma-gold/30 leading-none">
            <MapIcon size={26} strokeWidth={3} />
          </div>
          <div className="leading-none text-left">
            <h1 className="font-black text-2xl tracking-tighter uppercase leading-none italic text-white">MAU NAV</h1>
            <p className="text-[10px] text-ma-gold font-bold uppercase mt-1.5 tracking-[4px] leading-none italic">University Portal</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
           <div className="relative group">
              <Search className="absolute left-4 top-4 text-slate-500 group-focus-within:text-ma-gold transition-colors" size={20} />
              <input 
                type="text" placeholder="Search destination..." 
                className="w-full bg-[#00284d] border-2 border-blue-900/50 rounded-2xl py-4 pl-12 pr-4 text-sm font-black outline-none focus:ring-4 focus:ring-ma-gold/20 transition-all leading-none placeholder:text-slate-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

           <button onClick={() => navigate('/campuses')} className="w-full bg-ma-gold/10 border-2 border-ma-gold/30 p-4 rounded-2xl hover:bg-ma-gold hover:text-ma-blue transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest font-black leading-none italic shadow-lg">
              <ChevronLeft size={20} strokeWidth={3}/> Switch Campus
           </button>
        </div>

        <nav className="flex-1 mt-2 px-4 space-y-2 overflow-y-auto custom-scrollbar leading-none text-left">
           {searchTerm && filteredBuildings.map(b => (
             <button key={b.id} onClick={() => startNav(b)} className="w-full flex items-center gap-4 p-5 rounded-2xl bg-white/5 hover:bg-ma-gold hover:text-ma-blue transition-all text-left border border-white/5 mb-3 leading-none group shadow-xl">
                <Building2 size={20} className="text-ma-gold group-hover:text-ma-blue" />
                <span className="text-sm font-black truncate leading-none uppercase italic">{b.name}</span>
             </button>
           ))}
        </nav>

        <button onClick={() => navigate('/')} className="p-8 text-red-400 hover:text-white transition flex items-center justify-center gap-4 border-t border-white/10 uppercase text-[10px] font-black tracking-[5px] leading-none bg-[#000d26] italic">
            <LogOut size={20}/> Exit System
        </button>
      </aside>

      {/* 🔵 MAIN CONTENT AREA */}
      <main className="flex-1 relative h-full w-full flex flex-col leading-none">
        
        {/* Floating Header */}
        <header className="absolute top-6 left-6 right-6 z-40 flex items-center justify-between pointer-events-none leading-none">
           <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-5 bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] text-[#001838] pointer-events-auto active:scale-90 border-2 border-white transition-all"><Menu size={28} /></button>

           <div className="bg-[#001838]/95 backdrop-blur-md px-10 py-5 rounded-[30px] shadow-2xl border-2 border-ma-gold/30 flex flex-col items-end pointer-events-auto leading-none text-white">
              <h2 className="font-black text-ma-gold text-xl uppercase tracking-tighter leading-none italic">{currentCampus?.name}</h2>
              <p className="text-[10px] text-blue-200 font-bold uppercase mt-2 tracking-[2px] leading-none">Satellite Feed Active</p>
           </div>
        </header>

        {/* 🗺️ MAP */}
        <div className="flex-1 relative z-10 leading-none">
          <MapContainer center={[10.7, 38.7]} zoom={18} style={{ height: "100%", width: "100%" }} zoomControl={false}>
            <TileLayer url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} attribution="&copy; Google Satellite" />
            {currentCampus && <MapViewUpdater coords={[currentCampus.latitude, currentCampus.longitude]} />}
            {userPos && <Marker position={userPos} icon={userIcon}><Popup className="font-black">Your Live Location</Popup></Marker>}
            {buildings.map(b => (
              <Marker key={b.id} position={[b.latitude, b.longitude]} icon={buildingIcon} eventHandlers={{ click: () => startNav(b) }}>
                <Popup className="font-black italic uppercase leading-none">{b.name}</Popup>
              </Marker>
            ))}
            {routePath.length > 0 && (
              <Polyline 
                positions={routePath} 
                color={navMode === 'walking' ? "#C4A006" : "#3b82f6"} 
                weight={10} opacity={1} dashArray="1, 20" lineCap="round" 
              />
            )}
          </MapContainer>

          <button onClick={() => userPos && setUserPos([...userPos])} className="absolute top-28 right-8 z-40 bg-white p-5 rounded-3xl shadow-2xl text-[#001838] active:scale-90 border-2 border-white leading-none hover:text-ma-gold transition-colors"><LocateFixed size={30}/></button>
        </div>

        {/* 🚀 2. BOLDER BOTTOM NAVIGATION UI (Toronto/Google Style) */}
        <div className="z-40 bg-white border-t-8 border-ma-gold p-8 shadow-[0_-30px_60px_rgba(0,0,0,0.25)] rounded-t-[60px] animate-in slide-in-from-bottom-10 leading-none">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 items-center leading-none">
                
                {/* Inputs */}
                <div className="flex-1 w-full space-y-4 leading-none text-left">
                    <div className="flex bg-slate-100 p-2 rounded-2xl border-2 border-slate-200 w-full md:w-80 leading-none shadow-inner">
                        <button onClick={() => setNavMode('walking')} className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${navMode === 'walking' ? 'bg-ma-gold text-[#001838] shadow-lg scale-105' : 'text-slate-400'}`}><Footprints size={20}/> Pedestrian</button>
                        <button onClick={() => setNavMode('driving')} className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${navMode === 'driving' ? 'bg-ma-blue text-white shadow-lg scale-105' : 'text-slate-400'}`}><Car size={20}/> Vehicle</button>
                    </div>

                    <div className="flex flex-col gap-4 leading-none">
                       <div className="flex items-center gap-5 bg-slate-50 p-5 rounded-3xl border-2 border-slate-100 leading-none shadow-inner">
                          <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-pulse"></div>
                          <span className="text-[11px] text-slate-500 font-black uppercase tracking-[3px] flex-1 leading-none italic">Start: Your Current Location</span>
                       </div>
                       <div className="flex items-center gap-5 bg-slate-50 p-5 rounded-3xl border-2 border-slate-100 leading-none shadow-inner">
                          <MapPin size={24} className="text-ma-gold" />
                          <span className={`text-lg font-black italic truncate flex-1 uppercase tracking-tighter leading-none ${selectedBuilding ? 'text-ma-blue underline decoration-ma-gold decoration-4 underline-offset-4' : 'text-slate-300'}`}>
                              {selectedBuilding ? selectedBuilding.name : "Choose a destination..."}
                          </span>
                       </div>
                    </div>
                </div>

                {/* Metrics & Button */}
                <div className="flex items-center gap-10 w-full md:w-auto leading-none">
                    {selectedBuilding && (
                        <div className="flex gap-10 border-r-2 border-slate-100 pr-10 leading-none italic">
                            <div className="text-center leading-none">
                                <p className="text-3xl font-black text-[#001838] italic tracking-tighter leading-none">{distance || '---'} m</p>
                                <p className="text-[10px] text-slate-400 font-black uppercase mt-2 leading-none italic tracking-widest">Distance</p>
                            </div>
                            <div className="text-center leading-none">
                                <p className="text-3xl font-black text-[#001838] italic tracking-tighter leading-none">{eta || '---'} min</p>
                                <p className="text-[10px] text-slate-400 font-black uppercase mt-2 leading-none italic tracking-widest">Est. Time</p>
                            </div>
                        </div>
                    )}
                    
                    <button 
                        disabled={!selectedBuilding}
                        className={`flex-1 md:flex-none px-16 py-7 rounded-[35px] font-black text-base uppercase tracking-[4px] transition-all flex items-center justify-center gap-5 shadow-[0_20px_50px_rgba(0,32,78,0.3)] active:scale-95 leading-none
                        ${selectedBuilding ? (navMode === 'walking' ? 'bg-[#001838] text-white hover:bg-black' : 'bg-blue-600 text-white hover:bg-blue-800') : 'bg-slate-200 text-slate-400 cursor-not-allowed italic'}`}
                    >
                        <Navigation size={26} className="rotate-45" /> Start Navigation
                    </button>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
};

export default MapPage;