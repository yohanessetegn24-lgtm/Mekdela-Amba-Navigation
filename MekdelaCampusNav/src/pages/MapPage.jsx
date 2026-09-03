import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import api from '../services/api'; 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Navigation, ChevronLeft, LocateFixed, Loader2, Search, Building2, 
  Map as MapIcon, X, MapPin, Footprints, Car, Square, Printer, Layers, 
  Home, Plus, Minus, SendHorizontal, LogIn, ArrowRight, Info, Clock, 
  Ruler, Share2, Compass, ArrowUp, School, Mail, Phone, AlertTriangle, 
  Check, RotateCcw, ArrowUpLeft, ArrowUpRight, MoveUp, CheckCircle2, Briefcase, Hash
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
  const [selectedOffice, setSelectedOffice] = useState(null); 
  const [isNavigating, setIsNavigating] = useState(false); 
  const [distance, setDistance] = useState(0);
  const [eta, setEta] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [navMode, setNavMode] = useState('Walking');
  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  const lastUpdateTime = useRef(0);
  const lastUpdatePos = useRef(null);
  // 🚀 [PHASE 3 & 4] - States
  const [showOffRoutePrompt, setShowOffRoutePrompt] = useState(false);
  const [navigationInstruction, setNavigationInstruction] = useState(null);
  const hasRejectedRecalculation = useRef(false);
 
  // UI Toggles
  const [showDirectionsMenu, setShowDirectionsMenu] = useState(false);
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [showCampusOverlay, setShowCampusOverlay] = useState(false);
  
  const [mapZoom, setMapZoom] = useState(17);
  const [mapCenter, setMapCenter] = useState([10.98, 39.26]); 
  const [mapType, setMapType] = useState('satellite');

  // Icons Setup
  const userIconRed = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', iconSize: [25, 41], iconAnchor: [12, 41] });
  const navIconGreen = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', iconSize: [25, 41], iconAnchor: [12, 41] });
  const buildingIconBlue = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', iconSize: [25, 41], iconAnchor: [12, 41] });

  // 🚀 [SMART SEARCH LOGIC] - Buildings + Offices Combined
  const searchableItems = useMemo(() => {
    const list = [];
    buildings.forEach(b => {
      // ህንፃውን ጨምር
      list.push({ ...b, type: 'building', searchName: (b.Name || b.name || "") });
      // በህንፃው ውስጥ ያሉ ቢሮዎችን ጨምር
      const offices = b.offices || b.Offices || [];
      offices.forEach(o => {
        list.push({ 
          ...o, 
          type: 'office', 
          searchName: (o.Name || o.name || ""), 
          parentBuilding: b,
          Latitude: b.Latitude || b.latitude,
          Longitude: b.Longitude || b.longitude,
          Floor: o.Floor || o.floor || "Ground"
        });
      });
    });
    return list;
  }, [buildings]);
const getRouteArrowAngle = (route) => {
  if (!route || route.length < 2) return 0;

  const [prevLat, prevLng] = route[route.length - 2];
  const [lastLat, lastLng] = route[route.length - 1];

  const dy = lastLat - prevLat;
  const dx = lastLng - prevLng;

  // Leaflet map direction → degrees
  const angle = Math.atan2(dx, dy) * (180 / Math.PI);

  return angle;
};
  // 🚀 [PHASE 4 HELPER] - አቅጣጫ መለኪያ
  const calculateInstruction = (path) => {
    if (!path || path.length < 2) return null;
    const p1 = path[0];
    const p2 = path[1];
    const distToNext = L.latLng(p1).distanceTo(L.latLng(p2));
    if (path.length < 3) return { text: "መድረሻዎ አጠገብ ነዎት", icon: <CheckCircle2 className="text-green-400" size={32}/>, dist: distToNext };
    const p3 = path[2];
    const getBearing = (a, b) => {
      const lat1 = a[0] * Math.PI / 180;
      const lon1 = a[1] * Math.PI / 180;
      const lat2 = b[0] * Math.PI / 180;
      const lon2 = b[1] * Math.PI / 180;
      const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
      return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    };
    const b1 = getBearing(p1, p2);
    const b2 = getBearing(p2, p3);
    let diff = b2 - b1;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    if (diff > 25) return { text: "ወደ ቀኝ ታጠፍ", icon: <ArrowUpRight className="text-blue-400" size={32}/>, dist: distToNext };
    if (diff < -25) return { text: "ወደ ግራ ታጠፍ", icon: <ArrowUpLeft className="text-blue-400" size={32}/>, dist: distToNext };
    return { text: "ቀጥ ብለህ ሂድ", icon: <MoveUp className="text-white" size={32}/>, dist: distToNext };
  };

  // 🚀 [LIVE ROUTING]
