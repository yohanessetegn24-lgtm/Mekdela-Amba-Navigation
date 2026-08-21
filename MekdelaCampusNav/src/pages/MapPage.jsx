import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import api from '../services/api'; 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Navigation, Clock, Ruler, ChevronLeft, LocateFixed, Menu, Loader2, LogOut, 
  Search, Building2, Map as MapIcon, X, MapPin, Footprints, Car, Square, 
  Share2, Star, Info, Printer, Layers, Home, Plus, Minus, User, MapPinned, SendHorizontal, LogIn, ArrowRight
} from 'lucide-react';

// 🚀 አስፈላጊ የሆኑ ፎቶዎች
import sidePhoto from '../assets/mekdelaambauniversity.jpg';
import mkaulogo from '../assets/mkaulogo.jpg';
import tuluImg from '../assets/mekdelaambauniversity.jpg'; 
import mekaneImg from '../assets/homepage.jpg'; 

// --- 🚀 1. Helper: getDist (ስህተቱን ለመፍታት እዚህ ታክሏል) ---
const getDist = (p1, p2) => {
    if (!p1 || !p2 || !p1[0] || !p2[0]) return 0;
    const R = 6371000; 
    const dLat = (p2[0] - p1[0]) * Math.PI / 180;
    const dLon = (p2[1] - p1[1]) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// --- 🚀 2. Helper: findPath (መንገድ ፍለጋ ስህተት እንዳይሰጥ) ---
const findPath = (network, startId, endId) => {
    let queue = [[startId]];
    let visited = new Set();
    while (queue.length > 0) {
        let path = queue.shift();
        let node = path[path.length - 1];
        if (node === endId) return path.map(id => {
            const n = network.find(i => i.id === id);
            return [n.latitude, n.longitude];
        });
        if (!visited.has(node)) {
            visited.add(node);
            const currentNode = network.find(n => n.id === node);
            (currentNode?.edges || []).forEach(edge => {
                queue.push([...path, edge.endNodeId]);
            });
        }
    }
    return [];
};

// --- 🚀 Icons Setup ---
const userIconRed = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
});
const navIconGreen = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
});
const buildingIconBlue = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41]
});

// --- 🗺️ Map Controller ---
function MapController({ coords, zoomLevel }) {
  const map = useMap();
  useEffect(() => { 
    if (coords && coords[0] !== 0) {
      map.setView(coords, zoomLevel || 18, { animate: true }); 
    }
  }, [coords, zoomLevel, map]); // Fixed dependencies
  return null;
}

