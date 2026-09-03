import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import api from '../services/api'; 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Navigation, ChevronLeft, LocateFixed, Loader2, Search, Building2, 
  Map as MapIcon, X, MapPin, Footprints, Car, Square, Printer, Layers, 
  Home, Plus, Minus, SendHorizontal, ArrowRight, Info, Clock, 
  Ruler, Share2, Compass, ArrowUp, School, Mail, Phone, AlertTriangle, 
  Check, RotateCcw, ArrowUpLeft, ArrowUpRight, MoveUp, CheckCircle2, Briefcase, Hash
} from 'lucide-react';

// 🚀 Components (የተቆረጡት እዚህ ጋር ገብተዋል)
import Header from '../components/Header';
import Footer from '../components/Footer';

// 🚀 Assets
import mkaulogo from '../assets/mkaulogo.jpg';
import tuluImg from '../assets/mekdelaambauniversity.jpg'; 
import mekaneImg from '../assets/homepage.jpg'; 

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
  const [showOffRoutePrompt, setShowOffRoutePrompt] = useState(false);
  const [navigationInstruction, setNavigationInstruction] = useState(null);
  const hasRejectedRecalculation = useRef(false);
 
  // UI Toggles
  const [showDirectionsMenu, setShowDirectionsMenu] = useState(false);
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  
  const [mapZoom, setMapZoom] = useState(17);
  const [mapCenter, setMapCenter] = useState([10.98, 39.26]); 
  const [mapType, setMapType] = useState('satellite');

  // Icons Setup
  const userIconRed = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', iconSize: [25, 41], iconAnchor: [12, 41] });
  const navIconGreen = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', iconSize: [25, 41], iconAnchor: [12, 41] });
  const buildingIconBlue = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', iconSize: [25, 41], iconAnchor: [12, 41] });

  const searchableItems = useMemo(() => {
    const list = [];
    buildings.forEach(b => {
      list.push({ ...b, type: 'building', searchName: (b.Name || b.name || "") });
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
    return Math.atan2(dx, dy) * (180 / Math.PI);
  };

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

  const updateRouteLive = useCallback(async (currentLat, currentLng, targetBuilding) => {
    if (!targetBuilding) return;
    const now = Date.now();
    const newPos = [currentLat, currentLng];
    const distMoved = lastUpdatePos.current ? L.latLng(newPos).distanceTo(L.latLng(lastUpdatePos.current)) : 999;
    if (now - lastUpdateTime.current < 60000 && distMoved < 15) return; 

    try {
        const response = await api.post('/Navigation/calculate', {
            startLatitude: currentLat,
            startLongitude: currentLng,
            destinationBuildingId: targetBuilding.Id || targetBuilding.id,
            travelMode: navMode
        });
        if (response.data && response.data.Path) {
            lastUpdateTime.current = now;
            lastUpdatePos.current = newPos;
            const newPath = response.data.Path.map(p => [p.Latitude || p.latitude, p.Longitude || p.longitude]);
            setRoutePath(newPath);
            setDistance(response.data.TotalDistanceMeters || response.data.totalDistanceMeters);
            setEta(response.data.EstimatedMinutes || response.data.estimatedMinutes);
            setNavigationInstruction(calculateInstruction(newPath));
        }
    } catch (error) { console.error("Routing error:", error); }
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
        (err) => { setUserPos(null); }, 
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

  const startNav = async (target) => {
    const buildingToUse = target.type === 'office' ? target.parentBuilding : target;
    if (userPos) {
      if (target.type === 'office') setSelectedOffice(target);
      setSelectedBuilding(buildingToUse);
      setShowDirectionsMenu(true);
      setIsNavigating(true);
      hasRejectedRecalculation.current = false;
      await updateRouteLive(userPos[0], userPos[1], buildingToUse);
    } else {
      alert("እባክዎ GPS ያብሩ!");
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
      
      {/* 🏛️ 1. TOP HEADER (አሁን ኮምፖነንት ሆኗል) */}
      <Header />

      {/* 🖼️ 2. MAIN MAP CONTAINER */}
      <div className="h-[calc(100vh-80px)] w-full relative flex shrink-0 overflow-hidden">
           
           {/* Directions Sidebar - Ultra Compact Responsive Version */}
{showDirectionsMenu && (
  <div className={`
    fixed left-0 z-[5001] bg-white shadow-2xl border-gray-100 no-print transition-all duration-300
    /* Mobile: 10% Height, Bottom Bar Style */
    bottom-0 w-full h-[10vh] p-2 flex flex-row items-center gap-2 overflow-x-auto
    /* Desktop: Full Height, Side Bar Style */
    md:top-0 md:h-full md:w-[420px] md:flex-col md:p-10 md:items-stretch md:overflow-y-auto md:border-r md:rounded-none
  `}>
    
    {/* Header - Hidden on Mobile to save space */}
    <div className="hidden md:flex justify-between items-center mb-8 border-b pb-4">
        <h3 className="text-xl font-black text-[#006064] uppercase tracking-tighter italic">Directions</h3>
        <X className="text-gray-300 cursor-pointer hover:text-red-500" onClick={() => setShowDirectionsMenu(false)}/>
    </div>

    <div className="flex flex-row md:flex-col items-center md:items-stretch gap-2 md:gap-6 w-full">
        
        {/* Source & Destination - Combined/Smaller on mobile */}
        <div className="flex flex-row md:flex-col gap-1 md:gap-4 flex-1 min-w-[150px] md:min-w-0">
            <div className="bg-gray-50 p-1 md:p-5 rounded-lg md:rounded-[25px] flex items-center gap-1 md:gap-4 border border-gray-100 flex-1">
                <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-green-500 rounded-full shrink-0"></div>
                <input readOnly value="Live" className="flex-1 bg-transparent text-[10px] md:text-xs font-bold text-gray-400 outline-none" />
            </div>

            <div className="bg-gray-50 p-1 md:p-5 rounded-lg md:rounded-[25px] flex items-center gap-1 md:gap-4 border border-gray-100 flex-1">
                <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-red-500 rounded-full shrink-0"></div>
                <select 
                  className="flex-1 bg-transparent text-[10px] md:text-xs font-black text-[#006064] outline-none cursor-pointer" 
                  onChange={(e) => {
                    const item = searchableItems.find(x => (x.Id || x.id) == e.target.value);
                    if(item) handleSelectItem(item);
                  }}
                >
                    <option value="">To...</option>
                    {searchableItems.map((item, i) => <option key={i} value={item.Id || item.id}>{item.searchName}</option>)}
                </select>
            </div>
        </div>

        {/* Mode & Action - Horizontal on Mobile */}
        <div className="flex flex-row md:flex-col gap-1 md:gap-4 shrink-0 md:shrink">
            <div className="flex gap-1 md:gap-4">
                <button onClick={() => setNavMode('Walking')} className={`px-2 py-1 md:p-4 rounded-lg md:rounded-2xl border flex items-center gap-1 md:gap-3 text-[10px] md:text-xs font-black ${navMode === 'Walking' ? 'bg-[#006064] text-white' : 'text-gray-400'}`}>
                   <Footprints size={12} className="md:w-5 md:h-5"/> <span className="hidden sm:inline">Walk</span>
                </button>
                <button onClick={() => setNavMode('Driving')} className={`px-2 py-1 md:p-4 rounded-lg md:rounded-2xl border flex items-center gap-1 md:gap-3 text-[10px] md:text-xs font-black ${navMode === 'Driving' ? 'bg-[#006064] text-white' : 'text-gray-400'}`}>
                   <Car size={12} className="md:w-5 md:h-5"/> <span className="hidden sm:inline">Drive</span>
                </button>
            </div>

            <button 
              onClick={() => (selectedOffice || selectedBuilding) && startNav(selectedOffice || selectedBuilding)} 
              className="bg-[#002e31] text-white px-3 py-1 md:py-5 rounded-lg md:rounded-2xl font-black uppercase text-[8px] md:text-[11px] hover:bg-black transition-all"
            >
              GO
            </button>
        </div>

        {/* Mini Stats on Mobile */}
        {isNavigating && (
            <div className="flex items-center bg-[#E0F7FA] px-3 py-1 md:p-8 rounded-lg md:rounded-[40px] gap-2 md:gap-8 shrink-0">
                <h4 className="text-xs md:text-4xl font-black text-[#006064] italic">{eta}m</h4>
                <div className="md:p-5 md:bg-white rounded-full text-[#006064]"><Ruler size={14} className="md:w-7 md:h-7"/></div>
                <button onClick={() => setShowDirectionsMenu(false)} className="md:hidden text-gray-400"><X size={16}/></button>
            </div>
        )}
    </div>
  </div>
)}

           <div className="flex-1 relative h-full">
  
{/* 🚀 Office Info Overlay - Responsive */}
{isNavigating && selectedOffice && (
  <div className="absolute left-4 md:left-10 top-24 md:top-1/2 -translate-y-0 md:-translate-y-1/2 z-[4500] w-[240px] md:w-72 bg-white rounded-[30px] md:rounded-[40px] shadow-2xl p-4 md:p-8 border-l-[8px] md:border-l-[12px] border-blue-500 no-print animate-in slide-in-from-left duration-500">
      <div className="space-y-4 md:space-y-6">
        
        {/* 1. የቢሮ ስም (Office Name) */}
        <div className="flex items-start gap-3 md:gap-4">
            <div className="bg-blue-50 p-2 md:p-3 rounded-xl md:rounded-2xl text-blue-500 shrink-0">
                <Briefcase size={18} className="md:w-5 md:h-5"/>
            </div>
            <div>
                <p className="text-[10px] md:text-xs font-black text-[#002e31] uppercase leading-tight">
                    {selectedOffice.searchName}
                </p>
                <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">Office</p>
            </div>
        </div>

        {/* 🚀 2. የህንጻ ስም (Building Name) - አዲስ የተጨመረ */}
        <div className="flex items-start gap-3 md:gap-4">
            <div className="bg-amber-50 p-2 md:p-3 rounded-xl md:rounded-2xl text-amber-600 shrink-0">
                <Building2 size={18} className="md:w-5 md:h-5"/>
            </div>
            <div>
                <p className="text-[10px] md:text-xs font-black text-[#002e31] uppercase leading-tight">
                    {selectedOffice.parentBuilding?.Name || selectedOffice.parentBuilding?.name || "N/A"}
                </p>
                <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">Building</p>
            </div>
        </div>

        {/* 3. ወለል (Floor Level) */}
        <div className="flex items-start gap-3 md:gap-4">
            <div className="bg-green-50 p-2 md:p-3 rounded-xl md:rounded-2xl text-green-500 shrink-0">
                <Hash size={18} className="md:w-5 md:h-5"/>
            </div>
            <div>
                <p className="text-[10px] md:text-xs font-black text-[#002e31] uppercase leading-tight">
                    {selectedOffice.Floor} Floor
                </p>
                <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">Level</p>
            </div>
        </div>
      </div>
  </div>
)}
{/* 🚀 Building Hover Detail Card - Fully Responsive */}
{hoveredBuilding && (
  <div className="absolute top-24 md:top-28 left-4 md:left-10 z-[1001] 
    w-[260px] sm:w-[300px] md:w-80 
    bg-white/95 backdrop-blur-md rounded-[30px] md:rounded-[40px] 
    shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-4 md:p-6 
    border-l-[10px] md:border-l-[12px] border-[#006064] 
    animate-in slide-in-from-left-5 duration-300 text-left no-print"
  >
     {/* ህንፃ ስም */}
     <h3 className="text-lg md:text-2xl font-black text-[#006064] uppercase mb-3 md:mb-4 leading-tight italic">
        {hoveredBuilding.Name || hoveredBuilding.name}
     </h3>

     {/* ህንፃ ፎቶ */}
     <div className="relative w-full h-32 md:h-40 mb-3 md:mb-4 rounded-2xl md:rounded-3xl overflow-hidden shadow-inner bg-gray-100">
        <img 
          src={hoveredBuilding.ImageUrl || hoveredBuilding.imageUrl || tuluImg} 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
          alt="Building" 
        />
        <div className="absolute top-2 right-2 bg-[#fbc02d] text-[#006064] px-3 py-1 rounded-full text-[8px] font-black uppercase">
           MAU Property
        </div>
     </div>

     {/* ዝርዝር መረጃ */}
     <div className="space-y-2">
        <p className="text-[9px] md:text-[11px] text-gray-500 font-bold leading-relaxed italic line-clamp-3">
           {hoveredBuilding.Description || "ይህ ህንፃ በመቅደላ አምባ ዩኒቨርሲቲ ውስጥ ከሚገኙ ዋና ዋና የትምህርት እና የአገልግሎት መስጫ ክፍሎች አንዱ ነው።"}
        </p>
        
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
           <MapPin size={14} className="text-[#fbc02d]"/>
           <span className="text-[8px] md:text-[10px] text-gray-400 font-black uppercase italic tracking-widest">
              Live Campus View
           </span>
        </div>
     </div>
  </div>
)}
                {/* 🚀 Navigation Instruction - Responsive */}
{isNavigating && navigationInstruction && (
   <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 z-[4500] w-[92%] md:w-[450px] bg-[#002e31] text-white rounded-[25px] md:rounded-[40px] shadow-2xl p-4 md:p-8 flex items-center gap-4 md:gap-8 border-b-[6px] md:border-b-[10px] border-[#fbc02d] no-print animate-in slide-in-from-top duration-500">
      <div className="bg-white/10 p-3 md:p-5 rounded-2xl md:rounded-3xl shrink-0">
        {React.cloneElement(navigationInstruction.icon, { size: window.innerWidth < 768 ? 24 : 32 })}
      </div>
      <div className="flex-1 min-w-0">
         <h3 className="text-xl md:text-3xl font-black uppercase italic leading-none truncate">
            {navigationInstruction.text}
         </h3>
         <p className="text-[9px] md:text-[11px] text-[#fbc02d] mt-1 md:mt-3 uppercase font-black tracking-[2px] md:tracking-[5px]">
            After {navigationInstruction.dist.toFixed(0)} Meters
         </p>
      </div>
   </div>
)}

                {/* 🚀 Off Route Prompt - Responsive */}
{showOffRoutePrompt && (
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[5000] w-[85%] sm:w-[380px] bg-white rounded-[35px] md:rounded-[50px] shadow-3xl p-6 md:p-10 border-t-[10px] md:border-t-[16px] border-[#fbc02d] text-center animate-in zoom-in duration-300">
      <div className="bg-[#fbc02d]/10 w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 text-[#fbc02d]">
        <AlertTriangle size={window.innerWidth < 768 ? 28 : 40}/>
      </div>
      <h3 className="text-lg md:text-2xl font-black text-[#002e31] uppercase mb-2 md:mb-3 italic">Off Route</h3>
      <p className="text-[10px] md:text-xs text-gray-500 font-bold mb-6 md:mb-10 italic px-2">
        መንገዱን ስተዋል። አዲሱን መንገድ እናሰላልዎት?
      </p>
      <div className="flex gap-3 md:gap-4">
          <button 
            onClick={() => handleRecalculateResponse(true)} 
            className="flex-1 bg-[#006064] text-white py-3 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase shadow-lg active:scale-95 transition-transform"
          >
            YES
          </button>
          <button 
            onClick={() => handleRecalculateResponse(false)} 
            className="flex-1 bg-gray-100 text-gray-400 py-3 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase border border-gray-100 active:scale-95 transition-transform"
          >
            SKIP
          </button>
      </div>
  </div>
)}

              {/* Map Search Bar - Fully Responsive */}
<div className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2 z-40 w-[92%] sm:w-[500px] md:w-[550px] no-print transition-all duration-300">
   {!isNavigating && (
     <div className="bg-white rounded-2xl sm:rounded-[25px] p-1.5 sm:p-2 shadow-[0_15px_40px_rgba(0,0,0,0.2)] flex items-center gap-2 sm:gap-3 border border-gray-100">
        <div className="flex-1 flex items-center px-2 sm:px-4">
           <Search size={20} className="text-gray-300 mr-2 sm:mr-4 shrink-0" />
           <input 
             type="text" 
             placeholder="Search buildings or offices..." 
             className="w-full bg-transparent outline-none text-xs sm:text-sm font-bold text-[#006064] placeholder-gray-300" 
             value={searchTerm} 
             onChange={(e) => setSearchTerm(e.target.value)} 
             onKeyPress={(e) => e.key === 'Enter' && handleSearchButtonClick()} 
           />
        </div>
        <button 
          onClick={handleSearchButtonClick} 
          className="bg-[#002e31] text-white px-4 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-black active:scale-95 transition-all shrink-0"
        >
          SEARCH
        </button>
     </div>
   )}

   {/* Search Suggestions Dropdown - Responsive */}
   {searchTerm && (
     <div className="mt-2 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-[25px] shadow-2xl border border-gray-100 overflow-hidden max-h-48 sm:max-h-64 overflow-y-auto animate-in slide-in-from-top-2 duration-300">
        {searchableItems
          .filter(i => i.searchName.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((item, idx) => (
             <div 
               key={idx} 
               onClick={() => handleSelectItem(item)} 
               className="p-3 sm:p-4 hover:bg-[#E0F7FA] cursor-pointer flex items-center gap-3 sm:gap-4 border-b border-gray-50 last:border-0 text-left transition-colors"
             >
                <div className={`p-1.5 sm:p-2 rounded-lg ${item.type === 'office' ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-[#006064]/50'}`}>
                   {item.type === 'office' ? <Briefcase size={14} /> : <Building2 size={14} />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] sm:text-[10px] font-black text-[#006064] uppercase tracking-wider italic leading-tight">
                    {item.searchName}
                  </span>
                  {item.type === 'office' && (
                    <span className="text-[7px] sm:text-[8px] text-gray-400 font-bold uppercase mt-0.5">
                      {item.parentBuilding?.Name || item.parentBuilding?.name} • Floor {item.Floor}
                    </span>
                  )}
                </div>
             </div>
          ))
        }
        {/* Result ካልተገኘ የሚታይ ጽሁፍ */}
        {searchableItems.filter(i => i.searchName.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
          <div className="p-4 text-center text-[10px] font-bold text-gray-400 uppercase italic">አልተገኘም!</div>
        )}
     </div>
   )}
</div>

                <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                  <TileLayer url={mapType === 'satellite' ? "https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} subdomains={['mt0','mt1','mt2','mt3']} />
                  <MapController coords={mapCenter} zoomLevel={mapZoom} />
                  {userPos && <Marker position={userPos} icon={isNavigating ? navIconGreen : userIconRed} />}
                  {searchMarkers.filter(b => b.latitude || b.Latitude).map(b => (
                    <Marker key={b.Id || b.id} position={[b.Latitude || b.latitude, b.Longitude || b.longitude]} icon={buildingIconBlue}
                    eventHandlers={{ 
                    mouseover: () => setHoveredBuilding(b), 
                      mouseout: () => setHoveredBuilding(null) 
                       }}>
                        <Popup className="custom-popup"><div className="p-3 text-center space-y-4"><h4 className="font-black uppercase text-xs italic">{b.Name || b.name}</h4><button onClick={() => startNav(b)} className="bg-[#004d40] text-white px-6 py-2.5 rounded-xl text-[10px] font-black">Navigate Here</button></div></Popup>
                    </Marker>
                  ))}
                 {routePath.length > 1 && (
                  <>
                    <Polyline positions={routePath} color="#002e31" weight={7} opacity={0.9} />
                    <Polyline positions={routePath} color="#00ffff" weight={4} opacity={1} />
                    <Marker position={routePath[routePath.length - 1]} icon={L.divIcon({ className: "", html: `<div class="text-cyan-400 text-3xl font-black" style="transform: rotate(${getRouteArrowAngle(routePath)}deg);">➤</div>`, iconSize: [26, 26], iconAnchor: [18, 18] })} />
                  </>
                 )}
                </MapContainer>

                {/* Map Controls - Responsive Version */}
<div className="absolute right-4 top-4 md:right-10 md:top-10 z-40 flex flex-col gap-3 md:gap-5 no-print transition-all duration-300">
   
   {/* Map Type Toggle (Satellite/Street) */}
   <button 
      onClick={() => setMapType(mapType === 'satellite' ? 'street' : 'satellite')} 
      className="bg-white p-3 md:p-5 rounded-xl md:rounded-[25px] shadow-2xl text-[#006064] hover:bg-gray-50 active:scale-90 transition-all border border-gray-100"
   >
      <Layers className="w-5 h-5 md:w-[26px] md:h-[26px]" />
   </button>

   {/* Zoom Controls Group */}
   <div className="flex flex-col bg-white rounded-xl md:rounded-[25px] shadow-2xl border border-gray-100 overflow-hidden">
      <button 
         onClick={() => setMapZoom(z => Math.min(z + 1, 20))} 
         className="p-3 md:p-5 hover:bg-gray-100 border-b border-gray-50 text-[#006064] active:bg-gray-200 transition-colors"
      >
         <Plus className="w-5 h-5 md:w-[26px] md:h-[26px]" />
      </button>
      <button 
         onClick={() => setMapZoom(z => Math.max(z - 1, 10))} 
         className="p-3 md:p-5 hover:bg-gray-100 text-[#006064] active:bg-gray-200 transition-colors"
      >
         <Minus className="w-5 h-5 md:w-[26px] md:h-[26px]" />
      </button>
   </div>

   {/* Locate Me Button */}
   <button 
      onClick={() => userPos && setMapCenter(userPos)} 
      className="bg-white p-3 md:p-5 rounded-xl md:rounded-[25px] shadow-2xl text-[#006064] hover:bg-gray-50 active:scale-90 transition-all border border-gray-100"
   >
      <LocateFixed className="w-5 h-5 md:w-[26px] md:h-[26px]" />
   </button>

</div>

                {/* Bottom Quick Controls - Responsive Version */}
<div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-40 w-[92%] sm:w-[85%] lg:w-full lg:max-w-[850px] bg-[#002e31]/95 backdrop-blur-3xl rounded-3xl md:rounded-full p-2 md:p-3 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex justify-between md:justify-around items-center no-print transition-all duration-300">
   
   <button 
     onClick={() => userPos && setMapCenter(userPos)} 
     className="flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center gap-1 md:gap-4 bg-[#004d40] text-white p-3 md:px-8 md:py-3 rounded-2xl md:rounded-full text-[9px] md:text-xs font-black uppercase shadow-xl hover:scale-105 active:scale-95 transition-all"
   >
      <Compass size={22} className="shrink-0" />
      <span className="hidden sm:inline">My Location</span>
   </button>

   <button 
     onClick={() => setShowDirectionsMenu(!showDirectionsMenu)} 
     className="flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center gap-1 md:gap-4 text-white p-3 md:px-8 md:py-3 rounded-2xl md:rounded-full text-[9px] md:text-xs font-black uppercase hover:bg-white/10 transition-all"
   >
      <Navigation size={22} className="rotate-45 shrink-0" />
      <span className="hidden sm:inline">Directions</span>
   </button>

   <button 
     onClick={toggleNearby} 
     className={`flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center gap-1 md:gap-4 p-3 md:px-8 md:py-3 rounded-2xl md:rounded-full text-[9px] md:text-xs font-black uppercase transition-all ${showNearbyOnly ? 'bg-[#fbc02d] text-[#002e31] shadow-xl' : 'text-white hover:bg-white/10'}`}
   >
      <MapPin size={22} className="shrink-0" />
      <span className="hidden sm:inline">Nearby</span>
   </button>

   <button 
     onClick={() => navigate('/campuses')} 
     className="flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center gap-1 md:gap-4 text-white p-3 md:px-8 md:py-3 rounded-2xl md:rounded-full text-[9px] md:text-xs font-black uppercase hover:bg-white/10 transition-all"
   >
      <School size={22} className="shrink-0" />
      <span className="hidden sm:inline">Campuses</span>
   </button>

   <button 
     onClick={() => window.print()} 
     className="flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center gap-1 md:gap-4 text-white p-3 md:px-8 md:py-3 rounded-2xl md:rounded-full text-[9px] md:text-xs font-black uppercase hover:bg-white/10 transition-all"
   >
      <Printer size={22} className="shrink-0" />
      <span className="hidden sm:inline">Print</span>
   </button>

</div>

               {/* Navigation Status - Responsive Version */}
{isNavigating && (
   <div className="absolute bottom-28 md:bottom-36 right-4 md:right-10 z-40 bg-white p-4 sm:p-6 md:p-10 rounded-[30px] md:rounded-[50px] shadow-2xl border border-gray-100 flex items-center gap-4 sm:gap-8 md:gap-16 no-print text-[#006064] transition-all duration-300 animate-in fade-in slide-in-from-right-5">
      
      {/* Distance Column */}
      <div className="text-center border-r-2 border-gray-100 pr-4 sm:pr-8 md:pr-16">
         <p className="text-[7px] sm:text-[9px] md:text-[10px] font-black uppercase text-gray-400 mb-1 md:mb-2 tracking-[2px] md:tracking-[5px]">
            Distance
         </p>
         <h4 className="text-xl sm:text-3xl md:text-5xl font-black italic transition-all">
            {distance} <span className="text-[10px] md:text-xl">m</span>
         </h4>
      </div>

      {/* Time Column */}
      <div className="text-center">
         <p className="text-[7px] sm:text-[9px] md:text-[10px] font-black uppercase text-gray-400 mb-1 md:mb-2 tracking-[2px] md:tracking-[5px]">
            Est. Time
         </p>
         <h4 className="text-xl sm:text-3xl md:text-5xl font-black italic transition-all">
            {eta} <span className="text-[10px] md:text-xl">min</span>
         </h4>
      </div>

      {/* Stop Button */}
      <button 
         onClick={handleStopNavigation} 
         className="bg-red-500 text-white p-3 md:p-6 rounded-2xl md:rounded-[35px] ml-2 md:ml-10 hover:bg-red-600 transition-all active:scale-90 flex items-center justify-center shadow-lg shadow-red-200"
      >
         <Square className="w-5 h-5 sm:w-7 sm:h-7 md:w-9 md:h-9" />
      </button>

   </div>
)}
           </div>
      </div>

      {/* 🏁 3. FOOTER (አሁን ኮምፖነንት ሆኗል) */}
      <Footer />

      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-container { z-index: 1 !important; cursor: crosshair; }
        .custom-popup .leaflet-popup-content-wrapper { border-radius: 50px; padding: 15px; border: 5px solid #002e31; }
        .custom-popup .leaflet-popup-tip { display: none; }
        @media print { .no-print { display: none !important; } }
      `}} />
    </div>
  );
};

export default MapPage;