const updateRouteLive = useCallback(async (currentLat, currentLng, targetBuilding) => {
    if (!targetBuilding) return;

    const now = Date.now();
    const newPos = [currentLat, currentLng];

    // 🚀 [መፍትሄ] - 1minute ካልሞላ ወይም ተማሪው ከ 10 ሜትር በላይ ካልተንቀሳቀሰ ጥያቄ አትላክ
    const distMoved = lastUpdatePos.current ? L.latLng(newPos).distanceTo(L.latLng(lastUpdatePos.current)) : 999;
    
    if (now - lastUpdateTime.current < 60000 && distMoved < 15) {
        return; 
    }

    try {
        const response = await api.post('/Navigation/calculate', {
            startLatitude: currentLat,
            startLongitude: currentLng,
            destinationBuildingId: targetBuilding.Id || targetBuilding.id,
            travelMode: navMode
        });

        if (response.data && response.data.Path) {
            // የቆየውን ዳታ ማደስ
            lastUpdateTime.current = now;
            lastUpdatePos.current = newPos;

            const newPath = response.data.Path.map(p => [p.Latitude || p.latitude, p.Longitude || p.longitude]);
            setRoutePath(newPath);
            setDistance(response.data.TotalDistanceMeters || response.data.totalDistanceMeters);
            setEta(response.data.EstimatedMinutes || response.data.estimatedMinutes);
            setNavigationInstruction(calculateInstruction(newPath));
        }
    } catch (error) {
        console.error("Routing error:", error);
    }
}, [navMode]);

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
      } catch (err) { setLoading(false); }
    };
    loadData();

    const watchId = navigator.geolocation.watchPosition(
        pos => {
            const newPos = [pos.coords.latitude, pos.coords.longitude];
            setUserPos(newPos);
            if (isNavigating && selectedBuilding) {
                if (routePath.length > 0) {
                    const minDist = Math.min(...routePath.map(p => L.latLng(newPos).distanceTo(L.latLng(p))));
                    if (minDist > 30 && !showOffRoutePrompt && !hasRejectedRecalculation.current) {
                        setShowOffRoutePrompt(true);
                    } else {
                        updateRouteLive(pos.coords.latitude, pos.coords.longitude, selectedBuilding);
                    }
                }
            }
        }, 
        (err) => { console.error("GPS Access Denied", err); setUserPos(null); }, 
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [campusId, isNavigating, selectedBuilding, updateRouteLive, routePath, showOffRoutePrompt]);

  const handleRecalculateResponse = async (accept) => {
    if (accept && userPos && selectedBuilding) {
        await updateRouteLive(userPos[0], userPos[1], selectedBuilding);
        hasRejectedRecalculation.current = false; 
    } else {
        hasRejectedRecalculation.current = true; 
        setTimeout(() => { hasRejectedRecalculation.current = false; }, 30000); 
    }
    setShowOffRoutePrompt(false);
  };

  // 🚀 [SMART FOCUS HANDLER]
  const handleSelectItem = (item) => {
      const lat = item.Latitude || item.latitude;
      const lng = item.Longitude || item.longitude;
      setMapCenter([lat, lng]);
      setMapZoom(19);
      setSearchTerm(""); 
      
      if (item.type === 'office') {
          setSelectedOffice(item);
          setSelectedBuilding(item.parentBuilding);
          setSearchMarkers([item.parentBuilding]);
      } else {
          setSelectedBuilding(item);
          setSelectedOffice(null);
          setSearchMarkers([item]);
      }
  };

  const handleSearchButtonClick = () => {
    // Case-insensitive search match
    const found = searchableItems.find(i => i.searchName.toLowerCase().includes(searchTerm.toLowerCase()));
    if (found) handleSelectItem(found);
    else alert("አልተገኘም!");
  };

  const toggleNearby = () => {
    if (!userPos) return alert("መጀመሪያ የ GPS ቦታዎን ያብሩ!");
    if (showNearbyOnly) { setSearchMarkers([]); } 
    else {
        const nearby = buildings.filter(b => L.latLng(userPos).distanceTo([b.Latitude || b.latitude, b.Longitude || b.longitude]) < 400);
        setSearchMarkers(nearby);
    }
    setShowNearbyOnly(!showNearbyOnly);
  };

  const proceedWithNavigation = async (target, position) => {
    const buildingToUse = target.type === 'office' ? target.parentBuilding : target;
    if (target.type === 'office') setSelectedOffice(target);

    setSelectedBuilding(buildingToUse);
    setShowDirectionsMenu(true);
    setIsNavigating(true);
    hasRejectedRecalculation.current = false;
    await updateRouteLive(position[0], position[1], buildingToUse);
    setMapCenter(position);
  };

  const startNav = async (target) => {
    if (userPos) {
      await proceedWithNavigation(target, userPos);
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const currentPos = [pos.coords.latitude, pos.coords.longitude];
            setUserPos(currentPos);
            await proceedWithNavigation(target, currentPos);
          },
          (err) => {
            alert("የናቪጌሽን አገልግሎቱን ለመጠቀም እባክዎ የ Location ፍቃድ ይስጡ! ❌");
          },
          { enableHighAccuracy: true }
        );
      } else {
        alert("የእርስዎ ብሮውዘር የ Location አገልግሎት አይደግፍም!");
      }
    }
  };

  const handleStopNavigation = () => { 
    setIsNavigating(false); setRoutePath([]); setDistance(0); setEta(0); 
    setSelectedBuilding(null); setSelectedOffice(null);
    setShowOffRoutePrompt(false); setNavigationInstruction(null);
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
            {[{ n: 'Home', p: '/' }, { n: 'Campuses', p: '#' }, { n: 'Map', p: '#' }, { n: 'About Us', p: '/about' }, { n: 'Services', p: '/services' }, { n: 'Contact', p: '/contact' }].map(link => (
              <button key={link.n} onClick={() => link.n === 'Campuses' ? setShowCampusOverlay(true) : navigate(link.p)} className={`text-[10px] font-black uppercase tracking-widest hover:text-[#006064] transition-all ${link.n === 'Map' ? 'border-b-4 border-[#006064] pb-1' : 'text-gray-400'}`}>{link.n}</button>
            ))}
         </div>
         <button onClick={() => navigate('/login')} className="bg-[#fbc02d] text-[#006064] px-8 py-2 rounded-xl font-black text-[10px] uppercase shadow-md flex items-center gap-2 hover:bg-[#f9a825]"><LogIn size={16} /> LOGIN</button>
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
                            const item = searchableItems.find(x => (x.Id || x.id) == e.target.value);
                            if(item) handleSelectItem(item);
                        }}>
                            <option value="">{selectedOffice ? selectedOffice.searchName : selectedBuilding ? (selectedBuilding.Name || selectedBuilding.name) : "-- Select Destination --"}</option>
                            {searchableItems.map((item, i) => <option key={i} value={item.Id || item.id}>{item.searchName} ({item.type})</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setNavMode('Walking')} className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all ${navMode === 'Walking' ? 'bg-[#006064]/5 border-[#006064] text-[#006064] shadow-md' : 'border-gray-100 text-gray-400'}`}><Footprints size={20}/> Walking</button>
                        <button onClick={() => setNavMode('Driving')} className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all ${navMode === 'Driving' ? 'bg-[#006064]/5 border-[#006064] text-[#006064] shadow-md' : 'border-gray-100 text-gray-400'}`}><Car size={20}/> Driving</button>
                    </div>

                    <button onClick={() => (selectedOffice || selectedBuilding) && startNav(selectedOffice || selectedBuilding)} className="w-full bg-[#002e31] text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[3px] shadow-2xl hover:bg-[#001d1f] transition-all">Get Directions</button>
                    
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
                
                {/* 🚀 ቢሮ ዝርዝር መረጃ ሳጥን */}
                {isNavigating && selectedOffice && (
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 z-[4500] w-72 bg-white rounded-[40px] shadow-[0_30px_70px_rgba(0,0,0,0.3)] p-8 border-l-[12px] border-blue-500 animate-in slide-in-from-left-10 duration-500 no-print">
                      <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[3px] mb-4">Target Office</h4>
                      <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-50 p-3 rounded-2xl text-blue-500"><Briefcase size={20}/></div>
                            <div><p className="text-xs font-black text-[#002e31] uppercase leading-tight">{selectedOffice.searchName}</p><p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Office Name</p></div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-orange-50 p-3 rounded-2xl text-orange-500"><Building2 size={20}/></div>
                            <div><p className="text-xs font-black text-[#002e31] uppercase leading-tight">{selectedOffice.parentBuilding?.Name || selectedOffice.parentBuilding?.name}</p><p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Building</p></div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-green-50 p-3 rounded-2xl text-green-500"><Hash size={20}/></div>
                            <div><p className="text-xs font-black text-[#002e31] uppercase leading-tight">{selectedOffice.Floor} Floor</p><p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Level</p></div>
                        </div>
                      </div>
                  </div>
                )}

                {/* 🚀 [PHASE 4] - Instruction Card Overlay */}
                {isNavigating && navigationInstruction && (
                   <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[4500] w-[450px] bg-[#002e31] text-white rounded-[40px] shadow-[0_30px_70px_rgba(0,0,0,0.4)] p-8 flex items-center gap-8 border-b-[10px] border-[#fbc02d] animate-in slide-in-from-top-10 duration-500 no-print">
                      <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md shadow-inner">{navigationInstruction.icon}</div>
                      <div className="flex-1">
                         <h3 className="text-3xl font-black uppercase italic leading-none">{navigationInstruction.text}</h3>
                         <p className="text-[11px] text-[#fbc02d] mt-3 uppercase font-black tracking-[5px]">After {navigationInstruction.dist.toFixed(0)} Meters</p>
                      </div>
                      <div className="flex flex-col items-center border-l border-white/10 pl-6">
                        <Compass className="text-white/20 mb-1" size={20}/>
                        <span className="text-[8px] uppercase text-white/40">Live</span>
                      </div>
                   </div>
                )}

                {/* 🚀 [PHASE 3] - Off Route Prompt UI */}
                {showOffRoutePrompt && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[5000] w-[380px] bg-white rounded-[50px] shadow-3xl p-10 border-t-[16px] border-[#fbc02d] animate-in zoom-in-95 duration-300 no-print text-center">
                      <div className="bg-[#fbc02d]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 text-[#fbc02d]"><AlertTriangle size={40}/></div>
                      <h3 className="text-2xl font-black text-[#002e31] uppercase mb-3 italic">Off Route</h3>
                      <p className="text-xs text-gray-500 font-bold mb-10 italic px-4">መንገዱን ስተዋል። አዲሱን አጭር መንገድ እንዲያሰላልዎ ይፈልጋሉ?</p>
                      <div className="flex gap-4">
                          <button onClick={() => handleRecalculateResponse(true)} className="flex-1 bg-[#006064] text-white py-5 rounded-2xl font-black text-[11px] uppercase flex items-center justify-center gap-3 shadow-2xl hover:bg-[#002e31] transition-all active:scale-95"><Check size={20}/> YES</button>
                          <button onClick={() => handleRecalculateResponse(false)} className="flex-1 bg-gray-100 text-gray-400 py-5 rounded-2xl font-black text-[11px] uppercase flex items-center justify-center gap-3 border border-gray-100 hover:bg-gray-200 transition-all"><X size={20}/> SKIP</button>
                      </div>
                  </div>
                )}

                {hoveredBuilding && (
                  <div className="absolute top-28 left-10 z-[1001] w-80 bg-white/90 backdrop-blur-xl rounded-[40px] shadow-3xl p-8 border-l-[12px] border-[#006064] animate-in slide-in-from-left-5 text-left no-print">
                     <h3 className="text-2xl font-black text-[#006064] uppercase mb-4 leading-tight italic">{hoveredBuilding.Name || hoveredBuilding.name}</h3>
                     <img src={hoveredBuilding.ImageUrl || hoveredBuilding.imageUrl || tuluImg} className="w-full h-40 object-cover rounded-3xl mb-4 shadow-md" alt="B" />
                     <p className="text-[10px] text-gray-500 font-bold leading-relaxed italic">{hoveredBuilding.Description || "University building details available."}</p>
                  </div>
                )}

                <div className="absolute top-8 left-1/2 -translate-x-1/2 z-40 w-[550px] no-print">
                   {!isNavigating && (
                     <div className="bg-white rounded-[25px] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.25)] flex items-center gap-3 border border-gray-50">
                        <div className="flex-1 flex items-center px-4"><Search size={22} className="text-gray-300 mr-4"/><input type="text" placeholder="Search buildings or offices..." className="w-full bg-transparent outline-none text-sm font-bold text-[#006064]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearchButtonClick()} /></div>
                        <button onClick={handleSearchButtonClick} className="bg-[#002e31] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase shadow-lg">SEARCH</button>
                     </div>
                   )}
                   
                   {/* 🚀 [FIXED SUGGESTION LIST] - አሁን ቢሮዎችንም ያሳያል (Case-Insensitive) */}
                   {searchTerm && (
                     <div className="mt-2 bg-white/95 backdrop-blur-md rounded-[25px] shadow-2xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
                        {searchableItems.filter(i => i.searchName.toLowerCase().includes(searchTerm.toLowerCase())).map((item, idx) => (
                           <div key={idx} onClick={() => handleSelectItem(item)} className="p-4 hover:bg-[#E0F7FA] cursor-pointer flex items-center gap-4 border-b border-gray-50 last:border-0 text-left">
                              {item.type === 'office' ? <Briefcase size={16} className="text-blue-500"/> : <Building2 size={16} className="text-[#006064]/50"/>}
                              <div>
                                <span className="text-[10px] font-black text-[#006064] uppercase">{item.searchName}</span>
                                {item.type === 'office' && <p className="text-[8px] text-gray-400 font-bold uppercase">IN: {item.parentBuilding?.Name || item.parentBuilding?.name} (Floor {item.Floor})</p>}
                              </div>
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
                    <Marker key={b.Id || b.id} position={[b.Latitude || b.latitude, b.Longitude || b.longitude]} icon={buildingIconBlue} eventHandlers={{ mouseover: () => setHoveredBuilding(b), mouseout: () => setHoveredBuilding(null) }}>
                        <Popup className="custom-popup"><div className="p-3 text-center space-y-4 text-[#006064]"><h4 className="font-black uppercase text-xs italic">{b.Name || b.name}</h4><button onClick={() => startNav(b)} className="bg-[#004d40] text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase">Navigate Here</button></div></Popup>
                    </Marker>
                  ))}
                 {routePath.length > 1 && (<>
  <Polyline positions={routePath} color="#002e31" weight={7} opacity={0.9} lineCap="round" lineJoin="round" />
  <Polyline positions={routePath} color="#00ffff" weight={4} opacity={1} lineCap="round" lineJoin="round" />
  <Marker position={routePath[routePath.length - 1]} icon={L.divIcon({ className: "", html: `<div class="w-9 h-9 flex items-center justify-center text-cyan-400 text-3xl font-black drop-shadow-[0_0_5px_#002e31]" style="transform: rotate(${getRouteArrowAngle(routePath)}deg);">➤</div>`, iconSize: [26, 26], iconAnchor: [18, 18] })} />
</>)}
                </MapContainer>

                <div className="absolute right-10 top-10 z-40 flex flex-col gap-5 no-print">
                   <button onClick={() => setMapType(mapType === 'satellite' ? 'street' : 'satellite')} className="bg-white p-5 rounded-[25px] shadow-2xl border border-gray-50 text-[#006064] transition-all"><Layers size={26}/></button>
                   <div className="flex flex-col bg-white rounded-[25px] shadow-2xl border border-gray-100 overflow-hidden">
                      <button onClick={() => setMapZoom(z => Math.min(z+1, 20))} className="p-5 hover:bg-gray-100 border-b border-gray-50 text-[#006064]"><Plus size={26}/></button>
                      <button onClick={() => setMapZoom(z => Math.max(z-1, 10))} className="p-5 hover:bg-gray-100 text-[#006064]"><Minus size={26}/></button>
                   </div>
                   <button onClick={() => userPos && setMapCenter(userPos)} className="bg-white p-5 rounded-[25px] shadow-2xl text-[#006064]"><LocateFixed size={26}/></button>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 w-[850px] bg-[#002e31]/95 backdrop-blur-3xl rounded-full p-2 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.45)] flex justify-around items-center py-4 no-print">
                   <button onClick={() => userPos && setMapCenter(userPos)} className="flex items-center gap-4 bg-[#004d40] text-white px-10 py-3 rounded-full text-xs font-black uppercase shadow-xl active:scale-95"><Compass size={20}/> My Location</button>
                   <button onClick={() => setShowDirectionsMenu(!showDirectionsMenu)} className="flex items-center gap-4 text-white px-8 py-3 rounded-full text-xs font-black uppercase hover:bg-white/10 transition-all"><Navigation size={20} className="rotate-45"/> Directions</button>
                   <button onClick={toggleNearby} className={`flex items-center gap-4 px-8 py-3 rounded-full text-xs font-black uppercase transition-all ${showNearbyOnly ? 'bg-[#fbc02d] text-[#002e31] shadow-xl' : 'text-white hover:bg-white/10'}`}><MapPin size={20}/> Nearby</button>
                   <button onClick={() => navigate('/campuses')} className="flex items-center gap-4 text-white px-8 py-3 rounded-full text-xs font-black uppercase hover:bg-white/10 transition-all"><School size={20}/> Campuses</button>
                   <button onClick={() => window.print()} className="flex items-center gap-4 text-white px-8 py-3 rounded-full text-xs font-black uppercase hover:bg-white/10 transition-all"><Printer size={20}/> Print</button>
                </div>

                {isNavigating && (
                   <div className="absolute bottom-32 right-10 z-40 bg-white p-10 rounded-[50px] shadow-[0_40px_80px_rgba(0,0,0,0.25)] border border-gray-100 flex items-center gap-16 no-print text-[#006064]">
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