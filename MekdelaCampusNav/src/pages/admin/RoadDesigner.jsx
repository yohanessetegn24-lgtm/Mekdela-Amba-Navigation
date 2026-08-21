import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { MapContainer, TileLayer, useMapEvents, CircleMarker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Save, Trash2, MousePointer2, Route, Undo2, Redo2, Upload, X, Edit3, 
  Check, Search, Filter, Plus, LayoutDashboard, Map as MapIcon, 
  Settings, FileText, BarChart3, AlertCircle, Info, Eye, Trash, ChevronRight, CheckCircle2,
  XCircle, Link2 
} from 'lucide-react';

// --- 1. Helper: የርቀት መለኪያ ---
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

// --- 2. Helper: የመንገድ ቀለሞች ---
const handleStatusColor = (status) => {
  const colors = { 0: '#22c55e', 1: '#ef4444', 2: '#f59e0b', 3: '#ea580c', 'Active': '#22c55e', 'Closed': '#ef4444', 'Construction': '#f59e0b', 'Damaged': '#ea580c' };
  return colors[status] || '#94a3b8';
};

// --- 3. AutoFocus Map Component ---
function AutoFocusMap({ coords }) {
  const map = useMap();
  useEffect(() => { if (coords && coords[0] && coords[0] !== 0) map.setView(coords, 18, { animate: true }); }, [coords, map]);
  return null;
}

