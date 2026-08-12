import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import api from '../services/api'; 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Navigation, Clock, Ruler, ChevronLeft, LocateFixed, Menu, Loader2, LogOut 
} from 'lucide-react';

// --- የካርታ ምልክቶች (Icons) ---
const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
});

const buildingIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41]
});

// 🚀 ይህ ነው ካርታውን አውቶማቲክ ወደ ካምፓሱ መጋጠሚያ ወስዶ Zoom የሚያደርገው
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
  
  // States
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [buildings, setBuildings] = useState([]);
  const [currentCampus, setCurrentCampus] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [routePath, setRoutePath] = useState([]); 
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. የካምፓሱን እና የህንጻዎቹን መረጃ ከባክኤንድ ማምጣት
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
        console.error("መረጃ ማምጣት አልተቻለም:", err);
        setLoading(false);
      }
    };
    loadCampusData();

    // የተማሪውን መገኛ መከታተል (GPS)
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error("GPS Error:", err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [campusId]);

  // ናቪጌሽን ሲጀመር
  const handleNavigation = (target) => {
    setSelectedBuilding(target);
    if (userPos) {
       // ለጊዜው ቀጥታ መስመር ይስላል
       setRoutePath([[userPos[0], userPos[1]], [target.latitude, target.longitude]]);
       setDistance(250); setEta(3);
    }
  };

  if (loading) return (
    <div className="h-screen w-full bg-[#00204E] flex flex-col items-center justify-center text-white italic">
      <Loader2 className="animate-spin mb-4" size={50} />
      <h2 className="text-xl font-black tracking-widest uppercase text-[#C4A006]">Initializing Smart Map...</h2>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden font-sans italic font-bold leading-none">
      
      {/* 🟢 SIDEBAR (Toronto Style) */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-0'} bg-[#00204E] text-white transition-all duration-500 flex flex-col z-30 shadow-2xl overflow-hidden border-r border-blue-900/50`}>
        <div className="p-6 border-b border-blue-900/50 flex items-center gap-4">
          <div className="bg-[#C4A006] p-2 rounded-xl text-[#00204E] shadow-lg animate-pulse leading-none"><Navigation size={24} /></div>
          {isSidebarOpen && <h1 className="font-black text-lg italic uppercase tracking-tighter">MAU Navigator</h1>}
        </div>
        <nav className="flex-1 mt-8 px-4 space-y-4">
          <button onClick={() => navigate('/campuses')} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-[#C4A006] hover:text-[#00204E] transition font-bold group leading-none">
            <ChevronLeft size={22} className="text-[#C4A006] group-hover:text-[#00204E]"/> {isSidebarOpen && "Switch Campus"}
          </button>
        </nav>
        <button onClick={() => navigate('/')} className="p-8 text-red-300 hover:text-red-400 transition flex items-center gap-4 border-t border-blue-900/50 font-black text-[10px] uppercase tracking-widest leading-none">
            <LogOut size={20}/> {isSidebarOpen && "Exit"}
        </button>
      </aside>

      {/* 🔵 MAIN CONTENT AREA */}
      <main className="flex-1 relative h-full w-full">
        <header className="absolute top-0 left-0 right-0 bg-white/80 backdrop-blur-md h-20 flex items-center justify-between px-8 z-20 border-b border-slate-200 shadow-sm leading-none">
           <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-3 hover:bg-slate-100 rounded-2xl transition text-[#00204E] bg-white border border-slate-100 shadow-sm"><Menu size={24} /></button>
           <div className="text-right">
              <h2 className="font-black text-[#00204E] italic text-xl uppercase tracking-tighter leading-none">{currentCampus?.name || "Campus Map"}</h2>
              <p className="text-[10px] text-[#C4A006] font-bold uppercase mt-1 tracking-widest leading-none">Live Satellite Tracking</p>
           </div>
        </header>

        {/* 🗺️ SATELLITE MAP */}
        <div className="h-full w-full relative z-10">
          <MapContainer center={[10.7, 38.7]} zoom={18} style={{ height: "100%", width: "100%" }}>
            {/* 🛰️ ሳተላይት ማፕ */}
            <TileLayer 
               url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" 
               subdomains={['mt0','mt1','mt2','mt3']} 
               attribution="&copy; Google Satellite" 
            />
            
            {/* 🚀 አውቶማቲክ ፎከስ ማድረጊያው እዚህ አለ */}
            {currentCampus && <MapViewUpdater coords={[currentCampus.latitude, currentCampus.longitude]} />}

            {userPos && <Marker position={userPos} icon={userIcon}><Popup className="font-bold uppercase">You are here</Popup></Marker>}

            {buildings.map(b => (
              <Marker 
                key={b.id} 
                position={[b.latitude, b.longitude]} 
                icon={buildingIcon}
                eventHandlers={{ click: () => handleNavigation(b) }}
              >
                <Popup className="font-black italic text-[#00204E] leading-none uppercase">{b.name}</Popup>
              </Marker>
            ))}

            {routePath.length > 0 && (
              <Polyline positions={routePath} color="#C4A006" weight={8} opacity={0.9} dashArray="10, 15" lineCap="round" />
            )}
          </MapContainer>
        </div>

        {/* Floating Re-center Button */}
        <button onClick={() => userPos && setUserPos([...userPos])} className="absolute top-24 right-6 z-[1000] bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 text-[#00204E] hover:text-[#C4A006] transition-colors"><LocateFixed size={24}/></button>

        {/* ℹ️ INFO CARD */}
        {selectedBuilding && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-sm px-4">
            <div className="bg-white p-8 rounded-[45px] shadow-[0_20px_60px_rgba(0,32,78,0.4)] border-t-[12px] border-[#C4A006] animate-in slide-in-from-bottom-10 leading-none">
              <h3 className="font-black text-2xl text-[#00204E] italic tracking-tighter leading-none uppercase">{selectedBuilding.name}</h3>
              <div className="flex gap-4 mt-6">
                <div className="bg-blue-50 flex-1 p-5 rounded-3xl flex flex-col items-center border border-blue-100 leading-none">
                  <Ruler size={24} className="text-blue-600 mb-1"/><p className="font-black text-xl text-[#00204E]">{distance || '---'} m</p>
                </div>
                <div className="bg-orange-50 flex-1 p-5 rounded-3xl flex flex-col items-center border border-orange-100 leading-none">
                  <Clock size={24} className="text-orange-600 mb-1"/><p className="font-black text-xl text-[#00204E]">{eta || '---'} min</p>
                </div>
              </div>
              <button onClick={() => {setSelectedBuilding(null); setRoutePath([]);}} className="w-full mt-6 bg-[#00204E] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-900 shadow-xl leading-none">End Navigation</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MapPage;