import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { MapContainer, TileLayer, useMapEvents, CircleMarker, Polyline, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Save, Trash2, MousePointer2, Route, Undo2, Redo2, Upload, X, Edit3, 
  Check, Search, Filter, Plus, LayoutDashboard, Map as MapIcon, 
  Settings, FileText, BarChart3, AlertCircle, Info, Eye, Trash, ChevronRight, CheckCircle2,
  XCircle, Link2, MapPin, Activity, Ruler, Layers, HelpCircle, Home
} from 'lucide-react';

// --- 🚀 ማርከር አይኮን ሴታፕ ---
const blueMarkerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// ለህንፃዎች (Nearby) የሚሆን ወርቃማ ማርከር
const buildingMarkerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// --- 1. Helper: የርቀት መለኪያ (Haversine) ---
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

// --- Point-to-Line Projection Logic ---
const getClosestPointOnSegment = (P, A, B) => {
    const latP = P[0], lonP = P[1];
    const latA = A[0], lonA = A[1];
    const latB = B[0], lonB = B[1];
    const dx = latB - latA;
    const dy = lonB - lonA;
    if (dx === 0 && dy === 0) return A;
    const t = ((latP - latA) * dx + (lonP - lonA) * dy) / (dx * dx + dy * dy);
    if (t < 0) return A;
    if (t > 1) return B;
    return [latA + t * dx, lonA + t * dy];
};

// --- 2. Helper: የመንገድ ቀለሞች ---
const handleStatusColor = (status) => {
  const colors = { 
    0: '#22c55e', 1: '#ef4444', 2: '#f59e0b', 3: '#ea580c',
    'Active': '#22c55e', 'Closed': '#ef4444', 'Construction': '#f59e0b', 'Damaged': '#ea580c' 
  };
  return colors[status] || '#94a3b8';
};

// --- 3. AutoFocus Map Component ---
function AutoFocusMap({ coords }) {
  const map = useMap();
  useEffect(() => { 
    if (coords && coords[0] && coords[0] !== 0) {
      map.setView(coords, 18, { animate: true }); 
    }
  }, [coords, map]);
  return null;
}

const getCampusId = (c) => c?.id ?? c?.Id;
const getCampusName = (c) => c?.name ?? c?.Name ?? "Unknown Campus";
const getCampusLat = (c) => c?.latitude ?? c?.Latitude;
const getCampusLng = (c) => c?.longitude ?? c?.Longitude;

