import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Map as MapIcon, Building2, LogIn, Menu, Search, 
  Clock, Ruler, Navigation, ChevronLeft, LocateFixed 
} from 'lucide-react';

// --- Icons ---
const userIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] });
const buildingIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] });

// 🚀 ይህ ኮምፖነንት ነው ካርታውን ወደ ተመረጠው ካምፓስ ወዲያውኑ የሚወስደው
function AutoFocusMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 17, { animate: true, duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}

const MapPage = () => {
  const { campusId } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [buildings, setBuildings] = useState([]);
  const [currentCampus, setCurrentCampus] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [targetPos, setTargetPos] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);

  const API_URL = "https://localhost:7086/api";

  useEffect(() => {
    // 1. የመረጥነውን ካምፓስ መረጃ አምጣ
    axios.get(`${API_URL}/Campuses/${campusId}`)
         .then(res => {
            setCurrentCampus(res.data);
            console.log("ካምፓሱ ተገኝቷል:", res.data.name);
         });

    // 2. በዚያ ካምፓስ ያሉ ህንጻዎችን አምጣ
    axios.get(`${API_URL}/Buildings/campus/${campusId}`)
         .then(res => setBuildings(res.data));

    // 3. GPS ተከታተል
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [campusId]);

  const calculateMetrics = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = Math.round(R * c);
    setDistance(dist);
    setEta(Math.round(dist / 1.4 / 60));
  };

  const startNav = (b) => {
    setSelectedBuilding(b);
    setTargetPos([b.latitude, b.longitude]);
    if (userPos) calculateMetrics(userPos[0], userPos[1], b.latitude, b.longitude);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-20'} bg-ma-blue text-white transition-all duration-500 flex flex-col z-30 shadow-2xl`}>
        <div className="p-6 border-b border-blue-900/50 flex items-center gap-4">
          <div className="bg-ma-gold p-2 rounded-xl text-ma-blue shadow-lg"><MapIcon size={24} /></div>
          {isSidebarOpen && (
            <div>
              <h1 className="font-black text-lg leading-none tracking-tighter italic uppercase">MAU NAV</h1>
              <p className="text-[10px] text-ma-gold font-bold uppercase mt-1 tracking-widest">{currentCampus?.name || "Loading..."}</p>
            </div>
          )}
        </div>
        <nav className="flex-1 mt-8 px-4 space-y-4">
          <button onClick={() => navigate('/campuses')} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/10 transition">
            <ChevronLeft size={22} className="text-ma-gold"/> {isSidebarOpen && "Change Campus"}
          </button>
        </nav>
        <button onClick={() => navigate('/')} className="p-8 text-red-300 hover:text-red-400 transition flex items-center gap-4 border-t border-blue-900/50 font-bold text-xs uppercase tracking-widest">
            <LogIn size={20}/> {isSidebarOpen && "Exit"}
        </button>
      </aside>

      {/* MAIN AREA */}
      <main className="flex-1 relative flex flex-col">
        <header className="bg-white h-20 flex items-center justify-between px-8 z-20 border-b border-slate-100 shadow-sm">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-3 hover:bg-slate-100 rounded-2xl transition text-ma-blue"><Menu size={24} /></button>
          <div className="text-right">
             <h2 className="font-black text-ma-blue italic text-lg uppercase tracking-tight">{currentCampus?.name || "Map Viewer"}</h2>
          </div>
        </header>

        <div className="flex-1 relative">
          {/* መጀመሪያ ሲከፈት በግምታዊ ቦታ ይነሳል (በኋላ በ AutoFocusMap ይስተካከላል) */}
          <MapContainer center={[10.7, 39.0]} zoom={15} className="h-full w-full z-10">
            <TileLayer url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} />
            
            {/* 🚀 ይህ መስመር ነው ካምፓሱ እንደመጣ ካርታውን ወዲያውኑ የሚያዞረው */}
            {currentCampus && <AutoFocusMap coords={[currentCampus.latitude, currentCampus.longitude]} />}

            {userPos && <Marker position={userPos} icon={userIcon}><Popup>You are here</Popup></Marker>}

            {buildings.map(b => (
              <Marker key={b.id} position={[b.latitude, b.longitude]} icon={buildingIcon} eventHandlers={{ click: () => startNav(b) }}>
                <Popup className="font-bold">{b.name}</Popup>
              </Marker>
            ))}

            {userPos && targetPos && <Polyline positions={[userPos, targetPos]} color="#C4A006" weight={6} dashArray="10, 15" />}
          </MapContainer>

          <button onClick={() => userPos && setUserPos([...userPos])} className="absolute top-6 right-6 z-[1000] bg-white p-4 rounded-2xl shadow-2xl border border-slate-100"><LocateFixed size={24} className="text-ma-blue"/></button>

          {/* Info Card */}
          {selectedBuilding && (
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-sm px-4">
                <div className="bg-white p-8 rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] border-t-[12px] border-ma-gold animate-in slide-in-from-bottom-10">
                    <h3 className="font-black text-2xl text-ma-blue italic tracking-tighter">{selectedBuilding.name}</h3>
                    <div className="flex gap-4 mt-6">
                        <div className="bg-blue-50 flex-1 p-5 rounded-3xl flex flex-col items-center">
                            <Ruler size={24} className="text-blue-600 mb-1"/>
                            <p className="font-black text-xl text-ma-blue">{distance || '---'} m</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Distance</p>
                        </div>
                        <div className="bg-orange-50 flex-1 p-5 rounded-3xl flex flex-col items-center">
                            <Clock size={24} className="text-orange-600 mb-1"/>
                            <p className="font-black text-xl text-ma-blue">{eta || '---'} min</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Time</p>
                        </div>
                    </div>
                    <button onClick={() => {setSelectedBuilding(null); setTargetPos(null);}} className="w-full mt-6 bg-ma-blue text-white py-5 rounded-[22px] font-black uppercase tracking-widest hover:bg-blue-900 shadow-xl transition">Close</button>
                </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MapPage;