const MapPage = () => {
  const { campusId } = useParams();
  const navigate = useNavigate();
  
  const [buildings, setBuildings] = useState([]);
  const [roadNetwork, setRoadNetwork] = useState([]); 
  const [currentCampus, setCurrentCampus] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [routePath, setRoutePath] = useState([]); 
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [activeBuildingDetails, setActiveBuildingDetails] = useState(null); 
  const [showCampusOverlay, setShowCampusOverlay] = useState(false);
  const [showLocationDetails, setShowLocationDetails] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false); 
  const [distance, setDistance] = useState(0);
  const [eta, setEta] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [navMode, setNavMode] = useState('walking');
  const [showDirectionsMenu, setShowDirectionsMenu] = useState(false);
  const [mapZoom, setMapZoom] = useState(18);
  const [mapCenter, setMapCenter] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [c, b, r] = await Promise.all([
            api.get(`/Campuses/${campusId}`), 
            api.get(`/Buildings/campus/${campusId}`), 
            api.get(`/Roads/network/${campusId}`)
        ]);
        setCurrentCampus(c.data); 
        setBuildings(b.data); 
        setRoadNetwork(r.data || []); 
        setMapCenter([c.data.latitude, c.data.longitude]);
        setLoading(false);
      } catch (err) { setLoading(false); }
    };
    loadData();
    const watchId = navigator.geolocation.watchPosition(pos => setUserPos([pos.coords.latitude, pos.coords.longitude]));
    return () => navigator.geolocation.clearWatch(watchId);
  }, [campusId]);

  // --- 🚀 Fixed useEffect Warning ---
  useEffect(() => {
    if (userPos && selectedBuilding && routePath.length > 0) {
      let d = getDist(userPos, routePath[0]);
      for (let i = 0; i < routePath.length - 1; i++) {
          d += getDist(routePath[i], routePath[i+1]);
      }
      setDistance(Math.round(d)); 
      setEta(Math.max(1, Math.round(d / (navMode === 'walking' ? 80 : 300))));
    }
  }, [userPos, routePath, navMode, selectedBuilding]); // Use fixed states

  const startNav = (target) => {
    setSelectedBuilding(target); 
    setActiveBuildingDetails(null); 
    setShowDirectionsMenu(false); 
    setIsNavigating(true);
    if (userPos && roadNetwork.length > 0) {
       const startNode = roadNetwork.reduce((p, c) => getDist(userPos, [c.latitude, c.longitude]) < getDist(userPos, [p.latitude, p.longitude]) ? c : p);
       const endNode = roadNetwork.reduce((p, c) => getDist([target.latitude, target.longitude], [c.latitude, c.longitude]) < getDist([target.latitude, target.longitude], [p.latitude, p.longitude]) ? c : p);
       const path = findPath(roadNetwork, startNode.id, endNode.id);
       setRoutePath(path.length > 0 ? [[userPos[0], userPos[1]], ...path, [target.latitude, target.longitude]] : [[userPos[0], userPos[1]], [target.latitude, target.longitude]]);
    } else if (userPos) { 
        setRoutePath([[userPos[0], userPos[1]], [target.latitude, target.longitude]]); 
    }
  };

  const handleStopNavigation = () => {
    setIsNavigating(false); setSelectedBuilding(null); setRoutePath([]); setDistance(0); setEta(0);
  };

  if (loading) return <div className="h-screen w-full bg-[#001838] flex items-center justify-center text-white font-black uppercase tracking-widest"><Loader2 className="animate-spin mr-4 text-ma-gold" size={40}/> MAP LOADING...</div>;

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden font-sans italic font-bold leading-none bg-white">
      
      {/* 🏛️ 1. FULL WIDTH HEADER */}
      <header className="bg-[#00204E] h-20 w-full flex items-center px-6 border-b-4 border-ma-gold z-50 no-print shadow-2xl shrink-0">
         <div className="bg-white p-1 rounded-full border-2 border-ma-gold mr-6 shadow-lg overflow-hidden w-14 h-14 flex items-center justify-center">
            <img src={mkaulogo} className="h-full w-full object-contain" alt="Logo" />
         </div>
         <div className="flex-1 overflow-hidden relative">
            <div className="whitespace-nowrap animate-marquee-bounce text-ma-gold font-black text-2xl tracking-[8px] drop-shadow-md">
               UNIVERSITY OF MEKDELA AMBA
            </div>
         </div>
         <button onClick={() => navigate('/login')} className="bg-ma-gold text-[#00204E] px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-white transition-all shadow-xl active:scale-95 ml-4">
            <LogIn size={18} /> Login
         </button>
      </header>

      {/* 🧩 2. MAIN MAP AREA */}
      <div className="flex-1 relative h-full w-full">
           
           <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-2xl bg-white/95 backdrop-blur-md px-4 py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-2xl flex items-center gap-3 border border-ma-gold/20 no-print">
              <div className="flex-1 bg-slate-50 rounded-xl flex items-center px-4 py-2.5 border shadow-inner">
                 <input 
                   type="text" placeholder="Search Buildings..." 
                   className="w-full bg-transparent outline-none text-xs font-black text-slate-700 italic uppercase"
                   value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 {searchTerm && <X size={20} className="text-slate-400 cursor-pointer" onClick={() => setSearchTerm("")}/>}
              </div>
              <button className="bg-[#00204E] text-ma-gold px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-ma-gold/30 hover:bg-black transition-all shadow-lg">SEARCH</button>
           </div>

           <MapContainer center={[10.7, 38.7]} zoom={18} style={{ height: "100%", width: "100%" }} zoomControl={false}>
             <TileLayer url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} />
             <MapController coords={activeBuildingDetails ? [activeBuildingDetails.latitude, activeBuildingDetails.longitude] : mapCenter} zoomLevel={mapZoom} />

             {userPos && <Marker position={userPos} icon={isNavigating ? navIconGreen : userIconRed}><Popup>Your Location</Popup></Marker>}
             
             {searchTerm && buildings.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase())).map(b => (
               <Marker key={b.id} position={[b.latitude, b.longitude]} icon={buildingIconBlue} eventHandlers={{ click: () => setActiveBuildingDetails(b) }}>
                   <Popup className="font-black italic">{b.name}</Popup>
               </Marker>
             ))}

             {routePath.length > 0 && <Polyline positions={routePath} color={navMode === 'walking' ? "#C4A006" : "#3b82f6"} weight={8} opacity={0.9} dashArray="1, 15" lineCap="round" />}
           </MapContainer>

           {/* 🎮 RIGHT SIDE FLOATING TOOLS */}
           <div className="absolute right-6 top-6 z-40 flex flex-col gap-4 no-print">
              <button onClick={() => navigate('/')} title="Home" className="bg-white p-4 rounded-2xl shadow-2xl text-slate-700 border-2 border-slate-50 hover:text-ma-blue active:scale-90 transition-all"><Home size={26}/></button>
              <button className="bg-white p-4 rounded-2xl shadow-2xl text-slate-700 border-2 border-slate-50 active:scale-90"><Layers size={26}/></button>
              <div className="flex flex-col bg-white rounded-2xl shadow-2xl border-2 border-slate-100 overflow-hidden">
                 <button onClick={() => setMapZoom(z => Math.min(z + 1, 20))} className="p-4 hover:bg-slate-50 border-b active:bg-slate-200"><Plus size={24}/></button>
                 <button onClick={() => setMapZoom(z => Math.max(z - 1, 10))} className="p-4 hover:bg-slate-50 active:bg-slate-200"><Minus size={24}/></button>
              </div>
              <button onClick={() => userPos && setMapCenter([...userPos])} className="bg-white p-4 rounded-2xl shadow-2xl text-ma-blue border-4 border-ma-gold/40 active:scale-90 transition-all"><LocateFixed size={28}/></button>
           </div>

           {/* 📱 FLOATING BOTTOM MENU */}
           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl bg-white/95 backdrop-blur-md border-2 border-ma-gold/10 rounded-[35px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] flex justify-around items-center py-4 no-print overflow-hidden">
              <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={() => setShowLocationDetails(true)}>
                 <div className={`p-2.5 rounded-2xl transition-all ${showLocationDetails ? 'bg-ma-blue text-white shadow-xl' : 'group-hover:bg-blue-50'}`}><MapPin size={26} className={showLocationDetails ? 'text-white' : 'text-slate-300 group-hover:text-ma-blue'} /></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-ma-blue">Locations</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={() => setShowDirectionsMenu(!showDirectionsMenu)}>
                 <div className={`p-2.5 rounded-2xl transition-all shadow-inner ${showDirectionsMenu ? 'bg-ma-blue text-white shadow-xl' : 'bg-ma-blue/5 text-ma-blue'}`}>
                     <SendHorizontal size={26} className="-rotate-45" />
                 </div>
                 <span className={`text-[10px] font-black uppercase tracking-widest ${showDirectionsMenu ? 'text-ma-blue' : 'text-slate-400'}`}>Directions</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={() => setShowCampusOverlay(true)}>
                 <div className="p-2.5 rounded-2xl group-hover:bg-yellow-50 transition-all"><MapIcon size={26} className="text-ma-gold" /></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-ma-gold">Campuses</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={() => window.print()}>
                 <div className="p-2.5 rounded-2xl group-hover:bg-slate-100 transition-all"><Printer size={26} className="text-slate-300 group-hover:text-slate-700" /></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-700">Print Map</span>
              </div>
           </div>

           {/* 📍 CURRENT LOCATION DETAILS */}
           {showLocationDetails && (
             <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-[70] bg-white rounded-[30px] shadow-2xl p-6 border-b-[8px] border-ma-gold animate-in slide-in-from-bottom-5 min-w-[300px]">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                   <h3 className="font-black text-ma-blue uppercase text-xs italic">My Live Location</h3>
                   <X size={18} className="text-slate-300 cursor-pointer hover:text-red-500" onClick={() => setShowLocationDetails(false)} />
                </div>
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg text-ma-blue"><MapIcon size={14}/></div>
                      <div><p className="text-[8px] text-gray-400 uppercase font-black">Campus Site</p><p className="text-[11px] font-black text-[#00204E]">{currentCampus?.name}</p></div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-2xl border">
                         <p className="text-[7px] text-slate-400 uppercase font-black mb-1">Latitude</p>
                         <p className="text-[10px] font-black text-ma-gold font-mono">{userPos ? userPos[0].toFixed(6) : "Searching..."}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border">
                         <p className="text-[7px] text-slate-400 uppercase font-black mb-1">Longitude</p>
                         <p className="text-[10px] font-black text-ma-gold font-mono">{userPos ? userPos[1].toFixed(6) : "Searching..."}</p>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {/* 🚀 ETA FLOATER */}
           {isNavigating && selectedBuilding && (
              <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-50 bg-[#00204E] text-white px-10 py-5 rounded-full shadow-2xl border-4 border-ma-gold flex items-center gap-10 animate-in slide-in-from-bottom-5">
                 <div className="text-center border-r-2 border-white/20 pr-10"><p className="text-2xl font-black italic leading-none">{distance}m</p><p className="text-[9px] font-black uppercase text-ma-gold mt-2">Distance</p></div>
                 <div className="text-center"><p className="text-2xl font-black italic leading-none">{eta}min</p><p className="text-[9px] font-black uppercase text-ma-gold mt-2">Time</p></div>
                 <button onClick={handleStopNavigation} className="bg-red-500/10 p-3 rounded-2xl hover:bg-red-500 transition-all active:scale-90"><Square size={22} className="text-red-500"/></button>
              </div>
           )}
      </div>

      <footer className="bg-[#00204E] py-4 border-t-2 border-ma-gold/20 text-center no-print shrink-0 z-50">
         <p className="text-[11px] font-black tracking-[8px] text-blue-200 uppercase italic">Developed by <span className="text-ma-gold">"YGSH"</span></p>
      </footer>

      {/* 🏫 CAMPUS OVERLAY */}
      {showCampusOverlay && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-6xl rounded-[60px] shadow-2xl p-16 relative border-t-[20px] border-ma-gold animate-in zoom-in duration-500 overflow-y-auto max-h-[90vh]">
              <button onClick={() => setShowCampusOverlay(false)} className="absolute top-10 right-10 text-slate-300 hover:text-red-500 transition-colors"><X size={50} strokeWidth={3}/></button>
              <div className="text-center mb-16"><h2 className="text-6xl font-black text-ma-blue italic uppercase">Choose Your <span className="text-ma-gold">Campus</span></h2><p className="text-slate-400 mt-6 text-sm font-black uppercase tracking-[4px] italic">Select a location to start your smart navigation journey</p></div>
              <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                 {[{ id: 1, name: 'Tulu Awulia', type: 'Main Campus', img: tuluImg }, { id: 2, name: 'Mekane Selam', type: 'Secondary Campus', img: mekaneImg }].map(c => (
                   <div key={c.id} className="group bg-white rounded-[50px] shadow-2xl overflow-hidden border border-slate-100 hover:border-ma-gold transition-all duration-500 transform hover:-translate-y-4">
                      <div className="h-72 relative"><img src={c.img} className="w-full h-full object-cover transition duration-1000 group-hover:scale-110" alt={c.name} /><div className="absolute inset-0 bg-gradient-to-t from-[#00204E]/90 via-transparent to-transparent"></div><div className="absolute bottom-8 left-10 text-white"><p className="text-ma-gold font-black text-[10px] uppercase tracking-[4px] mb-2">{c.type}</p><h3 className="text-4xl font-black italic tracking-tighter uppercase">{c.name}</h3></div></div>
                      <div className="p-10"><button onClick={() => { setShowCampusOverlay(false); navigate(`/map/${c.id}`); }} className="w-full flex items-center justify-center gap-4 bg-ma-gold text-ma-blue py-6 rounded-[25px] font-black text-lg shadow-xl uppercase active:scale-95 transition-all">Select Campus <ArrowRight size={26} /></button></div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* 🏬 BUILDING DETAILS */}
      {activeBuildingDetails && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-[60px] shadow-2xl overflow-hidden border-t-[16px] border-ma-gold animate-in zoom-in duration-300">
             <div className="p-8 flex justify-between items-center bg-slate-50/50 no-print"><button onClick={() => setActiveBuildingDetails(null)} className="flex items-center gap-2 text-ma-blue font-black uppercase text-xs tracking-widest"><ChevronLeft size={24}/> Back to Map</button><Share2 size={26} className="text-slate-300 cursor-pointer hover:text-ma-blue transition-all"/></div>
             <div className="flex flex-col md:flex-row px-8 pb-10 gap-10">
                <div className="md:w-1/2 aspect-[4/5] rounded-[45px] overflow-hidden shadow-2xl border-8 border-white"><img src={activeBuildingDetails.imageUrl || sidePhoto} className="w-full h-full object-cover" alt="Building"/></div>
                <div className="md:w-1/2 space-y-6 flex flex-col justify-center"><h2 className="text-4xl font-black text-[#00204E] uppercase italic underline decoration-ma-gold decoration-8 underline-offset-4">{activeBuildingDetails.name}</h2>
                   <div className="space-y-5">
                      <div className="flex gap-4 items-center bg-blue-50/50 p-3 rounded-2xl"><MapIcon className="text-ma-blue" size={22}/><div><p className="text-[8px] text-gray-400 uppercase font-black">Campus</p><p className="text-sm font-black italic">{currentCampus?.name}</p></div></div>
                      <div className="flex gap-4 items-center bg-ma-gold/5 p-3 rounded-2xl"><Building2 className="text-ma-gold" size={22}/><div><p className="text-[8px] text-gray-400 uppercase font-black">Type</p><p className="text-sm font-black italic">Academic</p></div></div>
                      <div className="flex gap-4 items-start bg-slate-50 p-3 rounded-2xl"><Info className="text-slate-400" size={22}/><div><p className="text-[8px] text-gray-400 uppercase font-black">Info</p><p className="text-[11px] text-slate-600 font-bold italic leading-relaxed">{activeBuildingDetails.description || "Building information not available"}</p></div></div>
                   </div>
                </div>
             </div>
             <div className="p-10 border-t border-slate-100 flex gap-6 no-print"><button onClick={() => startNav(activeBuildingDetails)} className="flex-1 bg-[#006A4D] text-white py-6 rounded-[30px] font-black text-sm uppercase tracking-[4px] shadow-2xl active:scale-95 flex items-center justify-center gap-4 italic hover:bg-green-700 transition-all"><Navigation size={24} className="rotate-45"/> Navigate Here</button><button className="px-12 py-6 border-4 border-slate-100 rounded-[30px] font-black text-xs text-slate-300 hover:text-ma-gold hover:bg-slate-50 transition-all flex items-center justify-center gap-3 italic"><Star size={24}/> Save</button></div>
          </div>
        </div>
      )}

      {/* 🧭 DIRECTIONS MENU */}
      {showDirectionsMenu && (
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-[70] w-[90%] max-w-xl bg-white rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.4)] p-8 border-b-[14px] border-ma-blue animate-in slide-in-from-bottom-10 no-print">
           <div className="flex justify-between items-center mb-6"><h3 className="font-black text-[#00204E] uppercase italic text-lg tracking-widest">Directions Planner</h3><X className="text-slate-200 cursor-pointer hover:text-red-500" onClick={() => setShowDirectionsMenu(false)}/></div>
           <div className="space-y-6">
              <div className="flex items-center gap-5 bg-slate-50 p-5 rounded-3xl border-2 border-slate-100"><LocateFixed className="text-ma-gold" size={24}/><span className="text-sm text-slate-500 font-black uppercase italic tracking-widest">From: My Current Location</span></div>
              <select className="w-full bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 outline-none text-xs font-black italic uppercase shadow-inner text-ma-blue" onChange={(e) => { const b = buildings.find(b => b.id == e.target.value); if(b) setActiveBuildingDetails(b); }}>
                <option>-- Choose Destination --</option>
                {buildings.map(b => <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>)}
              </select>
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marqueeBounce { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(30%); } }
        .animate-marquee-bounce { animation: marqueeBounce 15s linear infinite alternate; display: inline-block; }
        .leaflet-container { z-index: 1 !important; border-radius: 0 !important; cursor: crosshair; }
        @media print { .no-print { display: none !important; } .leaflet-control-container { display: none !important; } .leaflet-container { height: 100vh !important; } }
      `}} />
    </div>
  );
};

export default MapPage;