const RoadDesigner = () => {
  const navigate = useNavigate();
  const [campuses, setCampuses] = useState([]);
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [roadNodes, setRoadNodes] = useState([]); 
  const [redoStack, setRedoStack] = useState([]); 
  const [existingRoads, setExistingRoads] = useState([]); 
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [focusCoords, setFocusCoords] = useState(null); 

  // --- [NEW STATE] Nearby Buildings ---
  const [showNearby, setShowNearby] = useState(false);
  const [buildings, setBuildings] = useState([]);
  
  const [showInputBox, setShowInputBox] = useState(false);
  const [showEditBox, setShowEditBox] = useState(false);
  const [tempRoadData, setTempRoadData] = useState({ name: "", status: "Active", roadType: "Pedestrian" });
  const [editingRoad, setEditingRoad] = useState(null);

  // --- Snapping Confirmation ---
  const [snapConfirm, setSnapConfirm] = useState({ show: false, point: null, message: "" });

  useEffect(() => { 
    api.get('/Campuses').then(res => setCampuses(res.data)).catch(err => console.log(err)); 
  }, []);

  const fetchRoads = async () => {
    if (!selectedCampusId) return;
    try { 
      const res = await api.get(`/Roads/network/${selectedCampusId}`); 
      setExistingRoads(res.data); 
    } catch (e) { setExistingRoads([]); }
  };

  // --- [NEW] Fetch Buildings ---
  const fetchBuildings = async () => {
    if (!selectedCampusId) return;
    try {
      const res = await api.get(`/Buildings/campus/${selectedCampusId}`);
      setBuildings(res.data);
    } catch (e) { setBuildings([]); }
  };

  useEffect(() => { 
    fetchRoads();
    if(showNearby) fetchBuildings();
  }, [selectedCampusId, showNearby]);

  const uniqueRoadsList = useMemo(() => {
    const allEdges = existingRoads.flatMap(n => (n.edges ?? n.Edges) || []);
    const uniqueMap = new Map();
    allEdges.forEach(edge => {
      const edgeId = edge.id ?? edge.Id;
      if (edgeId && !uniqueMap.has(edgeId)) uniqueMap.set(edgeId, edge);
    });
    return Array.from(uniqueMap.values());
  }, [existingRoads]);

  const stats = useMemo(() => ({
    total: uniqueRoadsList.length,
    active: uniqueRoadsList.filter(e => (e.status ?? e.Status) === 0 || (e.status ?? e.Status) === "Active").length,
    construction: uniqueRoadsList.filter(e => (e.status ?? e.Status) === 2 || (e.status ?? e.Status) === "Construction").length,
    closed: uniqueRoadsList.filter(e => (e.status ?? e.Status) === 1 || (e.status ?? e.Status) === "Closed").length,
    damaged: uniqueRoadsList.filter(e => (e.status ?? e.Status) === 3 || (e.status ?? e.Status) === "Damaged").length,
    intersections: existingRoads.length
  }), [uniqueRoadsList, existingRoads]);

  const handleClearAllRoads = async () => {
    if (!selectedCampusId) return alert("እባክዎ መጀመሪያ ካምፓስ ይምረጡ!");
    if (!window.confirm("ማስጠንቀቂያ! የዚህን ካምፓስ መንገዶች በሙሉ ማጥፋት ትፈልጋለህ?")) return;
    try {
      await api.delete(`/Roads/clear-network/${selectedCampusId}`);
      alert("ሁሉም ዳታ ተሰርዟል! ✅"); fetchRoads();
    } catch (err) { alert("ማጥፋት አልተቻለም።"); }
  };

  const handleUndo = () => {
    if (roadNodes.length > 0) {
      const lastNode = roadNodes[roadNodes.length - 1];
      setRedoStack(prev => [...prev, lastNode]);
      setRoadNodes(prev => prev.slice(0, -1));
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextNode = redoStack[redoStack.length - 1];
      setRoadNodes(prev => [...prev, nextNode]);
      setRedoStack(prev => prev.slice(0, -1));
    }
  };

  const handleEditClick = (road) => {
    const statusNames = ["Active", "Closed", "Construction", "Damaged"];
    const typeNames = ["Pedestrian", "Vehicular"];
    setEditingRoad(road);
    const rStatus = road.status ?? road.Status;
    const rType = road.roadType ?? road.RoadType;
    setTempRoadData({ 
      name: (road.roadName ?? road.RoadName) || "", 
      status: typeof rStatus === 'number' ? statusNames[rStatus] : rStatus,
      roadType: typeof rType === 'number' ? typeNames[rType] : "Pedestrian"
    });
    setShowEditBox(true);
  };

  const handleViewRoad = (road) => {
    setSelectedRoad(road);
    const roadId = road.id ?? road.Id;
    const startNode = existingRoads.find(n => (n.edges ?? n.Edges)?.some(e => (e.id ?? e.Id) === roadId));
    if (startNode) { 
        setFocusCoords([startNode.latitude ?? startNode.Latitude, startNode.longitude ?? startNode.Longitude]); 
    }
  };

  const handleUpdateRoad = async () => {
    try {
      const statusMap = { "Active": 0, "Closed": 1, "Construction": 2, "Damaged": 3 };
      const typeMap = { "Pedestrian": 0, "Vehicular": 1 };
      await api.post(`/Roads/update-segment/${editingRoad.id ?? editingRoad.Id}`, {
        roadName: tempRoadData.name,
        status: statusMap[tempRoadData.status] ?? 0,
        roadType: typeMap[tempRoadData.roadType] ?? 0
      });
      alert("መንገዱ በስኬት ተስተካክሏል! ✅");
      setShowEditBox(false); fetchRoads(); setSelectedRoad(null);
    } catch (err) { alert("ማስተካከያው አልተሳካም!"); }
  };

  const handleDeleteRoad = async (edgeId) => {
    if (!window.confirm("እርግጠኛ ነህ ይህን መንገድ መሰረዝ ትፈልጋለህ?")) return;
    try {
      await api.delete(`/Roads/segment/${edgeId}`); 
      alert("መንገዱ ተሰርዟል!"); fetchRoads(); setSelectedRoad(null);
    } catch (err) { alert("መሰረዝ አልተቻለም።"); }
  };

  const handleSnapConfirm = (confirmed) => {
    if (confirmed && snapConfirm.point) {
        const { lat, lng } = snapConfirm.point;
        if (roadNodes.length > 0) {
            const lastNode = roadNodes[roadNodes.length - 1];
            if (getDist([lat, lng], [lastNode.latitude, lastNode.longitude]) < 0.1) {
                setSnapConfirm({ show: false, point: null, message: "" });
                return;
            }
        }
        setRoadNodes(prev => [...prev, { id: Date.now(), latitude: lat, longitude: lng }]);
    }
    setSnapConfirm({ show: false, point: null, message: "" });
  };

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        if (!isDrawing || !selectedCampusId || snapConfirm.show) return;
        let { lat, lng } = e.latlng;
        const SNAP_THRESHOLD = 10; 

        const closestNode = existingRoads.find(p => getDist([lat, lng], [p.latitude ?? p.Latitude, p.longitude ?? p.Longitude]) < SNAP_THRESHOLD);

        if (closestNode) {
            setSnapConfirm({
                show: true,
                point: { lat: closestNode.latitude ?? closestNode.Latitude, lng: closestNode.longitude ?? closestNode.Longitude },
                message: "በአቅራቢያው ያለ ነጥብ ተገኝቷል። እሱን መጠቀም ይፈልጋሉ ወይስ አዲስ ይፈጠር?"
            });
            return;
        }

        let minEdgeDist = SNAP_THRESHOLD;
        let bestSnapPoint = null;

        existingRoads.forEach(node => {
            (node.edges ?? node.Edges)?.forEach(edge => {
                const target = existingRoads.find(n => (n.id ?? n.Id) === (edge.endNodeId ?? edge.EndNodeId));
                if (target) {
                    const A = [node.latitude ?? node.Latitude, node.longitude ?? node.Longitude];
                    const B = [target.latitude ?? target.Latitude, target.longitude ?? target.Longitude];
                    const snapPt = getClosestPointOnSegment([lat, lng], A, B);
                    const d = getDist([lat, lng], snapPt);
                    if (d < minEdgeDist) {
                        minEdgeDist = d;
                        bestSnapPoint = snapPt;
                    }
                }
            });
        });

        if (bestSnapPoint) {
            setSnapConfirm({
                show: true,
                point: { lat: bestSnapPoint[0], lng: bestSnapPoint[1] },
                message: "በአቅራቢያው መንገድ ተገኝቷል። እዚያ ላይ መስቀለኛ ነጥብ (Intersection) መፍጠር ይፈልጋሉ?"
            });
            return;
        }

        if (roadNodes.length > 0) {
            const lastNode = roadNodes[roadNodes.length - 1];
            if (getDist([lat, lng], [lastNode.latitude, lastNode.longitude]) < 0.1) return;
        }

        setRoadNodes(prev => [...prev, { id: Date.now(), latitude: lat, longitude: lng }]);
        setRedoStack([]); 
      },
      dblclick() { setFocusCoords(null); }
    });
    return null;
  };

  const handleFinalSave = async () => {
    if (!selectedCampusId || roadNodes.length < 2) return alert("ቢያንስ 2 ነጥቦችን ያያይዙ!");
    try {
      const statusMap = { "Active": 0, "Closed": 1, "Construction": 2, "Damaged": 3 };
      const typeMap = { "Pedestrian": 0, "Vehicular": 1 };
      const roadData = {
        campusId: parseInt(selectedCampusId), 
        roadName: tempRoadData.name || "Main Road",
        status: statusMap[tempRoadData.status] ?? 0,
        roadType: typeMap[tempRoadData.roadType] ?? 0,
        nodes: roadNodes.map(n => ({ latitude: n.latitude, longitude: n.longitude }))
      };
      await api.post('/Roads/save-network', { ...roadData, networkDto: roadData });
      setRoadNodes([]); setShowInputBox(false); fetchRoads(); alert("መንገዱ በስኬት ተመዝግቧል! 🚀");
    } catch (err) { alert("መመዝገብ አልተቻለም።"); }
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden font-sans italic font-bold">
      {/* Sidebar */}
      <div className="w-64 bg-[#001C47] text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10"><h1 className="text-sm font-bold uppercase tracking-widest">Mau Admin</h1></div>
        <nav className="flex-1 p-4 space-y-1">
          <div onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/10 text-gray-400 transition-all"><LayoutDashboard size={18}/> <span className="text-xs">Dashboard</span></div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white shadow-lg"><MapIcon size={18}/> <span className="text-xs">Road Designer</span></div>
          
          {/* [NEW] Sidebar Nearby Link */}
          <div onClick={() => setShowNearby(!showNearby)} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${showNearby ? 'bg-amber-500 text-white' : 'hover:bg-white/10 text-gray-400'}`}>
            <MapPin size={18}/> <span className="text-xs">Nearby Buildings</span>
          </div>

          <div onClick={handleClearAllRoads} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-red-400 hover:bg-red-500/10 mt-6 border border-red-500/20 transition-all"><Trash2 size={18}/> <span className="text-xs uppercase italic">Wipe Campus Data</span></div>
        </nav>
        <div className="p-4 border-t border-white/10 mt-auto">
          <div onClick={() => navigate('/login')} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-gray-400 hover:text-white transition-all"><ChevronRight size={18}/> <span className="text-xs uppercase">Sign Out</span></div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden leading-none">
        <header className="bg-[#001C47] text-white h-20 flex items-center justify-between px-10 shadow-2xl z-20">
          <h2 className="text-xl font-black italic">Campus Road Control Dashboard</h2>
          <select className="bg-white/10 border-2 border-white/20 rounded-xl px-4 py-2 text-xs outline-none focus:border-ma-gold" value={selectedCampusId} onChange={e => setSelectedCampusId(e.target.value)}>
            <option value="" className="text-black">-- Select Campus --</option>
            {campuses.map(c => {
                const id = getCampusId(c);
                return <option key={id} value={id} className="text-black">{getCampusName(c).toUpperCase()}</option>
            })}
          </select>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex gap-8 h-[550px]">
            <div className="flex-1 bg-white rounded-[40px] shadow-2xl border-8 border-white overflow-hidden relative flex flex-col">
              <div className="p-3 border-b flex items-center justify-between bg-slate-50">
                <div className="flex gap-2 items-center">
                  <ToolBtn icon={<MousePointer2 size={18}/>} label="Select" active={!isDrawing && !showNearby} onClick={() => { setIsDrawing(false); setShowNearby(false); }}/>
                  <ToolBtn icon={<Edit3 size={18}/>} label="Draw Road" active={isDrawing} onClick={() => { setIsDrawing(true); setShowNearby(false); }}/>
                  
                  {/* [NEW] Nearby Tool Button */}
                  <ToolBtn icon={<MapPin size={18}/>} label="Nearby" active={showNearby} onClick={() => { setShowNearby(!showNearby); setIsDrawing(false); }}/>
                  
                  <div className="w-[2px] bg-slate-200 mx-2 h-8"></div>
                  <button onClick={handleUndo} className={`p-2 transition-all ${roadNodes.length > 0 ? 'text-blue-600' : 'text-slate-300'}`}><Undo2 size={20}/></button>
                  <button onClick={handleRedo} className={`p-2 transition-all ${redoStack.length > 0 ? 'text-blue-600' : 'text-slate-300'}`}><Redo2 size={20}/></button>
                </div>
                <button onClick={() => { if(roadNodes.length >= 2) setShowInputBox(true); else alert("መጀመሪያ መንገድ ይሳሉ!"); }} className="bg-[#00204E] text-white px-8 py-2.5 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-blue-600 transition-all">Save Changes</button>
              </div>
              
              <div className="flex-1 relative">
                <MapContainer center={[10.985, 39.263]} zoom={17} className="h-full w-full" doubleClickZoom={false}>
                  <TileLayer url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} />
                  <MapEvents />
                  
                  {selectedCampusId && (() => {
                      const campus = campuses.find(c => String(getCampusId(c)) === String(selectedCampusId));
                      if (!campus) return null;
                      const lat = getCampusLat(campus);
                      const lng = getCampusLng(campus);
                      if (!lat || !lng) return null;
                      return <AutoFocusMap coords={[lat, lng]} />;
                  })()}

                  {focusCoords && <AutoFocusMap coords={focusCoords} />}
                  
                  {focusCoords && (
                      <Marker position={focusCoords} icon={blueMarkerIcon}>
                          <Popup><p className="font-black italic uppercase text-[10px]">{(selectedRoad?.roadName ?? selectedRoad?.RoadName)}</p></Popup>
                      </Marker>
                  )}

                  {/* [NEW] Render Nearby Buildings */}
                  {showNearby && buildings.map((b, idx) => (
                    <Marker key={`build-${idx}`} position={[b.latitude ?? b.Latitude, b.longitude ?? b.Longitude]} icon={buildingMarkerIcon}>
                        <Popup>
                            <div className="font-black italic text-[11px] p-1 uppercase">
                                <p className="text-amber-600 mb-1">Building Info</p>
                                <p>{b.name ?? b.Name}</p>
                            </div>
                        </Popup>
                    </Marker>
                  ))}

                  {existingRoads.map((node) => (node.edges ?? node.Edges)?.map((edge, idx) => {
                      const target = existingRoads.find(n => (n.id ?? n.Id) === (edge.endNodeId ?? edge.EndNodeId));
                      if (!target) return null;
                      const nLat = node.latitude ?? node.Latitude;
                      const nLng = node.longitude ?? node.Longitude;
                      const tLat = target.latitude ?? target.Latitude;
                      const tLng = target.longitude ?? target.Longitude;
                      if (!nLat || !tLat) return null;
                      
                      const eId = edge.id ?? edge.Id;
                      const sRoadId = selectedRoad?.id ?? selectedRoad?.Id;
                      const isSel = sRoadId === eId;

                      return <Polyline key={`${eId}-${idx}`} positions={[[nLat, nLng], [tLat, tLng]]} color={isSel ? '#3b82f6' : handleStatusColor(edge.status ?? edge.Status)} weight={isSel ? 10 : 6} opacity={0.8} eventHandlers={{ click: () => setSelectedRoad(edge) }} />;
                  }))}

                  {roadNodes.length > 0 && (
                    <Polyline positions={roadNodes.map(n => [n.latitude, n.longitude])} color="#3b82f6" weight={5} dashArray="10, 10" />
                  )}

                  {snapConfirm.show && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[4000] bg-white border-2 border-blue-600 p-6 rounded-[30px] shadow-2xl flex flex-col items-center gap-4 w-[320px]">
                        <HelpCircle className="text-blue-600" size={32}/>
                        <p className="text-[11px] text-center text-[#001C47] uppercase leading-relaxed">{snapConfirm.message}</p>
                        <div className="flex gap-2 w-full">
                            <button onClick={() => handleSnapConfirm(true)} className="flex-1 bg-blue-600 text-white py-3 rounded-2xl text-[10px] uppercase font-black hover:bg-blue-700">Reuse (አዎ)</button>
                            <button onClick={() => handleSnapConfirm(false)} className="flex-1 bg-slate-100 text-slate-400 py-3 rounded-2xl text-[10px] uppercase font-black hover:bg-slate-200">Skip (አይ)</button>
                        </div>
                    </div>
                  )}
                </MapContainer>
              </div>
            </div>

            <div className="w-96 bg-white rounded-[40px] shadow-2xl p-8 flex flex-col overflow-hidden border border-gray-100">
               <h3 className="font-black uppercase text-sm border-b pb-4 mb-6 italic tracking-widest text-[#001C47] flex items-center gap-2"><Layers size={20}/> Road Details</h3>
               {selectedRoad ? (
                 <div className="space-y-6">
                    <div className="space-y-5 bg-slate-50 p-6 rounded-[30px] border border-slate-100 shadow-inner">
                        <DetailItem icon={<MapPin size={16}/>} label="Road Name" value={(selectedRoad.roadName ?? selectedRoad.RoadName) || 'Unnamed Road'} />
                        <DetailItem icon={<Layers size={16}/>} label="Road Type" value={typeof (selectedRoad.roadType ?? selectedRoad.RoadType) === 'number' ? ["Pedestrian", "Vehicular"][selectedRoad.roadType ?? selectedRoad.RoadType] : "Pedestrian"} />
                        <DetailItem icon={<Activity size={16}/>} label="Road Status" value={typeof (selectedRoad.status ?? selectedRoad.Status) === 'number' ? ["Active", "Closed", "Construction", "Damaged"][selectedRoad.status ?? selectedRoad.Status] : (selectedRoad.status ?? selectedRoad.Status)} color={handleStatusColor(selectedRoad.status ?? selectedRoad.Status)} />
                        <DetailItem icon={<Ruler size={16}/>} label="Road Length" value={`${(selectedRoad.distance ?? selectedRoad.Distance)?.toFixed(2)} M`} />
                    </div>
                    
                    <div className="flex flex-col gap-3 pt-2">
                        <button onClick={() => handleEditClick(selectedRoad)} className="w-full bg-[#001C47] text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"><Edit3 size={16}/> Edit Road Info</button>
                        <button onClick={() => handleDeleteRoad(selectedRoad.id ?? selectedRoad.Id)} className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-black text-xs uppercase border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-2"><Trash size={16}/> Delete Road</button>
                    </div>
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-slate-300 italic text-center space-y-4">
                    <Info size={48} strokeWidth={1}/>
                    <p className="text-[11px] uppercase font-black tracking-widest leading-relaxed">Select a road on map<br/>to manage its status</p>
                 </div>
               )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[
              { label: 'Total Roads', value: stats.total, color: 'border-slate-200', icon: <Route size={20}/> },
              { label: 'Active Roads', value: stats.active, color: 'border-green-500', icon: <CheckCircle2 size={20}/> },
              { label: 'Construction', value: stats.construction, color: 'border-amber-400', icon: <Settings size={20}/> },
              { label: 'Closed Roads', value: stats.closed, color: 'border-red-500', icon: <XCircle size={20}/> },
              { label: 'Damaged Roads', value: stats.damaged, color: 'border-orange-500', icon: <AlertCircle size={20}/> },
              { label: 'Intersections', value: stats.intersections, color: 'border-blue-500', icon: <Link2 size={20}/> }
            ].map((stat, i) => (
              <div key={i} className={`bg-white p-5 rounded-[35px] border-b-[8px] ${stat.color} shadow-xl flex items-center gap-4 transition-transform hover:-translate-y-1`}>
                <div className="bg-slate-50 p-3 rounded-2xl shadow-inner text-[#001C47]">{stat.icon}</div>
                <div><p className="text-[8px] text-gray-400 uppercase font-black tracking-widest">{stat.label}</p><p className="text-xl font-black text-[#00204E]">{stat.value}</p></div>
              </div>
            ))}
          </div>

          {/* Edit Modal */}
          {showEditBox && (
            <div className="fixed inset-0 bg-[#00204E]/60 backdrop-blur-md z-[3000] flex items-center justify-center p-6 italic font-bold">
              <div className="bg-white w-full max-w-sm rounded-[50px] shadow-2xl p-12 relative border-t-[16px] border-ma-gold">
                <h3 className="text-xl font-black text-[#001C47] uppercase mb-8 underline decoration-ma-gold decoration-4 underline-offset-8">Edit Road</h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase ml-2">Road Name</label>
                    <input type="text" className="w-full bg-slate-50 p-4 rounded-2xl outline-none" value={tempRoadData.name} onChange={e => setTempRoadData({...tempRoadData, name: e.target.value})}/>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase ml-2">Status</label>
                    <select className="w-full bg-slate-50 p-4 rounded-2xl outline-none" value={tempRoadData.status} onChange={e => setTempRoadData({...tempRoadData, status: e.target.value})}>
                      <option value="Active">Active</option><option value="Closed">Closed</option><option value="Construction">Construction</option><option value="Damaged">Damaged</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase ml-2">Road Type</label>
                    <select className="w-full bg-slate-50 p-4 rounded-2xl outline-none" value={tempRoadData.roadType} onChange={e => setTempRoadData({...tempRoadData, roadType: e.target.value})}>
                      <option value="Pedestrian">Pedestrian</option><option value="Vehicular">Vehicular</option>
                    </select>
                  </div>
                  <button onClick={handleUpdateRoad} className="w-full bg-[#00204E] text-white py-5 rounded-[30px] font-black uppercase text-xs shadow-xl flex items-center justify-center gap-2"><Save size={18}/> Update Road</button>
                  <button onClick={() => setShowEditBox(false)} className="w-full text-slate-400 text-[10px] uppercase mt-2">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* New Road Modal */}
          {showInputBox && (
            <div className="fixed inset-0 bg-[#00204E]/60 backdrop-blur-md z-[3000] flex items-center justify-center p-6 italic font-bold">
              <div className="bg-white w-full max-w-sm rounded-[50px] shadow-2xl p-12 relative border-t-[16px] border-ma-gold">
                <h3 className="text-2xl font-black text-[#001C47] uppercase mb-8 underline decoration-ma-gold decoration-4 underline-offset-8">Road Metadata</h3>
                <div className="space-y-6">
                  <input type="text" className="w-full bg-slate-50 p-5 rounded-3xl outline-none italic shadow-inner" placeholder="Road Name" value={tempRoadData.name} onChange={e => setTempRoadData({...tempRoadData, name: e.target.value})}/>
                  <select className="w-full bg-slate-50 p-5 rounded-3xl outline-none italic shadow-inner" value={tempRoadData.status} onChange={e => setTempRoadData({...tempRoadData, status: e.target.value})}><option value="Active">Active</option><option value="Closed">Closed</option><option value="Construction">Construction</option><option value="Damaged">Damaged</option></select>
                  <select className="w-full bg-slate-50 p-5 rounded-3xl outline-none italic shadow-inner" value={tempRoadData.roadType} onChange={e => setTempRoadData({...tempRoadData, roadType: e.target.value})}><option value="Pedestrian">Pedestrian</option><option value="Vehicular">Vehicular</option></select>
                  <button onClick={handleFinalSave} className="w-full bg-[#00204E] text-white py-6 rounded-[35px] font-black uppercase shadow-2xl flex items-center justify-center gap-4"><CheckCircle2 size={24}/> Confirm and Push</button>
                  <button onClick={() => setShowInputBox(false)} className="w-full text-slate-400 text-xs font-black uppercase mt-2">Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[40px] shadow-2xl border overflow-hidden mb-10 border-gray-100">
             <div className="p-8 border-b bg-gray-50/30 flex justify-between items-center italic font-bold">
               <h3 className="font-black uppercase text-sm underline decoration-ma-gold decoration-4 underline-offset-8">Roads List</h3>
               <button onClick={() => { setRoadNodes([]); setIsDrawing(true); setShowNearby(false); }} className="bg-[#22c55e] text-white px-10 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-3 shadow-lg hover:bg-green-600 transition-all"><Plus size={20}/> Add Road</button>
             </div>
            <table className="w-full text-left font-black uppercase leading-none italic">
              <thead className="bg-gray-50/50 text-gray-400 text-[9px] border-b uppercase tracking-widest">
                <tr><th className="p-8">ID</th><th className="p-8">Road Name</th><th className="p-8">Status</th><th className="p-8">Length (m)</th><th className="p-8 text-center">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-[#00204E]">
                {uniqueRoadsList.map((e, idx) => {
                  const eId = e.id ?? e.Id;
                  const eName = (e.roadName ?? e.RoadName);
                  const eStatus = e.status ?? e.Status;
                  const eDist = e.distance ?? e.Distance;
                  
                  return (
                    <tr key={idx} className="hover:bg-blue-50/10 transition group text-xs">
                      <td className="p-8 text-slate-300">R-{eId}</td>
                      <td className="p-8">{eName || 'Unnamed Road'}</td>
                      <td className="p-8"><span className="flex items-center gap-2" style={{ color: handleStatusColor(eStatus) }}><div className="w-2 h-2 rounded-full shadow-sm animate-pulse" style={{ background: handleStatusColor(eStatus) }}></div>{typeof eStatus === 'number' ? ["Active", "Closed", "Construction", "Damaged"][eStatus] : eStatus}</span></td>
                      <td className="p-8 font-mono">{eDist?.toFixed(2)}</td>
                      <td className="p-8 text-center flex justify-center gap-4">
                        <ActionBtn icon={<Eye size={14}/>} color="text-indigo-600" bg="bg-indigo-50" onClick={() => handleViewRoad(e)} title="View on Map" />
                        <ActionBtn icon={<Edit3 size={14}/>} color="text-yellow-600" bg="bg-yellow-50" onClick={() => handleEditClick(e)} />
                        <ActionBtn icon={<Trash2 size={14}/>} color="text-red-500" bg="bg-red-50" onClick={() => handleDeleteRoad(eId)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon, label, value, color }) => (
    <div className="flex items-center gap-4 border-b border-white/50 pb-3 last:border-0">
        <div className="p-2 bg-white rounded-xl shadow-sm text-[#001C47] border border-gray-100">{icon}</div>
        <div className="flex-1">
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{label}</p>
            <p className="text-xs font-black text-[#001C47] truncate" style={{ color: color || 'inherit' }}>{value}</p>
        </div>
    </div>
);

const ToolBtn = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all uppercase italic ${active ? 'bg-amber-500 text-white shadow-lg ring-1 ring-amber-200' : 'text-slate-400 hover:bg-slate-100'}`}>{icon} {label}</button>
);

const ActionBtn = ({ icon, color, bg, onClick, title }) => (
  <button onClick={onClick} title={title} className={`p-3 ${color} ${bg} rounded-2xl shadow-sm hover:scale-110 transition-all border border-transparent hover:border-white`}>{icon}</button>
);

export default RoadDesigner;