const RoadDesigner = () => {
  const navigate = useNavigate();
  const [campuses, setCampuses] = useState([]);
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [roadNodes, setRoadNodes] = useState([]); 
  const [redoStack, setRedoStack] = useState([]); 
  const [existingRoads, setExistingRoads] = useState([]); 
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Modals & Temp states
  const [showInputBox, setShowInputBox] = useState(false);
  const [showEditBox, setShowEditBox] = useState(false);
  const [tempRoadData, setTempRoadData] = useState({ name: "", status: "Active", roadType: "Pedestrian" });
  const [editingRoad, setEditingRoad] = useState(null);

  useEffect(() => { api.get('/Campuses').then(res => setCampuses(res.data)).catch(err => console.log(err)); }, []);

  const fetchRoads = async () => {
    if (!selectedCampusId) return;
    try { 
      const res = await api.get(`/Roads/network/${selectedCampusId}`); 
      setExistingRoads(res.data); 
    } catch (e) { setExistingRoads([]); }
  };

  useEffect(() => { fetchRoads(); }, [selectedCampusId]);

  const uniqueRoadsList = useMemo(() => {
    const allEdges = existingRoads.flatMap(n => n.edges || []);
    const uniqueMap = new Map();
    allEdges.forEach(edge => { if (!uniqueMap.has(edge.id)) uniqueMap.set(edge.id, edge); });
    return Array.from(uniqueMap.values());
  }, [existingRoads]);

  const stats = useMemo(() => ({
    total: uniqueRoadsList.length,
    active: uniqueRoadsList.filter(e => e.status === 0 || e.status === "Active").length,
    construction: uniqueRoadsList.filter(e => e.status === 2 || e.status === "Construction").length,
    closed: uniqueRoadsList.filter(e => e.status === 1 || e.status === "Closed").length,
    damaged: uniqueRoadsList.filter(e => e.status === 3 || e.status === "Damaged").length,
    intersections: existingRoads.length
  }), [uniqueRoadsList, existingRoads]);

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
    setTempRoadData({ 
      name: road.roadName || "", 
      status: typeof road.status === 'number' ? statusNames[road.status] : road.status,
      roadType: typeof road.roadType === 'number' ? typeNames[road.roadType] : "Pedestrian"
    });
    setShowEditBox(true);
  };

  const handleUpdateRoad = async () => {
  try {
    const statusMap = { "Active": 0, "Closed": 1, "Construction": 2, "Damaged": 3 };
    const typeMap = { "Pedestrian": 0, "Vehicular": 1 };

    // 🚀 እዚህ ጋር update-segment የሚለውን ስም ተጠቀም
    await api.post(`/Roads/update-segment/${editingRoad.id}`, {
      roadName: tempRoadData.name,
      status: statusMap[tempRoadData.status] ?? 0,
      roadType: typeMap[tempRoadData.roadType] ?? 0
    });

    alert("መንገዱ በስኬት ተስተካክሏል! ✅");
    setShowEditBox(false);
    fetchRoads();
    setSelectedRoad(null);
  } catch (err) {
    console.error("የስህተት ዝርዝር:", err.response?.data);
    alert("ማስተካከያው አልተሳካም!");
  }
};

  const handleDeleteRoad = async (edgeId) => {
    if (!window.confirm("እርግጠኛ ነህ ይህን መንገድ መሰረዝ ትፈልጋለህ?")) return;
    try {
      await api.delete(`/Roads/segment/${edgeId}`); 
      alert("መንገዱ ተሰርዟል!"); fetchRoads();
      setSelectedRoad(null);
    } catch (err) { alert("መሰረዝ አልተቻለም።"); }
  };

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        if (!isDrawing || !selectedCampusId) return;
        let { lat, lng } = e.latlng;
        const allPoints = [...existingRoads, ...roadNodes];
        const closest = allPoints.find(p => getDist([lat, lng], [p.latitude, p.longitude]) < 4);
        if (closest) { lat = closest.latitude; lng = closest.longitude; }
        setRoadNodes(prev => [...prev, { id: Date.now(), latitude: lat, longitude: lng }]);
        setRedoStack([]); 
      }
    });
    return null;
  };

  const handleFinalSave = async () => {
    if (!selectedCampusId || roadNodes.length < 2) return alert("ቢያንስ 2 ነጥቦችን ያያይዙ!");
    try {
      const statusMap = { "Active": 0, "Closed": 1, "Construction": 2, "Damaged": 3 };
      const typeMap = { "Pedestrian": 0, "Vehicular": 1 };
      
      const roadData = {
        campusId: parseInt(selectedCampusId), roadName: tempRoadData.name || "Main Road",
        status: statusMap[tempRoadData.status] ?? 0,
        roadType: typeMap[tempRoadData.roadType] ?? 0,
        nodes: roadNodes.map(n => ({ latitude: n.latitude, longitude: n.longitude }))
      };
      await api.post('/Roads/save-network', { ...roadData, networkDto: roadData });
      setRoadNodes([]); setShowInputBox(false); fetchRoads(); alert("መንገዱ ተመዝግቧል! 🚀");
    } catch (err) { alert("መመዝገብ አልተቻለም።"); }
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden font-sans italic font-bold">
      
      <div className="w-64 bg-[#001C47] text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10"><h1 className="text-sm font-bold uppercase tracking-widest">Mau Admin</h1></div>
        <nav className="flex-1 p-4 space-y-1">
          <div onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/10 text-gray-400 transition-all"><LayoutDashboard size={18}/> <span className="text-xs">Dashboard</span></div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white shadow-lg"><MapIcon size={18}/> <span className="text-xs">Road Designer</span></div>
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden leading-none">
        
        <header className="bg-[#001C47] text-white h-20 flex items-center justify-between px-10 shadow-2xl z-20">
          <h2 className="text-xl font-black italic">Campus Road Control Dashboard</h2>
          <select className="bg-white/10 border-2 border-white/20 rounded-xl px-4 py-2 text-xs outline-none" value={selectedCampusId} onChange={e => setSelectedCampusId(e.target.value)}>
            <option value="" className="text-black">-- Select Campus --</option>
            {campuses.map(c => <option key={c.id} value={c.id} className="text-black">{c.name.toUpperCase()}</option>)}
          </select>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          <div className="flex gap-8 h-[550px]">
            <div className="flex-1 bg-white rounded-[40px] shadow-2xl border-8 border-white overflow-hidden relative flex flex-col">
              <div className="p-3 border-b flex items-center justify-between bg-slate-50">
                <div className="flex gap-2">
                  <ToolBtn icon={<MousePointer2 size={18}/>} label="Select" active={!isDrawing} onClick={() => setIsDrawing(false)}/>
                  <ToolBtn icon={<Edit3 size={18}/>} label="Draw Road" active={isDrawing} onClick={() => setIsDrawing(true)}/>
                  <div className="w-[2px] bg-slate-200 mx-2 h-8"></div>
                  <button onClick={handleUndo} className={`p-2 transition-all ${roadNodes.length > 0 ? 'text-blue-600' : 'text-slate-300'}`}><Undo2 size={20}/></button>
                  <button onClick={handleRedo} className={`p-2 transition-all ${redoStack.length > 0 ? 'text-blue-600' : 'text-slate-300'}`}><Redo2 size={20}/></button>
                </div>
                <button onClick={() => { if(roadNodes.length >= 2) setShowInputBox(true); else alert("መጀመሪያ መንገድ ይሳሉ!"); }} className="bg-[#00204E] text-white px-8 py-2.5 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-blue-600 transition-all">Save Changes</button>
              </div>
              
              <div className="flex-1 relative">
                <MapContainer center={[10.985, 39.263]} zoom={17} className="h-full w-full">
                  <TileLayer url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} />
                  <MapEvents />
                  {selectedCampusId && <AutoFocusMap coords={[campuses.find(c => c.id == selectedCampusId)?.latitude, campuses.find(c => c.id == selectedCampusId)?.longitude]} />}
                  
                  {existingRoads.map((node) => node.edges?.map((edge, idx) => {
                      const target = existingRoads.find(n => n.id === edge.endNodeId);
                      if (!target) return null;
                      return <Polyline key={`${edge.id}-${idx}`} positions={[[node.latitude, node.longitude], [target.latitude, target.longitude]]} color={selectedRoad?.id === edge.id ? '#3b82f6' : handleStatusColor(edge.status)} weight={selectedRoad?.id === edge.id ? 10 : 6} opacity={0.8} eventHandlers={{ click: () => setSelectedRoad(edge) }} />;
                  }))}

                  {roadNodes.length > 0 && (
                    <Polyline positions={roadNodes.map(n => [n.latitude, n.longitude])} color="#3b82f6" weight={5} dashArray="10, 10" />
                  )}
                </MapContainer>
              </div>
            </div>

            {/* 🚀 [ኦሬንጅ ክበብ - መፍትሄ] Road Details በሚያምር ዲዛይን */}
            <div className="w-96 bg-white rounded-[40px] shadow-2xl p-8 flex flex-col overflow-hidden">
               <h3 className="font-black uppercase text-sm border-b pb-4 mb-6 italic tracking-widest text-[#001C47]">Road Details</h3>
               {selectedRoad ? (
                 <div className="space-y-6">
                    <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                        <DetailRow label="Road Name" value={selectedRoad.roadName || 'Unnamed Road'} />
                        <DetailRow label="Road Type" value={typeof selectedRoad.roadType === 'number' ? ["Pedestrian", "Vehicular"][selectedRoad.roadType] : "Pedestrian"} />
                        <DetailRow label="Road Status" value={typeof selectedRoad.status === 'number' ? ["Active", "Closed", "Construction", "Damaged"][selectedRoad.status] : selectedRoad.status} color={handleStatusColor(selectedRoad.status)} />
                        <DetailRow label="Road Length" value={`${selectedRoad.distance?.toFixed(2)} M`} />
                    </div>
                    
                    <div className="flex flex-col gap-3 pt-4">
                        <button onClick={() => handleEditClick(selectedRoad)} className="w-full bg-[#001C47] text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"><Edit3 size={16}/> Edit Road Info</button>
                        <button onClick={() => handleDeleteRoad(selectedRoad.id)} className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-black text-xs uppercase border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-2"><Trash size={16}/> Delete Road</button>
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

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { label: 'Total Roads', value: stats.total, color: 'border-slate-200', icon: <Route className="text-slate-400"/> },
              { label: 'Active Roads', value: stats.active, color: 'border-green-500', icon: <CheckCircle2 className="text-green-500"/> },
              { label: 'Construction', value: stats.construction, color: 'border-amber-400', icon: <Settings className="text-amber-400"/> },
              { label: 'Closed Roads', value: stats.closed, color: 'border-red-500', icon: <XCircle className="text-red-500"/> },
              { label: 'Intersections', value: stats.intersections, color: 'border-blue-500', icon: <Link2 className="text-blue-500"/> }
            ].map((stat, i) => (
              <div key={i} className={`bg-white p-6 rounded-[35px] border-b-[8px] ${stat.color} shadow-xl flex items-center gap-6 transition-transform hover:-translate-y-1`}>
                <div className="bg-slate-50 p-4 rounded-2xl shadow-inner">{stat.icon}</div>
                <div><p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">{stat.label}</p><p className="text-2xl font-black text-[#00204E]">{stat.value}</p></div>
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

          {showInputBox && (
            <div className="fixed inset-0 bg-[#00204E]/60 backdrop-blur-md z-[3000] flex items-center justify-center p-6 italic font-bold">
              <div className="bg-white w-full max-w-sm rounded-[50px] shadow-2xl p-12 relative border-t-[16px] border-ma-gold">
                <h3 className="text-2xl font-black text-[#001C47] uppercase mb-8 underline decoration-ma-gold decoration-4 underline-offset-8">Road Metadata</h3>
                <div className="space-y-6">
                  <input type="text" className="w-full bg-slate-50 p-5 rounded-3xl outline-none italic" placeholder="Road Name" value={tempRoadData.name} onChange={e => setTempRoadData({...tempRoadData, name: e.target.value})}/>
                  <select className="w-full bg-slate-50 p-5 rounded-3xl outline-none italic" value={tempRoadData.status} onChange={e => setTempRoadData({...tempRoadData, status: e.target.value})}>
                    <option value="Active">Active</option><option value="Closed">Closed</option><option value="Construction">Construction</option>
                  </select>
                  <select className="w-full bg-slate-50 p-5 rounded-3xl outline-none italic" value={tempRoadData.roadType} onChange={e => setTempRoadData({...tempRoadData, roadType: e.target.value})}>
                    <option value="Pedestrian">Pedestrian</option><option value="Vehicular">Vehicular</option>
                  </select>
                  <button onClick={handleFinalSave} className="w-full bg-[#00204E] text-white py-6 rounded-[35px] font-black uppercase shadow-2xl flex items-center justify-center gap-4"><CheckCircle2 size={24}/> Confirm and Push</button>
                  <button onClick={() => setShowInputBox(false)} className="w-full text-slate-400 text-xs font-black uppercase mt-2">Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[40px] shadow-2xl border overflow-hidden mb-10">
             <div className="p-8 border-b bg-gray-50/30 flex justify-between items-center italic font-bold">
               <h3 className="font-black uppercase text-sm underline decoration-ma-gold decoration-4 underline-offset-8">Roads List</h3>
               <button onClick={() => { setRoadNodes([]); setIsDrawing(true); }} className="bg-[#22c55e] text-white px-10 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-3"><Plus size={20}/> Add Road</button>
             </div>
            <table className="w-full text-left font-black uppercase italic">
              <thead className="bg-gray-50/50 text-gray-400 text-[9px] border-b">
                <tr><th className="p-8">ID</th><th className="p-8">Road Name</th><th className="p-8">Status</th><th className="p-8">Length (m)</th><th className="p-8 text-center">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-[#00204E]">
                {uniqueRoadsList.map((e, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/10 transition group text-xs">
                    <td className="p-8 text-slate-300">R-{e.id}</td>
                    <td className="p-8">{e.roadName || 'Unnamed Road'}</td>
                    <td className="p-8"><span className="flex items-center gap-2" style={{ color: handleStatusColor(e.status) }}><div className="w-2 h-2 rounded-full shadow-sm animate-pulse" style={{ background: handleStatusColor(e.status) }}></div>{typeof e.status === 'number' ? ["Active", "Closed", "Construction", "Damaged"][e.status] : e.status}</span></td>
                    <td className="p-8 font-mono">{e.distance?.toFixed(2)}</td>
                    <td className="p-8 text-center flex justify-center gap-4">
                       <ActionBtn icon={<Edit3 size={14}/>} color="text-yellow-600" bg="bg-yellow-50" onClick={() => handleEditClick(e)} />
                       <ActionBtn icon={<Trash2 size={14}/>} color="text-red-500" bg="bg-red-50" onClick={() => handleDeleteRoad(e.id)} />
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🚀 [ኦሬንጅ ክበብ - መፍትሄ] የ Road Details መረጃ መደዳ
const DetailRow = ({ label, value, color }) => (
    <div className="flex justify-between items-center border-b border-white/50 pb-2">
        <p className="text-[10px] text-slate-400 uppercase font-black">{label}:</p>
        <p className="text-xs font-black text-[#001C47]" style={{ color: color || 'inherit' }}>{value}</p>
    </div>
);

const ToolBtn = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all uppercase italic ${active ? 'bg-white text-ma-blue shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}>{icon} {label}</button>
);

const ActionBtn = ({ icon, color, bg, onClick }) => (
  <button onClick={onClick} className={`p-3 ${color} ${bg} rounded-2xl shadow-sm hover:scale-110 transition-all`}>{icon}</button>
);

export default RoadDesigner;