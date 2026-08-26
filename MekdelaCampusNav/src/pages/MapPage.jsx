import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import api from '../services/api'; 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Navigation, ChevronLeft, LocateFixed, Loader2, Search, Building2, 
  Map as MapIcon, X, MapPin, Footprints, Car, Square, Printer, Layers, 
  Home, Plus, Minus, SendHorizontal, LogIn, ArrowRight, Info, Clock, 
  Ruler, Share2, Compass, ArrowUp, School, Mail, Phone
} from 'lucide-react';

// 🚀 Assets
import mkaulogo from '../assets/mkaulogo.jpg';
import tuluImg from '../assets/mekdelaambauniversity.jpg'; 
import mekaneImg from '../assets/homepage.jpg'; 

// የሶሻል ሚዲያ አይኮኖች
const FacebookIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>);
const TwitterIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-1 2.17-2.82 3.47c1.82 8.3-6.62 14.03-10.9 14.03-4.54 0-6.18-4.57-6.18-4.57 4.15.58 4.85-2.04 4.85-2.04-2.35-.19-3.23-2.26-3.23-2.26 1.64.04 1.6-.98 1.6-.98-1.48-.35-2.35-2.79-2.35-2.79.47.25 1.05.09 1.05.09-1.28-1.24-1.15-3.35-1.15-3.35 2.22 1.64 4.18 2.01 4.85 2.01.05-.65.13-1.24.33-1.74.81-2.04 2.91-3.22 5.02-2.87 1.21.2 2.2 1 2.67 2.1.5.07 1 .3 1.5.59-.2-.5-.5-.9-.9-1.2 1-.1 1.9.2 1.9.2z"></path></svg>);
const InstagramIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>);

// --- 🗺️ Map Controller ---
function MapController({ coords, zoomLevel }) {
  const map = useMap();
  useEffect(() => { 
    if (coords && Array.isArray(coords) && !isNaN(coords[0])) {
      map.setView(coords, zoomLevel, { animate: true }); 
    }
  }, [coords, zoomLevel, map]);
  return null;
}

