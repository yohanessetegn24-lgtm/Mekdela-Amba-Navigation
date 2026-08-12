import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar 
} from 'recharts';
import { MapContainer, TileLayer, useMapEvents, CircleMarker, Polyline, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  LayoutDashboard, Map, Building2, Users, MessageSquare, 
  LogOut, Plus, Search, Trash2, Edit, X, Briefcase, ChevronRight, Save, Route, MousePointer2, Activity, TrendingUp, Flag, Eye
} from 'lucide-react';

// --- 🚀 የካርታ ረዳት ክፍሎች ---
function AutoFocusMap({ coords }) {
  const map = useMap();
  useEffect(() => { 
    if (coords && coords[0] !== 0 && coords[0] !== undefined) {
      map.setView(coords, 18, { animate: true }); 
    }
  }, [coords, map]);
  return null;
}

// --- 🛰️ የሳተላይት መንገድ መሳያ ረዳት ---
function SatelliteRoadBuilder({ nodes, onNodeAdd }) {
  useMapEvents({
    click(e) {
      onNodeAdd({
        id: Date.now(),
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      });
    },
  });

  return (
    <>
      {nodes.map((node, i) => (
        <React.Fragment key={node.id}>
          <CircleMarker 
            center={[node.latitude, node.longitude]} 
            radius={6} 
            pathOptions={{ color: '#C4A006', fillColor: '#C4A006', fillOpacity: 1 }} 
          />
          {i > 0 && (
            <Polyline 
              positions={[
                [nodes[i-1].latitude, nodes[i-1].longitude], 
                [node.latitude, node.longitude]
              ]} 
              color="white" 
              weight={4}
              dashArray="5, 10"
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data States
  const [campuses, setCampuses] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [offices, setOffices] = useState([]);
  const [pois, setPois] = useState([]);
  const [roadNodes, setRoadNodes] = useState([]); 
  const [existingRoads, setExistingRoads] = useState([]); // 🚀 አዲስ: የተቀመጡ መንገዶችን ለማየት
  
  // Selection States
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  
  // Modal & Edit States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('campus');
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  const API_URL = "http://localhost:5030/api";

  const usageData = [
    { name: 'Mon', visits: 400 }, { name: 'Tue', visits: 700 }, { name: 'Wed', visits: 550 },
    { name: 'Thu', visits: 900 }, { name: 'Fri', visits: 1100 }, { name: 'Sat', visits: 300 }, { name: 'Sun', visits: 200 }
  ];

  // 1. መረጃዎችን ማምጣት
  const fetchData = async () => {
    try {
      const [cRes, bRes] = await Promise.all([
        axios.get(`${API_URL}/Campuses`),
        axios.get(`${API_URL}/Buildings`)
      ]);
      setCampuses(cRes.data);
      setBuildings(bRes.data);
    } catch (err) { console.error("Error", err); }
  };

  useEffect(() => { fetchData(); }, []);

  // ቢሮዎችን ማምጣት
  useEffect(() => {
    if (selectedBuildingId) {
      axios.get(`${API_URL}/Offices/building/${selectedBuildingId}`).then(res => setOffices(res.data));
    }
  }, [selectedBuildingId]);

  // 🚀 አዲስ: ካምፓስ ሲመረጥ የተቀመጡ መንገዶችን ከዳታቤዝ አምጣ
  const fetchExistingRoads = async () => {
    if (!selectedCampusId) return;
    try {
      const res = await axios.get(`${API_URL}/Roads/network/${selectedCampusId}`);
      setExistingRoads(res.data);
    } catch (err) { setExistingRoads([]); }
  };

  useEffect(() => {
    if (selectedCampusId && activeTab === 'roads') {
      fetchExistingRoads();
    }
  }, [selectedCampusId, activeTab]);

  // CRUD ድርጊቶች
  const handleEditClick = (type, item) => {
    setModalType(type.toLowerCase());
    setIsEditMode(true);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = async (type, id) => {
    if (window.confirm(`እርግጠኛ ነህ ማጥፋት ትፈልጋለህ?`)) {
      await axios.delete(`${API_URL}/${type}s/${id}`);
      fetchData();
      if (type === 'Building') setSelectedBuildingId("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = modalType === 'campus' ? 'Campuses' : modalType === 'building' ? 'Buildings' : 'Offices';
    try {
      if (isEditMode) await axios.put(`${API_URL}/${endpoint}/${formData.id}`, formData);
      else await axios.post(`${API_URL}/${endpoint}`, formData);
      setShowModal(false); fetchData(); setFormData({});
    } catch (err) { alert("Error saving data"); }
  };

  const handleSaveRoadNetwork = async () => {
    if (!selectedCampusId || roadNodes.length < 2) return alert("እባክዎ መጀመሪያ መንገድ ይሳሉ!");
    const payload = { campusId: parseInt(selectedCampusId), nodes: roadNodes.map(n => ({ latitude: n.latitude, longitude: n.longitude })) };
    try {
      await axios.post(`${API_URL}/Roads/save-network`, payload);
      alert("የመንገድ መረብ በስኬት ተቀምጧል! 🚀");
      setRoadNodes([]);
      fetchExistingRoads(); // ዝርዝሩን አድስ
    } catch (err) { alert("መላክ አልተቻለም።"); }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-900 italic font-bold leading-none">
      
      {/* 🟢 SIDEBAR (Toronto Style) */}
      <aside className="w-80 bg-ma-blue text-white p-8 flex flex-col z-50 shadow-2xl leading-none">
        <div className="flex items-center gap-4 mb-12 border-b border-blue-900/50 pb-8 leading-none">
          <div className="bg-ma-gold p-3 rounded-2xl text-ma-blue shadow-lg leading-none"><LayoutDashboard size={28}/></div>
          <div><h1 className="font-black text-xl tracking-tighter italic leading-none">MAU ADMIN</h1><p className="text-[10px] text-ma-gold font-bold mt-1 uppercase tracking-widest leading-none">Command Center</p></div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 leading-none">
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'campuses', label: 'Manage Campuses', icon: Map },
            { id: 'buildings', label: 'Manage Buildings', icon: Building2 },
            { id: 'offices', label: 'Office Hierarchy', icon: Briefcase },
            { id: 'roads', label: 'Road Designer', icon: Route },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-5 rounded-[22px] transition-all duration-300 ${activeTab === item.id ? 'bg-ma-gold text-ma-blue font-black shadow-xl translate-x-3' : 'hover:bg-blue-900/50 text-blue-200'}`}
            >
              <item.icon size={22} /> {item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => navigate('/login')} className="flex items-center gap-4 p-5 text-red-300 border-t border-blue-900 mt-4 pt-8 leading-none italic"><LogOut size={22} /> Sign Out</button>
      </aside>

      {/* 🔵 MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-12 leading-none font-black">
        <header className="flex justify-between items-center mb-12 leading-none font-black">
          <h2 className="text-4xl font-black text-ma-blue capitalize tracking-tight italic underline decoration-ma-gold decoration-4 underline-offset-8 leading-none">{activeTab.replace('-', ' ')} Panel</h2>
          <div className="w-12 h-12 bg-ma-blue rounded-xl border-2 border-ma-gold flex items-center justify-center text-ma-gold font-black shadow-inner text-xl uppercase">A</div>
        </header>

        {/* 1. 📊 OVERVIEW TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700 leading-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-ma-blue leading-none">
              <div className="bg-white p-8 rounded-[35px] border-b-8 border-b-blue-500 shadow-sm leading-none"><Map className="text-blue-500 mb-2" size={32}/><p className="text-gray-400 text-[10px] uppercase font-black tracking-widest leading-none">Campuses</p><p className="text-3xl font-black leading-none">{campuses.length}</p></div>
              <div className="bg-white p-8 rounded-[35px] border-b-8 border-b-ma-gold shadow-sm leading-none"><Building2 className="text-ma-gold mb-2" size={32}/><p className="text-gray-400 text-[10px] uppercase font-black tracking-widest leading-none">Buildings</p><p className="text-3xl font-black leading-none">{buildings.length}</p></div>
              <div className="bg-white p-8 rounded-[35px] border-b-8 border-b-purple-500 shadow-sm leading-none"><Users className="text-purple-500 mb-2" size={32}/><p className="text-gray-400 text-[10px] uppercase font-black tracking-widest leading-none">Users</p><p className="text-3xl font-black leading-none">1,420</p></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 leading-none">
              <div className="bg-white p-10 rounded-[50px] shadow-xl h-80 leading-none"><h3 className="text-lg font-black text-ma-blue mb-6 flex items-center gap-2 italic leading-none"><Activity size={18} className="text-ma-gold"/> Weekly Student Traffic</h3><ResponsiveContainer width="100%" height="80%"><LineChart data={usageData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" hide /><Tooltip/><Line type="monotone" dataKey="visits" stroke="#00204E" strokeWidth={4} dot={{r: 4, fill: '#C4A006'}} /></LineChart></ResponsiveContainer></div>
              <div className="bg-white p-10 rounded-[50px] shadow-xl h-80 leading-none font-bold italic text-ma-blue"><h3 className="text-lg font-black text-ma-blue mb-6 flex items-center gap-2 italic leading-none"><Map size={18} className="text-ma-gold"/> Distribution</h3><ResponsiveContainer width="100%" height="80%"><BarChart data={campuses.map(c => ({ name: c.name.split(' ')[0], count: buildings.filter(b => b.campusId === c.id).length }))}><XAxis dataKey="name" hide /><Tooltip/><Bar dataKey="count" fill="#00204E" radius={[10, 10, 0, 0]} /></BarChart></ResponsiveContainer></div>
            </div>
          </div>
        )}

        {/* 2. 🏛️ CAMPUSES TAB */}
        {activeTab === 'campuses' && (
          <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-6 italic font-bold">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30 text-ma-blue font-black leading-none">
               <h3 className="text-xl tracking-tighter">Registered Campuses</h3>
               <button onClick={() => {setModalType('campus'); setIsEditMode(false); setFormData({}); setShowModal(true);}} className="bg-ma-blue text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-900 transition shadow-lg italic leading-none text-white"><Plus size={20}/> New Campus</button>
            </div>
            <table className="w-full text-left leading-none">
              <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest text-ma-blue leading-none italic">
                <tr><th className="p-8">ID</th><th className="p-8 text-ma-blue">Campus Name</th><th className="p-8 text-center text-ma-blue">GPS Location</th><th className="p-8 text-center text-ma-blue">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-bold text-ma-blue leading-none">
                {campuses.map(c => (
                  <tr key={c.id} className="hover:bg-blue-50/20 transition group leading-none">
                    <td className="p-8 text-ma-gold font-black italic leading-none">#{c.id}</td>
                    <td className="p-8 font-black flex items-center gap-4 italic font-black text-ma-blue leading-none">{c.name}</td>
                    <td className="p-8 font-mono text-xs text-blue-600 text-center italic leading-none">{c.latitude}, {c.longitude}</td>
                    <td className="p-8 text-center flex justify-center gap-4 leading-none">
                      <button onClick={() => handleEditClick('Campus', c)} className="p-3 text-blue-600 bg-blue-50 rounded-2xl transition hover:bg-blue-600 hover:text-white leading-none"><Edit size={18}/></button>
                      <button onClick={() => handleDelete('Campus', c.id)} className="p-3 text-red-500 bg-red-50 rounded-2xl transition hover:bg-red-500 hover:text-white leading-none"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. 🏢 BUILDINGS TAB */}
        {activeTab === 'buildings' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700 italic font-bold leading-none">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 text-ma-blue leading-none"><label className="text-[10px] font-black text-ma-gold uppercase mb-4 block tracking-widest leading-none">Step 1: Choose Campus</label><select className="w-full p-4 bg-gray-50 rounded-2xl font-black border-none focus:ring-4 focus:ring-ma-gold/20 italic text-ma-blue" value={selectedCampusId} onChange={(e) => setSelectedCampusId(e.target.value)}><option value="">-- Choose Campus --</option>{campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            {selectedCampusId ? (
              <div className="bg-white rounded-[45px] shadow-xl border border-gray-100 overflow-hidden text-ma-blue italic leading-none font-bold">
                <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30 leading-none italic font-black"><h3 className="text-xl font-black uppercase italic leading-none underline decoration-ma-gold decoration-4 underline-offset-8">Buildings in {campuses.find(c => c.id == selectedCampusId)?.name}</h3><button onClick={() => {setModalType('building'); setIsEditMode(false); setFormData({campusId: parseInt(selectedCampusId)}); setShowModal(true);}} className="bg-ma-blue text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-lg leading-none uppercase italic text-white"><Plus size={22}/> New Building</button></div>
                <table className="w-full text-left leading-none"><thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase italic leading-none text-ma-blue"><tr><th className="p-8">ID</th><th className="p-8 text-ma-blue">Building Name</th><th className="p-8 text-ma-blue">Actions</th></tr></thead>
                  <tbody className="divide-y divide-gray-50 font-bold italic leading-none">{buildings.filter(b => b.campusId == selectedCampusId).map(b => (
                    <tr key={b.id} className="hover:bg-blue-50/20 group leading-none"><td className="p-8 text-ma-gold font-black italic leading-none">#{b.id}</td><td className="p-8 font-black flex items-center gap-4 italic leading-none">{b.name}</td><td className="p-8 text-center flex justify-center gap-4 italic leading-none"><button onClick={() => handleEditClick('Building', b)} className="p-3 text-blue-600 bg-blue-50 rounded-2xl transition leading-none italic"><Edit size={18}/></button><button onClick={() => handleDelete('Building', b.id)} className="p-3 text-red-500 bg-red-50 rounded-2xl transition leading-none italic"><Trash2 size={18}/></button></td></tr>
                  ))}</tbody></table></div>
            ) : <div className="h-64 border-4 border-dashed border-slate-200 rounded-[50px] flex flex-col items-center justify-center text-slate-300 font-black italic tracking-widest uppercase opacity-40 leading-none italic font-black">Please select a campus to manage buildings</div>}
          </div>
        )}

        {/* 4. 📂 OFFICE HIERARCHY */}
        {activeTab === 'offices' && (
          <div className="space-y-8 animate-in fade-in duration-500 font-bold text-ma-blue italic leading-none">
            <div className="grid grid-cols-2 gap-8 italic font-bold leading-none">
              <div className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-100 font-bold italic leading-none"><label className="text-[10px] font-black text-ma-gold uppercase mb-4 block italic font-bold leading-none">Step 1: Parent Campus</label><select className="w-full p-4 bg-gray-50 rounded-2xl font-black border-none text-ma-blue font-bold shadow-inner italic font-bold shadow-inner italic" value={selectedCampusId} onChange={(e) => { setSelectedCampusId(e.target.value); setSelectedBuildingId(""); }}><option value="">-- Choose Campus --</option>{campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div className={`bg-white p-8 rounded-[35px] shadow-sm border border-gray-100 ${!selectedCampusId && 'opacity-30'} font-bold italic text-ma-blue leading-none`}><label className="text-[10px] font-black text-ma-gold uppercase mb-4 block italic font-bold text-ma-blue font-bold italic leading-none">Step 2: Parent Building</label><select disabled={!selectedCampusId} className="w-full p-4 bg-gray-50 rounded-2xl font-black border-none text-ma-blue shadow-inner italic font-bold leading-none" value={selectedBuildingId} onChange={(e) => setSelectedBuildingId(e.target.value)}><option value="">-- Choose Building --</option>{buildings.filter(b => b.campusId == selectedCampusId).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
            </div>
            {selectedBuildingId ? (
              <div className="bg-white rounded-[45px] shadow-xl border border-gray-100 overflow-hidden font-bold italic text-ma-blue leading-none"><div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30 font-black italic uppercase underline decoration-ma-gold decoration-4 underline-offset-8 font-black leading-none"><h3>Offices in Building #{selectedBuildingId}</h3><button onClick={() => openModal('office')} className="bg-ma-blue text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-900 shadow-lg leading-none uppercase text-white font-bold leading-none"><Plus size={24}/> Add Office</button></div>
              <table className="w-full text-left font-bold italic leading-none"><thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black italic text-ma-blue leading-none italic"><tr><th className="p-8">ID</th><th className="p-8">Office Details</th><th className="p-8 text-center text-ma-blue italic font-bold leading-none">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-50 leading-none">{offices.map(o => (
                <tr key={o.id} className="hover:bg-blue-50/10 transition group italic font-black text-ma-blue leading-none"><td className="p-8 text-ma-gold font-black italic leading-none">#{o.id}</td><td className="p-8 font-black italic leading-none">{o.name} - Room {o.roomNumber}</td><td className="p-8 text-center flex justify-center gap-4 italic font-bold leading-none"><button onClick={() => handleEditClick('Office', o)} className="p-3 text-blue-600 bg-blue-50 rounded-2xl transition leading-none italic font-black"><Edit size={18}/></button><button onClick={() => handleDelete('office', o.id)} className="p-3 text-red-500 bg-red-50 rounded-2xl transition leading-none italic font-black"><Trash2 size={20}/></button></td></tr>
              ))}</tbody></table></div>
            ) : <div className="h-64 border-4 border-dashed border-slate-200 rounded-[50px] flex items-center justify-center text-slate-300 font-bold uppercase italic opacity-40 leading-none font-black">Complete Hierarchy Selection Above</div>}
          </div>
        )}

        {/* 🚀 5. ROAD DESIGNER TAB */}
        {activeTab === 'roads' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700 italic font-bold text-ma-blue font-black leading-none">
            <div className="bg-white p-8 rounded-[35px] shadow-lg border border-gray-100 flex flex-wrap gap-6 justify-between items-center italic font-bold leading-none">
               <div className="flex items-center gap-5 italic font-black leading-none">
                  <div className="bg-ma-blue text-white p-4 rounded-2xl shadow-lg animate-bounce text-white italic font-black leading-none"><MousePointer2 size={24}/></div>
                  <div><h3 className="font-black text-ma-blue text-xl italic tracking-tighter underline decoration-ma-gold decoration-4 underline-offset-8 leading-none italic font-black">Satellite Designer</h3><p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic font-bold leading-none italic font-black">Trace and view existing walking paths</p></div>
               </div>
               <div className="flex items-center gap-4 italic font-bold leading-none">
                  <select className="p-3 bg-white rounded-xl font-black text-ma-blue border-none focus:ring-2 focus:ring-ma-gold text-sm italic shadow-inner italic font-black leading-none" value={selectedCampusId} onChange={(e) => setSelectedCampusId(e.target.value)}><option value="">-- Choose Campus --</option>{campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                  
                  {/* 🚀 ሪፖርት ማሳያ፡ የዳታቤዝ መንገዶችን ለማየት */}
                  <div className="flex items-center gap-2 bg-ma-gold/10 px-4 py-2 rounded-xl border border-ma-gold/20 leading-none italic font-black">
                     <Eye size={16} className="text-ma-gold" />
                     <span className="text-[10px] text-ma-blue uppercase font-black">Saved: {existingRoads.length} Points</span>
                  </div>

                  <button onClick={() => setRoadNodes([])} className="px-5 py-3 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition text-sm italic font-black leading-none font-black">Reset</button>
                  <button onClick={handleSaveRoadNetwork} className="px-8 py-3 rounded-xl font-black text-white bg-ma-blue shadow-2xl hover:bg-blue-900 transition text-sm text-white font-bold italic uppercase underline decoration-ma-gold shadow-ma-gold/20 font-black leading-none"><Save size={18}/> Save Network</button>
               </div>
            </div>

            <div className={`h-[550px] rounded-[55px] overflow-hidden shadow-2xl border-8 border-white relative transition-all ${!selectedCampusId && 'grayscale opacity-50'} leading-none italic font-black`}>
              <MapContainer center={[10.985, 39.263]} zoom={18} className="h-full w-full z-10 leading-none italic font-black font-sans">
                <TileLayer url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} attribution="&copy; Google Maps" />
                
                {selectedCampusId && campuses.find(c => c.id == selectedCampusId) && <AutoFocusMap coords={[campuses.find(c => c.id == selectedCampusId).latitude, campuses.find(c => c.id == selectedCampusId).longitude]} />}
                
                {/* 🚀 ሪፖርት፡ የተቀመጡ መንገዶችን በካርታው ላይ ማሳያ (አረንጓዴ) */}
                {existingRoads.map((node, idx) => (
                  <React.Fragment key={idx}>
                    <CircleMarker center={[node.latitude, node.longitude]} radius={4} pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.8 }} />
                    {node.edges && node.edges.map((edge, eIdx) => {
                      const target = existingRoads.find(n => n.id === edge.endNodeId);
                      return target && <Polyline key={eIdx} positions={[[node.latitude, node.longitude], [target.latitude, target.longitude]]} color="#22c55e" weight={3} opacity={0.6} />;
                    })}
                  </React.Fragment>
                ))}

                <SatelliteRoadBuilder nodes={roadNodes} onNodeAdd={(node) => setRoadNodes([...roadNodes, node])} />
              </MapContainer>
              <div className="absolute top-4 right-4 z-[1000] bg-white/90 p-4 rounded-2xl shadow-xl border border-slate-200 leading-none italic font-black font-sans">
                  <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-[#C4A006] rounded-full"></div> <span className="text-[10px] uppercase font-black">Current Tracing</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#22c55e] rounded-full"></div> <span className="text-[10px] uppercase font-black">Already Saved</span></div>
              </div>
            </div>
          </div>
        )}

        {/* 🏢 CRUD Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-ma-blue/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 text-ma-blue font-bold italic leading-none font-black">
            <div className="bg-white w-full max-w-xl rounded-[60px] shadow-2xl p-16 relative border-t-[18px] border-ma-gold animate-in zoom-in duration-300 overflow-hidden leading-none font-black italic">
              <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-red-500 transition-colors shadow-2xl italic font-black leading-none"><X size={44}/></button>
              <h3 className="text-3xl font-black mb-10 italic capitalize underline decoration-ma-gold decoration-8 text-ma-blue font-black leading-none">{isEditMode ? 'Edit' : 'Register'} {modalType.toUpperCase()}</h3>
              <form onSubmit={handleSubmit} className="space-y-8 italic font-bold leading-none font-black">
                <input type="text" required className="w-full p-6 bg-gray-100 border-none rounded-[30px] focus:ring-4 focus:ring-ma-gold/20 font-black text-lg shadow-inner text-ma-blue italic font-black leading-none" placeholder={`${modalType} Name`} value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} />
                <button type="submit" className="w-full bg-ma-blue text-white py-8 rounded-[35px] font-black text-xl hover:bg-blue-900 shadow-2xl transition transform active:scale-95 italic tracking-widest text-white uppercase font-black underline decoration-ma-gold decoration-4 leading-none tracking-[4px]">Confirm Data</button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;