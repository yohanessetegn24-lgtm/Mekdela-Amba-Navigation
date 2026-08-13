import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar 
} from 'recharts';
import { MapContainer, TileLayer, useMapEvents, CircleMarker, Polyline, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  LayoutDashboard, Map, Building2, Users, MessageSquare, 
  LogOut, Plus, Search, Trash2, Edit, X, Briefcase, ChevronRight, Save, Route, MousePointer2, Activity, TrendingUp, Flag, Eye, UserCheck
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
  const [systemUsers, setSystemUsers] = useState([]); 
  const [roadNodes, setRoadNodes] = useState([]); 
  const [existingRoads, setExistingRoads] = useState([]); 
  const [pois, setPois] = useState([]); // Added pois state if not already defined to avoid break
  
  // Selection States
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  
  // Modal & Edit States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('campus');
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  // 🚀 የፕሮፋይል ፊደል (Dynamic Initial)
  const userEmail = localStorage.getItem('userName') || "Admin";
  const userInitial = userEmail.charAt(0).toUpperCase();

  const API_URL = "http://localhost:5030/api";

  const usageData = [
    { name: 'Mon', visits: 400 }, { name: 'Tue', visits: 700 }, { name: 'Wed', visits: 550 },
    { name: 'Thu', visits: 900 }, { name: 'Fri', visits: 1100 }, { name: 'Sat', visits: 300 }, { name: 'Sun', visits: 200 }
  ];

  // 1. መረጃዎችን ማምጣት
  const fetchData = async () => {
    try {
      const [cRes, bRes, uRes] = await Promise.all([
        api.get('/Campuses'),
        api.get('/Buildings'),
        api.get('/Users') 
      ]);
      setCampuses(cRes.data);
      setBuildings(bRes.data);
      setSystemUsers(uRes.data);
    } catch (err) { console.error("Error Fetching Data", err); }
  };

  useEffect(() => { fetchData(); }, []);

  // Hierarchy Logic
  useEffect(() => {
    if (selectedBuildingId) {
      api.get(`/Offices/building/${selectedBuildingId}`).then(res => setOffices(res.data));
    } else { setOffices([]); }
  }, [selectedBuildingId]);

  // Load Roads
  const fetchExistingRoads = async () => {
    if (!selectedCampusId) return;
    try {
      const res = await api.get(`/Roads/network/${selectedCampusId}`);
      setExistingRoads(res.data);
    } catch (err) { setExistingRoads([]); }
  };

  useEffect(() => {
    if (selectedCampusId && activeTab === 'roads') fetchExistingRoads();
  }, [selectedCampusId, activeTab]);

  // Modal Handlers
  const openModal = (type, item = null) => {
    setModalType(type.toLowerCase());
    if (item) {
      setIsEditMode(true);
      setFormData(item);
    } else {
      setIsEditMode(false);
      setFormData({ campusId: selectedCampusId, buildingId: selectedBuildingId });
    }
    setShowModal(true);
  };

  const handleEditClick = (type, item) => {
    openModal(type, item);
  };

  const handleDelete = async (type, id) => {
    if (window.confirm(`እርግጠኛ ነህ ይህንን ${type} ማጥፋት ትፈልጋለህ?`)) {
      try {
        const endpoint = type === 'user' ? 'Users' : type === 'office' ? 'Offices' : `${type.charAt(0).toUpperCase() + type.slice(1)}s`;
        await api.delete(`/${endpoint}/${id}`);
        fetchData();
        if (type === 'building') setSelectedBuildingId("");
      } catch (err) { alert("Error deleting item"); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = modalType === 'user' ? 'Users' : modalType === 'campus' ? 'Campuses' : modalType === 'building' ? 'Buildings' : 'Offices';
    
    // 🚀 አድሚን ከ 3 በላይ እንዳይሆን መከልከያ (ለአዲስ አድሚን ብቻ)
    if (modalType === 'user' && !isEditMode && systemUsers.length >= 3) {
      alert("ተሳስተዋል! ቢበዛ 3 አድሚኖችን ብቻ ነው መመዝገብ የሚቻለው።");
      return;
    }

    try {
      if (isEditMode) await api.put(`/${endpoint}/${formData.id}`, formData);
      else await api.post(`/${endpoint}`, formData);
      setShowModal(false); fetchData(); setFormData({});
      if (selectedBuildingId && modalType === 'office') api.get(`/Offices/building/${selectedBuildingId}`).then(res => setOffices(res.data));
    } catch (err) { alert("Error saving data"); }
  };

  const handleSaveRoadNetwork = async () => {
    if (!selectedCampusId || roadNodes.length < 2) return alert("እባክዎ መጀመሪያ ካምፓስ መርጠው መንገድ ይሳሉ!");
    const payload = { campusId: parseInt(selectedCampusId), nodes: roadNodes.map(n => ({ latitude: n.latitude, longitude: n.longitude })) };
    try {
      await api.post('/Roads/save-network', payload);
      alert("የመንገድ መረብ በስኬት ተቀምጧል! 🚀");
      setRoadNodes([]);
      fetchExistingRoads();
    } catch (err) { alert("መላክ አልተቻለም።"); }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-900 italic font-bold leading-none">
      
      {/* 🟢 SIDEBAR */}
      <aside className="w-80 bg-ma-blue text-white p-8 flex flex-col z-50 shadow-2xl leading-none">
        <div className="flex items-center gap-4 mb-12 border-b border-blue-900/50 pb-8 leading-none text-ma-gold">
          <div className="bg-ma-gold p-3 rounded-2xl text-ma-blue shadow-lg leading-none"><LayoutDashboard size={28}/></div>
          <div><h1 className="font-black text-xl tracking-tighter italic leading-none">MAU ADMIN</h1><p className="text-[10px] text-ma-gold font-bold mt-1 uppercase tracking-widest leading-none">Command Center</p></div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 leading-none">
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'campuses', label: 'Manage Campuses', icon: Map },
            { id: 'buildings', label: 'Manage Buildings', icon: Building2 },
            { id: 'offices', label: 'Office Hierarchy', icon: Briefcase },
            { id: 'users', label: 'Manage Admins', icon: UserCheck }, 
            { id: 'roads', label: 'Road Designer', icon: Route },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-5 rounded-[22px] transition-all duration-300 ${activeTab === item.id ? 'bg-ma-gold text-ma-blue font-black shadow-xl translate-x-3' : 'hover:bg-blue-900/50 text-blue-200'}`}
            >
              <item.icon size={22} /> {item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => {localStorage.clear(); navigate('/login');}} className="flex items-center gap-4 p-5 text-red-300 border-t border-blue-900 mt-4 pt-8 leading-none"><LogOut size={22} /> Sign Out</button>
      </aside>

      {/* 🔵 MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-12">
        <header className="flex justify-between items-center mb-12 leading-none">
          <h2 className="text-4xl font-black text-ma-blue capitalize tracking-tight italic underline decoration-ma-gold decoration-4 underline-offset-8 leading-none italic">{activeTab.replace('-', ' ')} Panel</h2>
          
          <div 
            onClick={() => setActiveTab('users')}
            className="w-14 h-14 bg-ma-blue rounded-2xl border-4 border-ma-gold flex items-center justify-center text-ma-gold font-black shadow-2xl cursor-pointer hover:scale-110 transition-transform text-2xl uppercase"
          >
            {userInitial}
          </div>
        </header>

        {/* 1. OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-700 leading-none">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-ma-blue font-black">
              <div className="bg-white p-8 rounded-[35px] border-b-8 border-b-blue-500 shadow-xl leading-none"><Map className="text-blue-500 mb-2" size={32}/><p className="text-gray-400 text-[10px] uppercase font-black">Campuses</p><p className="text-3xl font-black">{campuses.length}</p></div>
              <div className="bg-white p-8 rounded-[35px] border-b-8 border-b-ma-gold shadow-xl leading-none"><Building2 className="text-ma-gold mb-2" size={32}/><p className="text-gray-400 text-[10px] uppercase font-black">Buildings</p><p className="text-3xl font-black">{buildings.length}</p></div>
              <div className="bg-white p-8 rounded-[35px] border-b-8 border-b-green-500 shadow-xl leading-none"><UserCheck className="text-green-500 mb-2" size={32}/><p className="text-gray-400 text-[10px] uppercase font-black">System Admins</p><p className="text-3xl font-black">{systemUsers.length}</p></div>
              <div className="bg-white p-8 rounded-[35px] border-b-8 border-b-purple-500 shadow-xl leading-none"><Users className="text-purple-500 mb-2" size={32}/><p className="text-gray-400 text-[10px] uppercase font-black">Active Users</p><p className="text-3xl font-black">1,420</p></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 leading-none">
              <div className="bg-white p-10 rounded-[50px] shadow-2xl h-80 italic font-bold">
                <h3 className="text-lg font-black text-ma-blue mb-6 flex items-center gap-2 italic leading-none font-black"><Activity size={18} className="text-ma-gold"/> Weekly Student Traffic</h3>
                <ResponsiveContainer width="100%" height="80%"><LineChart data={usageData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" hide /><Tooltip/><Line type="monotone" dataKey="visits" stroke="#00204E" strokeWidth={4} dot={{r: 4, fill: '#C4A006'}} /></LineChart></ResponsiveContainer>
              </div>
              <div className="bg-white p-10 rounded-[50px] shadow-2xl h-80">
                <h3 className="text-lg font-black text-ma-blue mb-6 flex items-center gap-2 italic font-black leading-none"><Map size={18} className="text-ma-gold"/> Campus Infrastructure</h3>
                <ResponsiveContainer width="100%" height="80%"><BarChart data={campuses.map(c => ({ name: c.name.split(' ')[0], count: buildings.filter(b => b.campusId === c.id).length }))}><XAxis dataKey="name" hide /><Tooltip/><Bar dataKey="count" fill="#00204E" radius={[10, 10, 0, 0]} /></BarChart></ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* 2. CAMPUSES CRUD */}
        {activeTab === 'campuses' && (
          <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-6 italic font-bold leading-none">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30 text-ma-blue font-black uppercase">
               <h3>Registered Campuses</h3>
               <button onClick={() => openModal('campus')} className="bg-ma-blue text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-900 transition shadow-lg italic leading-none text-white"><Plus size={20}/> New Campus</button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest text-ma-blue italic">
                <tr><th className="p-8 text-ma-blue">ID</th><th className="p-8 text-ma-blue">Campus Name</th><th className="p-8 text-center text-ma-blue">GPS Location</th><th className="p-8 text-center text-ma-blue">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-ma-blue font-bold italic leading-none">
                {campuses.map(c => (
                  <tr key={c.id} className="hover:bg-blue-50/20 transition group leading-none">
                    <td className="p-8 text-ma-gold">#{c.id}</td>
                    <td className="p-8 italic leading-none italic">{c.name}</td>
                    <td className="p-8 font-mono text-xs text-blue-600 text-center uppercase">{c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}</td>
                    <td className="p-8 text-center flex justify-center gap-4 italic font-bold">
                      <button onClick={() => handleEditClick('campus', c)} className="p-3 text-blue-600 bg-blue-50 rounded-2xl hover:bg-blue-600 transition leading-none italic font-black"><Edit size={18}/></button>
                      <button onClick={() => handleDelete('campus', c.id)} className="p-3 text-red-500 bg-red-50 rounded-2xl hover:bg-red-500 transition leading-none italic font-black"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. BUILDINGS CRUD */}
        {activeTab === 'buildings' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700 italic font-bold leading-none">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 text-ma-blue font-black uppercase"><label className="text-[10px] font-black text-ma-gold uppercase mb-4 block tracking-widest leading-none italic font-black">Step 1: Choose Campus</label><select className="w-full p-4 bg-gray-50 rounded-2xl font-black border-none focus:ring-4 focus:ring-ma-gold/20 italic text-ma-blue shadow-inner font-black uppercase tracking-widest" value={selectedCampusId} onChange={(e) => setSelectedCampusId(e.target.value)}><option value="">-- Choose Campus --</option>{campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            {selectedCampusId && (
              <div className="bg-white rounded-[45px] shadow-xl border border-gray-100 overflow-hidden text-ma-blue italic leading-none font-bold">
                <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                  <h3 className="text-xl font-black uppercase italic leading-none underline decoration-ma-gold decoration-4 underline-offset-8">Buildings List</h3>
                  <button onClick={() => openModal('building')} className="bg-ma-blue text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-900 transition shadow-lg leading-none uppercase text-white italic font-black"><Plus size={22}/> New Building</button>
                </div>
                <table className="w-full text-left italic font-bold">
                  <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black text-ma-blue italic"><tr><th className="p-8">ID</th><th className="p-8">Building Name</th><th className="p-8 text-center text-ma-blue font-bold italic">Actions</th></tr></thead>
                  <tbody className="divide-y divide-gray-50 italic">{buildings.filter(b => b.campusId == selectedCampusId).map(b => (
                    <tr key={b.id} className="hover:bg-blue-50/20 group italic font-black text-ma-blue leading-none"><td className="p-8 text-ma-gold italic leading-none font-black uppercase">#{b.id}</td><td className="p-8 italic leading-none font-black uppercase">{b.name}</td><td className="p-8 text-center flex justify-center gap-4 italic font-bold text-ma-blue leading-none"><button onClick={() => handleEditClick('building', b)} className="p-3 text-blue-600 bg-blue-50 rounded-2xl transition leading-none italic font-black"><Edit size={18}/></button><button onClick={() => handleDelete('building', b.id)} className="p-3 text-red-500 bg-red-50 rounded-2xl transition leading-none italic font-black"><Trash2 size={18}/></button></td></tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. OFFICE HIERARCHY */}
        {activeTab === 'offices' && (
          <div className="space-y-8 animate-in fade-in duration-500 font-bold text-ma-blue italic leading-none italic font-black">
            <div className="grid grid-cols-2 gap-8 italic font-bold leading-none font-black uppercase">
              <div className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-100 font-bold italic leading-none italic font-black leading-none uppercase"><label className="text-[10px] font-black text-ma-gold uppercase mb-4 block italic font-bold text-ma-blue font-black uppercase leading-none">Step 1: Select Campus</label><select className="w-full p-4 bg-gray-50 rounded-2xl font-black border-none text-ma-blue font-bold shadow-inner italic font-bold" value={selectedCampusId} onChange={(e) => { setSelectedCampusId(e.target.value); setSelectedBuildingId(""); }}><option value="">-- Choose Campus --</option>{campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div className={`bg-white p-8 rounded-[35px] shadow-sm border border-gray-100 ${!selectedCampusId && 'opacity-30'} font-bold italic text-ma-blue leading-none italic font-black uppercase leading-none`}><label className="text-[10px] font-black text-ma-gold uppercase mb-4 block italic font-bold text-ma-blue font-bold italic leading-none">Step 2: Select Building</label><select disabled={!selectedCampusId} className="w-full p-4 bg-gray-50 rounded-2xl font-black border-none text-ma-blue shadow-inner italic font-bold" value={selectedBuildingId} onChange={(e) => setSelectedBuildingId(e.target.value)}><option value="">-- Choose Building --</option>{buildings.filter(b => b.campusId == selectedCampusId).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
            </div>
            {selectedBuildingId && (
              <div className="bg-white rounded-[45px] shadow-xl border border-gray-100 overflow-hidden font-bold italic text-ma-blue leading-none italic font-black uppercase leading-none font-black italic"><div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30 font-black italic uppercase leading-none underline decoration-ma-gold decoration-4 underline-offset-8"><h3>Offices Management</h3><button onClick={() => openModal('office')} className="bg-ma-blue text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-900 shadow-lg leading-none uppercase text-white font-bold italic font-black leading-none"><Plus size={24}/> Add Office</button></div>
              <table className="w-full text-left font-bold italic leading-none font-black italic"><thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black italic text-ma-blue leading-none italic italic"><tr><th className="p-8 text-ma-blue">ID</th><th className="p-8 text-ma-blue">Office Details</th><th className="p-8 text-center text-ma-blue italic font-bold leading-none italic">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-50 text-ma-blue font-bold italic">{offices.map(o => (
                <tr key={o.id} className="hover:bg-blue-50/10 transition group italic font-black text-ma-blue leading-none"><td className="p-8 text-ma-gold font-black italic leading-none italic font-black leading-none">#{o.id}</td><td className="p-8 font-black italic leading-none italic text-ma-blue leading-none">{o.name} - Room {o.roomNumber}</td><td className="p-8 text-center flex justify-center gap-4 italic font-bold text-ma-blue leading-none italic font-black"><button onClick={() => handleEditClick('office', o)} className="p-3 text-blue-600 bg-blue-50 rounded-2xl transition leading-none italic font-black leading-none italic"><Edit size={18}/></button><button onClick={() => handleDelete('office', o.id)} className="p-3 text-red-500 bg-red-50 rounded-2xl transition leading-none italic font-black leading-none italic"><Trash2 size={20}/></button></td></tr>
              ))}</tbody></table></div>
            )}
          </div>
        )}

        {/* 6. 🚀 ADMIN MANAGEMENT (SYSTEM USERS) */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-6 italic font-bold text-ma-blue leading-none font-black uppercase">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30 text-ma-blue font-black italic underline decoration-ma-gold decoration-4 underline-offset-8">
               <h3>Authorized Administrators ({systemUsers.length}/3)</h3>
               <button 
                onClick={() => openModal('user')} 
                disabled={systemUsers.length >= 3}
                className={`px-8 py-3 rounded-xl font-bold transition shadow-lg italic leading-none text-white font-black uppercase flex items-center gap-2 ${systemUsers.length >= 3 ? 'bg-gray-400 cursor-not-allowed' : 'bg-ma-blue hover:bg-blue-900'}`}
               >
                 <Plus size={20}/> Add Admin
               </button>
            </div>
            <table className="w-full text-left italic font-bold leading-none font-black uppercase">
              <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black text-ma-blue italic leading-none">
                <tr>
                  <th className="p-8">ID</th>
                  <th className="p-8">Initial</th>
                  <th className="p-8">Full Name</th>
                  <th className="p-8">Email Address</th>
                  <th className="p-8 text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-ma-blue font-bold italic font-black uppercase tracking-widest">
                {systemUsers.map(u => (
                  <tr key={u.id} className="hover:bg-blue-50/10 group leading-none italic font-bold font-black">
                    <td className="p-8 text-ma-gold italic leading-none font-black uppercase leading-none">#{u.id}</td>
                    <td className="p-8 font-black italic leading-none italic font-bold leading-none italic uppercase"><div className="w-12 h-12 bg-ma-blue rounded-2xl flex items-center justify-center text-ma-gold font-black shadow-xl italic font-black uppercase">{u.fullName?.charAt(0) || "U"}</div></td>
                    <td className="p-8 font-black italic leading-none italic font-bold uppercase leading-none">{u.fullName}</td>
                    <td className="p-8 lowercase font-medium text-blue-600">{u.email}</td>
                    <td className="p-8 text-center flex justify-center gap-4 italic font-bold leading-none font-black leading-none uppercase">
                      <button onClick={() => handleEditClick('user', u)} className="p-3 text-blue-600 bg-blue-50 rounded-2xl hover:bg-blue-600 hover:text-white transition shadow-sm"><Edit size={20}/></button>
                      <button onClick={() => handleDelete('user', u.id)} className="p-3 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition shadow-sm"><Trash2 size={20}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 7. ROAD DESIGNER */}
        {activeTab === 'roads' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700 italic font-bold text-ma-blue font-black leading-none">
            <div className="bg-white p-8 rounded-[35px] shadow-lg border border-gray-100 flex flex-wrap gap-6 justify-between items-center italic font-bold text-ma-blue font-black uppercase tracking-widest leading-none">
               <div className="flex items-center gap-5 italic font-black leading-none font-black uppercase">
                  <div className="bg-ma-blue text-white p-4 rounded-2xl shadow-lg animate-bounce text-white"><MousePointer2 size={24}/></div>
                  <div><h3 className="font-black text-ma-blue text-xl italic tracking-tighter underline decoration-ma-gold decoration-4 underline-offset-8">Satellite Designer</h3></div>
               </div>
               <div className="flex items-center gap-4 italic font-bold text-ma-blue leading-none font-black uppercase">
                  <select className="p-3 bg-white rounded-xl font-black text-ma-blue border-none focus:ring-2 focus:ring-ma-gold text-sm italic shadow-inner font-black uppercase" value={selectedCampusId} onChange={(e) => setSelectedCampusId(e.target.value)}><option value="">-- Choose Campus --</option>{campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                  <button onClick={() => setRoadNodes([])} className="px-5 py-3 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition text-sm italic font-black leading-none font-black uppercase">Reset</button>
                  <button onClick={handleSaveRoadNetwork} className="px-8 py-3 rounded-xl font-black text-white bg-ma-blue shadow-2xl hover:bg-blue-900 transition text-sm text-white font-bold italic uppercase underline decoration-ma-gold decoration-4 shadow-ma-gold/20"><Save size={18}/> Save Network</button>
               </div>
            </div>
            <div className={`h-[550px] rounded-[55px] overflow-hidden shadow-2xl border-8 border-white relative transition-all ${!selectedCampusId && 'grayscale opacity-50'}`}>
              <MapContainer center={[10.985464, 39.263236]} zoom={18} className="h-full w-full z-10 font-sans italic font-bold"><TileLayer url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} />
                {selectedCampusId && campuses.find(c => c.id == selectedCampusId) && <AutoFocusMap coords={[campuses.find(c => c.id == selectedCampusId).latitude, campuses.find(c => c.id == selectedCampusId).longitude]} />}
                {existingRoads.map((node, idx) => (
                  <React.Fragment key={idx}><CircleMarker center={[node.latitude, node.longitude]} radius={4} pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.8 }} />{node.edges && node.edges.map((edge, eIdx) => { const target = existingRoads.find(n => n.id === edge.endNodeId); return target && <Polyline key={eIdx} positions={[[node.latitude, node.longitude], [target.latitude, target.longitude]]} color="#22c55e" weight={3} opacity={0.6} />; })}</React.Fragment>
                ))}
                <SatelliteRoadBuilder nodes={roadNodes} onNodeAdd={(node) => setRoadNodes([...roadNodes, node])} />
              </MapContainer>
            </div>
          </div>
        )}

        {/* 🏢 Universal Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-ma-blue/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 text-ma-blue font-bold italic leading-none font-black italic uppercase">
            <div className="bg-white w-full max-w-xl rounded-[60px] shadow-2xl p-16 relative border-t-[18px] border-ma-gold animate-in zoom-in duration-300 overflow-hidden text-ma-blue italic font-bold">
              <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-red-500 transition-colors shadow-2xl italic leading-none font-black"><X size={44}/></button>
              <h3 className="text-3xl font-black mb-10 italic capitalize underline decoration-ma-gold decoration-8 text-ma-blue leading-none uppercase">{isEditMode ? 'Update' : 'Register'} {modalType.toUpperCase()}</h3>
              <form onSubmit={handleSubmit} className="space-y-8 text-ma-blue font-bold italic font-black leading-none uppercase">
                <input type="text" required className="w-full p-6 bg-gray-100 border-none rounded-[30px] focus:ring-4 focus:ring-ma-gold/20 font-black text-lg shadow-inner text-ma-blue italic font-bold leading-none uppercase" placeholder={`${modalType} Name`} value={formData.fullName || formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value, fullName: e.target.value})} />
                
                {modalType === 'user' && (
                  <div className="space-y-6 italic font-bold leading-none font-black italic uppercase">
                    <input type="email" placeholder="Admin Email" className="w-full p-6 bg-gray-50 rounded-[30px] font-black italic shadow-inner leading-none italic font-bold text-ma-blue" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <input type="password" placeholder="Set Password" className="w-full p-6 bg-gray-50 rounded-[30px] font-black italic shadow-inner leading-none italic font-bold text-ma-blue" value={formData.password || ""} onChange={e => setFormData({...formData, password: e.target.value, role: 'Admin'})} />
                  </div>
                )}
                
                {(modalType === 'campus' || modalType === 'building' || modalType === 'poi') && (
                  <div className="grid grid-cols-2 gap-8 font-bold italic text-ma-blue leading-none italic font-black uppercase">
                    <input type="number" step="any" placeholder="Latitude" className="p-6 bg-gray-100 rounded-[30px] font-black shadow-inner text-sm italic font-bold leading-none font-bold uppercase" value={formData.latitude || ""} onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value)})} />
                    <input type="number" step="any" placeholder="Longitude" className="p-6 bg-gray-100 rounded-[30px] font-black shadow-inner text-sm italic font-bold leading-none font-bold uppercase" value={formData.longitude || ""} onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})} />
                  </div>
                )}
                <button type="submit" className="w-full bg-ma-blue text-white py-8 rounded-[35px] font-black text-xl hover:bg-blue-900 shadow-2xl transition transform active:scale-95 italic tracking-widest text-white uppercase font-black underline decoration-ma-gold decoration-4 tracking-[3px]">Confirm and Save Changes</button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;