const MapPage = () => {
  const { campusId } = useParams();
  const navigate = useNavigate();
  
  // State Management
  const [buildings, setBuildings] = useState([]);
  const [searchMarkers, setSearchMarkers] = useState([]); 
  const [currentCampus, setCurrentCampus] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [routePath, setRoutePath] = useState([]); 
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false); 
  const [distance, setDistance] = useState(0);
  const [eta, setEta] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [navMode, setNavMode] = useState('Walking');
  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  
  // UI Toggles
  const [showDirectionsMenu, setShowDirectionsMenu] = useState(false);
  const [showLocationDetails, setShowLocationDetails] = useState(false);
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [showCampusOverlay, setShowCampusOverlay] = useState(false);
  
  const [mapZoom, setMapZoom] = useState(17);
  const [mapCenter, setMapCenter] = useState([10.98, 39.26]); 
  const [mapType, setMapType] = useState('satellite');

  // Icons Setup
  const userIconRed = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', iconSize: [25, 41], iconAnchor: [12, 41] });
  const navIconGreen = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', iconSize: [25, 41], iconAnchor: [12, 41] });
  const buildingIconBlue = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', iconSize: [25, 41], iconAnchor: [12, 41] });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [cRes, bRes] = await Promise.all([
            api.get(`/Campuses/${campusId}`), 
            api.get(`/Buildings/campus/${campusId}`)
        ]);
        if (cRes.data) {
          setCurrentCampus(cRes.data); 
          const lat = cRes.data.Latitude || cRes.data.latitude;
          const lon = cRes.data.Longitude || cRes.data.longitude;
          if (lat && lon) setMapCenter([lat, lon]);
        }
        if (Array.isArray(bRes.data)) setBuildings(bRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setLoading(false);
      }
    };
    loadData();
    const watchId = navigator.geolocation.watchPosition(
        pos => setUserPos([pos.coords.latitude, pos.coords.longitude]), 
        null, { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [campusId]);

  // 🚀 የፍለጋ ስራ
  const handleSelectBuilding = (b) => {
      setMapCenter([b.Latitude || b.latitude, b.Longitude || b.longitude]);
      setMapZoom(19);
      setSearchMarkers([b]); 
      setSearchTerm(""); 
      setSelectedBuilding(b);
  };

  const handleSearchButtonClick = () => {
    const found = buildings.filter(b => (b.Name || b.name || "").toLowerCase().includes(searchTerm.toLowerCase()));
    if (found.length > 0) {
        setSearchMarkers(found);
        setMapCenter([found[0].Latitude || found[0].latitude, found[0].Longitude || found[0].longitude]);
        setMapZoom(18);
    } else alert("ህንጻው አልተገኘም!");
  };

  const toggleNearby = () => {
    if (!userPos) return alert("መጀመሪያ የ GPS ቦታዎን ያብሩ!");
    if (showNearbyOnly) {
        setSearchMarkers([]);
    } else {
        const nearby = buildings.filter(b => {
            const bLat = b.Latitude || b.latitude;
            const bLon = b.Longitude || b.longitude;
            return L.latLng(userPos).distanceTo([bLat, bLon]) < 400;
        });
        setSearchMarkers(nearby);
    }
    setShowNearbyOnly(!showNearbyOnly);
  };

  const startNav = async (target) => {
    if (!userPos) return alert("GPS ቦታዎን ያብሩ!");
    setSelectedBuilding(target);
    setShowDirectionsMenu(true);
    try {
        const response = await api.post('/Navigation/calculate', {
            startLatitude: userPos[0], startLongitude: userPos[1],
            destinationBuildingId: target.Id || target.id, travelMode: navMode
        });
        if (response.data && response.data.Path) {
            setRoutePath(response.data.Path.map(p => [p.Latitude || p.latitude, p.Longitude || p.longitude]));
            setDistance(response.data.TotalDistanceMeters || response.data.totalDistanceMeters);
            setEta(response.data.EstimatedMinutes || response.data.estimatedMinutes);
            setIsNavigating(true);
            setMapCenter(userPos);
        }
    } catch (error) { alert("መንገድ አልተገኘም!"); }
  };

  const handleStopNavigation = () => { 
    setIsNavigating(false); setRoutePath([]); setDistance(0); setEta(0); setSelectedBuilding(null);
  };

  if (loading || !currentCampus) return <div className="h-screen w-full bg-white flex flex-col items-center justify-center text-[#006064]"><Loader2 className="animate-spin mb-4" size={60}/><h2 className="font-black tracking-widest uppercase italic">Preparing Mekdela Amba Map...</h2></div>;

  return (
    <div className="flex flex-col h-auto min-h-screen bg-white font-sans italic font-bold">
      
      {/* 🏛️ 1. TOP HEADER */}
      <header className="bg-white h-20 w-full flex items-center px-10 border-b border-gray-100 z-[1000] shadow-sm sticky top-0 no-print text-[#006064]">
         <div className="flex items-center gap-6 cursor-pointer" onClick={() => navigate('/')}>
            <img src={mkaulogo} className="w-12 h-12 object-contain rounded-full shadow-md" alt="MAU Logo" />
            <div className="flex flex-col text-left">
                <h1 className="text-xl font-black uppercase tracking-tighter">MEKDELA AMBA UNIVERSITY</h1>
                <span className="text-gray-400 text-[9px] font-bold uppercase">Campus Navigation System</span>
            </div>
         </div>
         <div className="flex-1 flex justify-center gap-10">
            {[
                { n: 'Home', p: '/' }, { n: 'Campuses', p: '#' }, { n: 'Map', p: '#' },
                { n: 'About Us', p: '/about' }, { n: 'Services', p: '/services' }, { n: 'Contact', p: '/contact' }
            ].map(link => (
              <button key={link.n} onClick={() => link.n === 'Campuses' ? setShowCampusOverlay(true) : navigate(link.p)} 
              className={`text-[10px] font-black uppercase tracking-widest hover:text-[#006064] transition-all ${link.n === 'Map' ? 'border-b-4 border-[#006064] pb-1' : 'text-gray-400'}`}>{link.n}</button>
            ))}
         </div>
         <button onClick={() => navigate('/login')} className="bg-[#fbc02d] text-[#006064] px-8 py-2 rounded-xl font-black text-[10px] uppercase shadow-md flex items-center gap-2 hover:bg-[#f9a825]">
            <LogIn size={16} /> LOGIN
         </button>
      </header>

      {/* 🖼️ 2. MAIN MAP CONTAINER */}
      <div className="h-[calc(100vh-80px)] w-full relative flex shrink-0 overflow-hidden">
           
           {/* Directions Sidebar */}
           {showDirectionsMenu && (
             <div className="w-[420px] bg-white h-full z-50 shadow-2xl border-r border-gray-100 p-10 overflow-y-auto no-print animate-in slide-in-from-left duration-300">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h3 className="text-xl font-black text-[#006064] uppercase tracking-tighter italic">Directions</h3>
                    <X className="text-gray-300 cursor-pointer hover:text-red-500" onClick={() => setShowDirectionsMenu(false)}/>
                </div>
                <div className="space-y-6">
                    <div className="bg-gray-50 p-5 rounded-[25px] flex items-center gap-4 border border-gray-100">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full ring-4 ring-green-100"></div>
                        <input readOnly value="My Current Location" className="flex-1 bg-transparent text-xs font-bold text-gray-400 outline-none" />
                        <LocateFixed size={18} className="text-gray-300"/>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-[25px] flex items-center gap-4 border border-gray-100">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full ring-4 ring-red-100"></div>
                        <select className="flex-1 bg-transparent text-xs font-black text-[#006064] outline-none cursor-pointer" onChange={(e) => {
                            const b = buildings.find(x => (x.Id || x.id) == e.target.value);
                            if(b) setSelectedBuilding(b);
                        }}>
                            <option>{selectedBuilding ? (selectedBuilding.Name || selectedBuilding.name) : "-- Select Destination --"}</option>
                            {buildings.map(b => <option key={b.Id || b.id} value={b.Id || b.id}>{b.Name || b.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setNavMode('Walking')} className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all ${navMode === 'Walking' ? 'bg-[#006064]/5 border-[#006064] text-[#006064] shadow-md' : 'border-gray-100 text-gray-400'}`}><Footprints size={20}/> Walking</button>
                        <button onClick={() => setNavMode('Driving')} className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all ${navMode === 'Driving' ? 'bg-[#006064]/5 border-[#006064] text-[#006064] shadow-md' : 'border-gray-100 text-gray-400'}`}><Car size={20}/> Driving</button>
                    </div>

                    <button onClick={() => selectedBuilding && startNav(selectedBuilding)} className="w-full bg-[#002e31] text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[3px] shadow-2xl hover:bg-[#001d1f] transition-all">Get Directions</button>
                    
                    {isNavigating && (
                        <div className="pt-8 space-y-8 animate-in fade-in text-left">
                            <div className="flex items-center justify-between bg-[#E0F7FA] p-8 rounded-[40px] shadow-sm">
                                <div><h4 className="text-4xl font-black text-[#006064] italic">{eta} min</h4><p className="text-[10px] text-[#006064]/40 mt-1 uppercase tracking-widest">Via Campus Path</p></div>
                                <div className="p-5 bg-white rounded-3xl text-[#006064] shadow-sm"><Ruler size={28}/></div>
                            </div>
                        </div>
                    )}
                </div>
             </div>
           )}

           <div className="flex-1 relative h-full">
                
                {hoveredBuilding && (
                  <div className="absolute top-28 left-10 z-[1001] w-80 bg-white/90 backdrop-blur-xl rounded-[40px] shadow-3xl p-8 border-l-[12px] border-[#006064] animate-in slide-in-from-left-5 text-left no-print">
                     <h3 className="text-2xl font-black text-[#006064] uppercase mb-4 leading-tight italic">{hoveredBuilding.Name || hoveredBuilding.name}</h3>
                     <img src={hoveredBuilding.ImageUrl || hoveredBuilding.imageUrl || tuluImg} className="w-full h-40 object-cover rounded-3xl mb-4 shadow-md" alt="B" />
                     <p className="text-[10px] text-gray-500 font-bold leading-relaxed italic">{hoveredBuilding.Description || "University building details available."}</p>
                  </div>
                )}

                <div className="absolute top-8 left-1/2 -translate-x-1/2 z-40 w-[550px] no-print">
                   <div className="bg-white rounded-[25px] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.25)] flex items-center gap-3 border border-gray-50">
                      <div className="flex-1 flex items-center px-4"><Search size={22} className="text-gray-300 mr-4"/><input type="text" placeholder="Search buildings, halls, landmarks..." className="w-full bg-transparent outline-none text-sm font-bold text-[#006064]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearchButtonClick()} /></div>
                      <button onClick={handleSearchButtonClick} className="bg-[#002e31] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase shadow-lg">SEARCH</button>
                   </div>
                   
                   {searchTerm && (
                     <div className="mt-2 bg-white/95 backdrop-blur-md rounded-[25px] shadow-2xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
                        {buildings.filter(b => (b.Name || b.name || "").toLowerCase().includes(searchTerm.toLowerCase())).map(b => (
                           <div key={b.Id || b.id} onClick={() => handleSelectBuilding(b)} className="p-4 hover:bg-[#E0F7FA] cursor-pointer flex items-center gap-4 border-b border-gray-50 last:border-0 text-left">
                              <Building2 size={16} className="text-[#006064]/50"/>
                              <span className="text-[10px] font-black text-[#006064] uppercase">{b.Name || b.name}</span>
                           </div>
                        ))}
                     </div>
                   )}
                </div>

                <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                  <TileLayer url={mapType === 'satellite' ? "https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} subdomains={['mt0','mt1','mt2','mt3']} />
                  <MapController coords={mapCenter} zoomLevel={mapZoom} />
                  {userPos && <Marker position={userPos} icon={isNavigating ? navIconGreen : userIconRed} />}
                  
                  {searchMarkers.filter(b => b.latitude || b.Latitude).map(b => (
                    <Marker 
                        key={b.Id || b.id} 
                        position={[b.Latitude || b.latitude, b.Longitude || b.longitude]} 
                        icon={buildingIconBlue}
                        eventHandlers={{
                            mouseover: () => setHoveredBuilding(b),
                            mouseout: () => setHoveredBuilding(null)
                        }}
                    >
                        <Popup className="custom-popup">
                            <div className="p-3 text-center space-y-4 text-[#006064]">
                                <h4 className="font-black uppercase text-xs italic">{b.Name || b.name}</h4>
                                <button onClick={() => startNav(b)} className="bg-[#004d40] text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase">Navigate Here</button>
                            </div>
                        </Popup>
                    </Marker>
                  ))}
                  {routePath.length > 1 && <Polyline positions={routePath} color="#00ffff" weight={10} opacity={0.8} dashArray="20, 20" lineCap="round" />}
                </MapContainer>

                <div className="absolute right-10 top-10 z-40 flex flex-col gap-5 no-print">
                   <button onClick={() => setMapType(mapType === 'satellite' ? 'street' : 'satellite')} className="bg-white p-5 rounded-[25px] shadow-2xl border border-gray-50 text-[#006064] transition-all"><Layers size={26}/></button>
                   <div className="flex flex-col bg-white rounded-[25px] shadow-2xl border border-gray-100 overflow-hidden">
                      <button onClick={() => setMapZoom(z => Math.min(z+1, 20))} className="p-5 hover:bg-gray-100 border-b border-gray-50 text-[#006064]"><Plus size={26}/></button>
                      <button onClick={() => setMapZoom(z => Math.max(z-1, 10))} className="p-5 hover:bg-gray-100 text-[#006064]"><Minus size={26}/></button>
                   </div>
                   <button onClick={() => userPos && setMapCenter(userPos)} className="bg-white p-5 rounded-[25px] shadow-2xl text-[#006064] shadow-[0_20px_40px_rgba(0,0,0,0.15)]"><LocateFixed size={26}/></button>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 w-[850px] bg-[#002e31]/95 backdrop-blur-3xl rounded-full p-2 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.45)] flex justify-around items-center py-4 no-print">
                   <button onClick={() => userPos && setMapCenter(userPos)} className="flex items-center gap-4 bg-[#004d40] text-white px-10 py-3 rounded-full text-xs font-black uppercase shadow-xl active:scale-95"><Compass size={20}/> My Location</button>
                   <button onClick={() => setShowDirectionsMenu(!showDirectionsMenu)} className="flex items-center gap-4 text-white px-8 py-3 rounded-full text-xs font-black uppercase hover:bg-white/10 transition-all"><Navigation size={20} className="rotate-45"/> Directions</button>
                   <button onClick={toggleNearby} className={`flex items-center gap-4 px-8 py-3 rounded-full text-xs font-black uppercase transition-all ${showNearbyOnly ? 'bg-[#fbc02d] text-[#002e31] shadow-xl' : 'text-white hover:bg-white/10'}`}><MapPin size={20}/> Nearby</button>
                   <button onClick={() => setShowCampusOverlay(true)} className="flex items-center gap-4 text-white px-8 py-3 rounded-full text-xs font-black uppercase hover:bg-white/10 transition-all"><School size={20}/> Campuses</button>
                   <button onClick={() => window.print()} className="flex items-center gap-4 text-white px-8 py-3 rounded-full text-xs font-black uppercase hover:bg-white/10 transition-all"><Printer size={20}/> Print</button>
                </div>

                {isNavigating && (
                   <div className="absolute bottom-32 right-10 z-40 bg-white p-10 rounded-[50px] shadow-[0_40px_80px_rgba(0,0,0,0.25)] border border-gray-50 flex items-center gap-16 no-print text-[#006064]">
                      <div className="text-center border-r-2 border-gray-100 pr-16"><p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[5px]">Distance</p><h4 className="text-5xl font-black italic">{distance} m</h4></div>
                      <div className="text-center"><p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[5px]">Est. Time</p><h4 className="text-5xl font-black italic">{eta} min</h4></div>
                      <button onClick={handleStopNavigation} className="bg-red-500 text-white p-6 rounded-[35px] ml-10 hover:bg-red-600 transition-all active:scale-90"><Square size={35}/></button>
                   </div>
                )}
           </div>
      </div>

      <footer className="bg-[#002e31] text-white pt-24 pb-12 px-16 border-t-[12px] border-[#fbc02d] z-50 no-print text-left">
         <div className="container mx-auto grid md:grid-cols-4 gap-20 mb-24">
            <div className="space-y-8">
                <div className="flex items-center gap-5"><img src={mkaulogo} className="w-16 h-16 brightness-0 invert" alt="L"/><h4 className="text-xl font-black uppercase tracking-tight">Mekdela Amba University</h4></div>
                <p className="text-xs font-bold text-white/50 leading-relaxed uppercase italic tracking-widest">Empowering minds, building the future. Providing world-class quality education for all excellence.</p>
            </div>
            <div><h4 className="text-sm font-black uppercase tracking-widest mb-10 text-[#fbc02d]">Quick Links</h4>
                <ul className="space-y-5 text-[11px] font-bold text-white/60">
                  {['Home', 'University Map', 'Campuses', 'About Us', 'Contact', 'FAQs'].map(l => <li key={l} onClick={() => navigate(l === 'Home' ? '/' : '#')} className="hover:text-[#fbc02d] cursor-pointer transition-colors uppercase tracking-[3px]">{l}</li>)}
                </ul>
            </div>
            <div><h4 className="text-sm font-black uppercase tracking-widest mb-10 text-[#fbc02d]">Contact Info</h4>
                <ul className="space-y-8 text-[11px] font-bold text-white/70">
                    <li className="flex items-center gap-5 tracking-widest"><MapPin size={22} className="text-[#fbc02d]"/> Mekdela Amba, Ethiopia</li>
                    <li className="flex items-center gap-5 tracking-widest"><Mail size={22} className="text-[#fbc02d]"/> info@mau.edu.et</li>
                    <li className="flex items-center gap-5 tracking-widest"><Phone size={22} className="text-[#fbc02d]"/> +251 900 000 000</li>
                </ul>
            </div>
            <div><h4 className="text-sm font-black uppercase tracking-widest mb-10 text-[#fbc02d]">Follow Us</h4>
                <div className="flex gap-5">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-[#fbc02d] hover:text-[#002e31] cursor-pointer transition-all shadow-xl"><FacebookIcon /></div>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-[#fbc02d] hover:text-[#006064] cursor-pointer transition-all shadow-xl"><TwitterIcon /></div>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-[#fbc02d] hover:text-[#006064] cursor-pointer transition-all shadow-xl"><InstagramIcon /></div>
                </div>
            </div>
         </div>
         <p className="text-[10px] font-black tracking-[15px] text-white/10 text-center uppercase italic border-t border-white/5 pt-12">© {new Date().getFullYear()} MEKDELA AMBA UNIVERSITY. DEVELOPED BY YGSH</p>
      </footer>

      {/* 🚀 COMPACT CAMPUS OVERLAY */}
      {showCampusOverlay && (
        <div className="fixed inset-0 z-[3000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-12 no-print">
           <div className="bg-[#002e31] w-full max-w-4xl rounded-[60px] shadow-3xl p-16 relative animate-in zoom-in duration-500 border border-white/10">
              <button onClick={() => setShowCampusOverlay(false)} className="absolute top-10 right-10 text-white/40 hover:text-red-500 transition-colors"><X size={60}/></button>
              <div className="text-center mb-20 text-white"><h2 className="text-7xl font-black italic uppercase tracking-tighter">Switch Campus</h2><div className="h-2 w-56 bg-[#fbc02d] mx-auto mt-6 rounded-full shadow-2xl"></div></div>
              <div className="grid md:grid-cols-2 gap-12">
                 {[{ id: 1, name: 'Tulu Awulia', img: tuluImg }, { id: 2, name: 'Mekane Selam', img: mekaneImg }].map(c => (
                   <div key={c.id} className="group bg-white rounded-[50px] overflow-hidden shadow-3xl transition-all duration-700">
                      <div className="h-56 relative overflow-hidden"><img src={c.img} className="w-full h-full object-cover transition duration-1000 group-hover:scale-110" alt={c.name} /><div className="absolute inset-0 bg-gradient-to-t from-[#002e31] via-transparent to-transparent"></div><div className="absolute bottom-6 left-10 text-white"><h3 className="text-3xl font-black italic uppercase tracking-tighter">{c.name}</h3></div></div>
                      <div className="p-10 text-center"><button onClick={() => { setShowCampusOverlay(false); navigate(`/map/${c.id}`); window.location.reload(); }} className="w-full bg-[#006064] text-white py-6 rounded-[35px] font-black text-xl uppercase shadow-2xl">Enter Map</button></div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-container { z-index: 1 !important; cursor: crosshair; border-radius: 0 !important; }
        .custom-popup .leaflet-popup-content-wrapper { border-radius: 50px; padding: 15px; border: 5px solid #002e31; box-shadow: 0 50px 100px rgba(0,0,0,0.4); background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); }
        .custom-popup .leaflet-popup-tip { display: none; }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-thumb { background: #006064; border-radius: 20px; }
        @media print { .no-print { display: none !important; } .leaflet-container { height: 100vh !important; } }
      `}} />
    </div>
  );
};

export default MapPage;