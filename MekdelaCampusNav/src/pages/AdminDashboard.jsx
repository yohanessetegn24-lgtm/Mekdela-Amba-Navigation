import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar 
} from 'recharts';
import { MapContainer, TileLayer, useMapEvents, CircleMarker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  LayoutDashboard, Map, Building2, Users, MessageSquare, 
  LogOut, Plus, Search, Trash2, Edit, X, Briefcase, ChevronRight, Save, Route, MousePointer2, Activity, TrendingUp 
} from 'lucide-react';

// --- 🛰️ የካርታ ረዳት ክፍሎች ---
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
  useMapEvents({ click(e) { onNodeAdd({ id: Date.now(), latitude: e.latlng.lat, longitude: e.latlng.lng }); } });
  return (
    <>
      {nodes.map((node, i) => (
        <React.Fragment key={node.id}>
          <CircleMarker center={[node.latitude, node.longitude]} radius={6} pathOptions={{ color: '#C4A006', fillColor: '#C4A006', fillOpacity: 1 }} />
          {i > 0 && <Polyline positions={[[nodes[i-1].latitude, nodes[i-1].longitude], [node.latitude, node.longitude]]} color="white" weight={4} dashArray="5, 10" />}
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
  const [roadNodes, setRoadNodes] = useState([]); 
  
  // Selection States
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  
  // Modal & Edit States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('campus');
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  const API_URL = "http://localhost:5030/api";
  // Mock Data for Dashboard Graphs
  const usageData = [
    { name: 'Mon', visits: 400 }, { name: 'Tue', visits: 700 }, { name: 'Wed', visits: 550 },
    { name: 'Thu', visits: 900 }, { name: 'Fri', visits: 1100 }, { name: 'Sat', visits: 300 }, { name: 'Sun', visits: 200 }
  ];

  // መረጃዎችን ማምጣት
  const fetchData = async () => {
    try {
      const cRes = await axios.get(`${API_URL}/Campuses`); setCampuses(cRes.data);
      const bRes = await axios.get(`${API_URL}/Buildings`); setBuildings(bRes.data);
    } catch (err) { console.error("Error fetching data", err); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (selectedBuildingId) {
      axios.get(`${API_URL}/Offices/building/${selectedBuildingId}`).then(res => setOffices(res.data));
    } else { setOffices([]); }
  }, [selectedBuildingId]);

  // CRUD Actions
  const handleEditClick = (type, item) => {
    setModalType(type.toLowerCase());
    setIsEditMode(true);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = async (type, id) => {
    if (window.confirm(`እርግጠኛ ነህ ይህንን ${type} ማጥፋት ትፈልጋለህ?`)) {
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
      if (selectedBuildingId) axios.get(`${API_URL}/Offices/building/${selectedBuildingId}`).then(res => setOffices(res.data));
    } catch (err) { alert("Error saving data"); }
  };

  const handleSaveRoadNetwork = async () => {
    if (!selectedCampusId || roadNodes.length < 2) return alert("እባክዎ መጀመሪያ ካምፓስ መርጠው መንገድ ይሳሉ!");
    const payload = { campusId: parseInt(selectedCampusId), nodes: roadNodes.map(n => ({ latitude: n.latitude, longitude: n.longitude })) };
    try {
      await axios.post(`${API_URL}/Roads/save-network`, payload);
      alert("የመንገድ መረብ በስኬት ተቀምጧል! 🚀");
      setRoadNodes([]);
    } catch (err) { alert("መላክ አልተቻለም። RoadsController መኖሩን ያረጋግጡ።"); }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-900">
      
      {/* 🟢 SIDEBAR (Toronto Style) */}
      <aside className="w-80 bg-ma-blue text-white p-8 flex flex-col z-50 shadow-2xl">
        <div className="flex items-center gap-4 mb-12 border-b border-blue-900/50 pb-8">
          <div className="bg-ma-gold p-3 rounded-2xl text-ma-blue shadow-lg"><LayoutDashboard size={28}/></div>
          <div><h1 className="font-black text-xl tracking-tighter italic leading-none">MAU ADMIN</h1><p className="text-[10px] text-ma-gold font-bold mt-1 uppercase tracking-widest">COMMAND CENTER</p></div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'campuses', label: 'Manage Campuses', icon: Map },
            { id: 'buildings', label: 'Manage Buildings', icon: Building2 },
            { id: 'offices', label: 'Office Hierarchy', icon: Briefcase },
            { id: 'roads', label: 'Road Designer', icon: Route },
          ].map(item => (
            <button 
              key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-5 rounded-[22px] transition-all duration-300 ${activeTab === item.id ? 'bg-ma-gold text-ma-blue font-black shadow-xl translate-x-3' : 'hover:bg-blue-900/50 text-blue-200'}`}
            >
              <item.icon size={22} /> {item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => navigate('/login')} className="flex items-center gap-4 p-5 text-red-300 border-t border-blue-900 mt-4"><LogOut size={22} /> Sign Out</button>
      </aside>

      {/* 🔵 MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-12">
        <header className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-black text-ma-blue capitalize tracking-tight italic underline decoration-ma-gold decoration-4 underline-offset-8">{activeTab.replace('-', ' ')} Panel</h2>
          <div className="w-12 h-12 bg-ma-blue rounded-xl border-2 border-ma-gold flex items-center justify-center text-ma-gold font-black shadow-inner text-xl">A</div>
        </header>

        {/* 1. 📊 OVERVIEW TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-100 border-b-8 border-b-blue-500">
                <Map className="text-blue-500 mb-2" size={24}/>
                <p className="text-gray-400 text-[10px] font-black uppercase">Campuses</p>
                <p className="text-3xl font-black text-ma-blue">{campuses.length}</p>
              </div>
              <div className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-100 border-b-8 border-b-ma-gold text-ma-blue">
                <Building2 className="text-ma-gold mb-2" size={24}/>
                <p className="text-gray-400 text-[10px] font-black uppercase">Buildings</p>
                <p className="text-3xl font-black">{buildings.length}</p>
              </div>
              <div className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-100 border-b-8 border-b-green-500">
                <Users className="text-green-500 mb-2" size={24}/>
                <p className="text-gray-400 text-[10px] font-black uppercase">Users</p>
                <p className="text-3xl font-black text-ma-blue">1,420</p>
              </div>
              <div className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-100 border-b-8 border-b-purple-500">
                <Route className="text-purple-500 mb-2" size={24}/>
                <p className="text-gray-400 text-[10px] font-black uppercase">Road Nodes</p>
                <p className="text-3xl font-black text-ma-blue">86</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white p-10 rounded-[50px] shadow-xl border border-gray-50 h-80">
                <h3 className="text-lg font-black text-ma-blue mb-6 flex items-center gap-2"><Activity size={18} className="text-ma-gold"/> Weekly Student Traffic</h3>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                    <Tooltip contentStyle={{borderRadius: '15px', border: 'none'}}/>
                    <Line type="monotone" dataKey="visits" stroke="#00204E" strokeWidth={4} dot={{r: 4, fill: '#C4A006'}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-10 rounded-[50px] shadow-xl border border-gray-50 h-80">
                <h3 className="text-lg font-black text-ma-blue mb-6 flex items-center gap-2"><Map size={18} className="text-ma-gold"/> Infrastructure Balance</h3>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={campuses.map(c => ({ name: c.name.split(' ')[0], count: buildings.filter(b => b.campusId === c.id).length }))}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f8fafc'}}/>
                    <Bar dataKey="count" fill="#00204E" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* 2. 🏛️ CAMPUSES TAB */}
        {activeTab === 'campuses' && (
          <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-6">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30 text-ma-blue font-black">
               <h3 className="text-xl tracking-tighter italic">Registered Campuses</h3>
               <button onClick={() => {setModalType('campus'); setIsEditMode(false); setFormData({}); setShowModal(true);}} className="bg-ma-blue text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-900 transition shadow-lg"><Plus size={20}/> New Campus</button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                <tr><th className="p-8">Campus Name</th><th className="p-8 text-center">GPS Location</th><th className="p-8 text-center">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-bold text-ma-blue">
                {campuses.map(c => (
                  <tr key={c.id} className="hover:bg-blue-50/20 transition group">
                    <td className="p-8 flex items-center gap-4 italic font-black"><div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-ma-gold group-hover:bg-ma-gold group-hover:text-white transition-all"><Map size={18}/></div>{c.name}</td>
                    <td className="p-8 font-mono text-xs text-blue-600 text-center">{c.latitude}, {c.longitude}</td>
                    <td className="p-8 text-center flex justify-center gap-4">
                      <button onClick={() => handleEditClick('Campus', c)} className="p-3 text-blue-600 bg-blue-50 rounded-2xl hover:bg-blue-600 hover:text-white transition"><Edit size={18}/></button>
                      <button onClick={() => handleDelete('Campus', c.id)} className="p-3 text-red-500 bg-red-50 rounded-2xl hover:bg-red-500 hover:text-white transition"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. 🏢 BUILDINGS TAB */}
        {activeTab === 'buildings' && (
          <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-6">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30 text-ma-blue font-black">
               <h3 className="text-xl tracking-tighter italic">Campus Buildings</h3>
               <button onClick={() => {setModalType('building'); setIsEditMode(false); setFormData({}); setShowModal(true);}} className="bg-ma-blue text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-900 transition shadow-lg"><Plus size={20}/> New Building</button>
            </div>
            <table className="w-full text-left font-bold text-ma-blue">
              <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                <tr><th className="p-8">Building Name</th><th className="p-8">Campus</th><th className="p-8 text-center">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {buildings.map(b => (
                  <tr key={b.id} className="hover:bg-blue-50/20 transition group">
                    <td className="p-8 flex items-center gap-4 italic font-black"><div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-ma-gold group-hover:bg-ma-gold group-hover:text-white transition-all"><Building2 size={18}/></div>{b.name}</td>
                    <td className="p-8 text-slate-500 font-bold">{campuses.find(c => c.id === b.campusId)?.name || "---"}</td>
                    <td className="p-8 text-center flex justify-center gap-4">
                      <button onClick={() => handleEditClick('Building', b)} className="p-3 text-blue-600 bg-blue-50 rounded-2xl hover:bg-blue-600 hover:text-white transition"><Edit size={18}/></button>
                      <button onClick={() => handleDelete('Building', b.id)} className="p-3 text-red-500 bg-red-50 rounded-2xl hover:bg-red-500 hover:text-white transition"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. 📂 OFFICE HIERARCHY TAB */}
        {activeTab === 'offices' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold text-ma-blue">
              <div className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-100">
                <label className="text-[10px] font-black text-ma-gold uppercase mb-4 block tracking-widest">Step 1: Select Campus</label>
                <select className="w-full p-4 bg-gray-50 rounded-2xl font-black border-none focus:ring-4 focus:ring-ma-gold/20" onChange={(e) => { setSelectedCampusId(e.target.value); setSelectedBuildingId(""); }}>
                  <option value="">-- Choose Campus --</option>
                  {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className={`bg-white p-8 rounded-[35px] shadow-sm border border-gray-100 transition-all ${!selectedCampusId && 'opacity-30 blur-[1px]'}`}>
                <label className="text-[10px] font-black text-ma-gold uppercase mb-4 block tracking-widest">Step 2: Select Building</label>
                <select disabled={!selectedCampusId} className="w-full p-4 bg-gray-50 rounded-2xl font-black border-none focus:ring-4 focus:ring-ma-gold/20" onChange={(e) => setSelectedBuildingId(e.target.value)}>
                  <option value="">-- Choose Building --</option>
                  {buildings.filter(b => b.campusId == selectedCampusId).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            {selectedBuildingId ? (
              <div className="bg-white rounded-[45px] shadow-xl border border-gray-100 overflow-hidden font-bold text-ma-blue">
                <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                  <h3 className="font-black text-2xl italic tracking-tighter">Offices in {buildings.find(b => b.id == selectedBuildingId)?.name}</h3>
                  <button onClick={() => {setModalType('office'); setIsEditMode(false); setFormData({buildingId: selectedBuildingId}); setShowModal(true);}} className="bg-ma-blue text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-900 transition shadow-lg"><Plus size={24}/> Add Office</button>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest text-ma-blue">
                    <tr><th className="p-8 text-ma-blue">Office Details</th><th className="p-8 text-center text-ma-blue">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {offices.map(o => (
                      <tr key={o.id} className="hover:bg-blue-50/10 transition group text-ma-blue">
                        <td className="p-8 flex items-center gap-4 italic font-black"><div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-ma-gold"><Briefcase size={20}/></div><div><p className="font-black">{o.name}</p><p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Room {o.roomNumber} • Floor {o.floorNumber}</p></div></td>
                        <td className="p-8 text-center flex justify-center gap-4 text-ma-blue">
                            <button onClick={() => handleEditClick('Office', o)} className="p-3 text-blue-600 bg-blue-50 rounded-2xl hover:bg-blue-600 hover:text-white transition"><Edit size={18}/></button>
                            <button onClick={() => handleDelete('Office', o.id)} className="p-3 text-red-500 bg-red-50 rounded-2xl hover:bg-red-500 hover:text-white transition"><Trash2 size={20}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-64 border-4 border-dashed border-slate-200 rounded-[50px] flex flex-col items-center justify-center text-slate-300 font-black italic tracking-widest uppercase opacity-40">Complete Hierarchy Selection Above</div>
            )}
          </div>
        )}

        {/* 5. 🛰️ ROAD DESIGNER TAB */}
        {activeTab === 'roads' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
            <div className="bg-white p-8 rounded-[35px] shadow-lg border border-gray-100 flex flex-wrap gap-6 justify-between items-center text-ma-blue font-bold">
               <div className="flex items-center gap-5">
                  <div className="bg-ma-blue text-white p-4 rounded-2xl shadow-lg animate-bounce"><MousePointer2 size={24}/></div>
                  <div><h3 className="font-black text-ma-blue text-xl italic tracking-tighter">Satellite Path Designer</h3><p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Trace exact walking paths</p></div>
               </div>
               <div className="flex items-center gap-4">
                  <select className="p-3 bg-white rounded-xl font-black text-ma-blue border-none focus:ring-2 focus:ring-ma-gold text-sm font-bold" value={selectedCampusId} onChange={(e) => setSelectedCampusId(e.target.value)}>
                    <option value="">-- Choose Campus --</option>
                    {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button onClick={() => setRoadNodes([])} className="px-5 py-3 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition text-sm font-bold">Reset</button>
                  <button onClick={handleSaveRoadNetwork} className="px-8 py-3 rounded-xl font-black text-white bg-ma-blue shadow-2xl hover:bg-blue-900 transition text-sm text-white font-bold"><Save size={18}/> Save Network</button>
               </div>
            </div>
            <div className={`h-[550px] rounded-[55px] overflow-hidden shadow-2xl border-8 border-white relative transition-all ${!selectedCampusId && 'grayscale opacity-50'}`}>
              <MapContainer center={[10.985464, 39.263236]} zoom={18} className="h-full w-full z-10">
                <TileLayer url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} />
                {selectedCampusId && campuses.length > 0 && campuses.find(c => c.id == selectedCampusId) && (
                    <AutoFocusMap coords={[campuses.find(c => c.id == selectedCampusId).latitude, campuses.find(c => c.id == selectedCampusId).longitude]} />
                )}
                <SatelliteRoadBuilder nodes={roadNodes} onNodeAdd={(node) => setRoadNodes([...roadNodes, node])} />
              </MapContainer>
            </div>
          </div>
        )}

        {/* 🏢 CRUD MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-ma-blue/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 text-ma-blue font-bold">
            <div className="bg-white w-full max-w-xl rounded-[60px] shadow-2xl p-16 relative border-t-[18px] border-ma-gold">
              <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-red-500 transition-colors"><X size={44}/></button>
              <h3 className="text-3xl font-black mb-10 italic capitalize tracking-tighter">{isEditMode ? 'Edit' : 'Register'} {modalType}</h3>
              <form onSubmit={handleSubmit} className="space-y-8">
                <input type="text" required className="w-full p-6 bg-gray-100 border-none rounded-[30px] focus:ring-4 focus:ring-ma-gold/20 font-black text-lg" placeholder={`${modalType} Name`} value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} />
                {modalType === 'office' && (
                  <div className="grid grid-cols-2 gap-8">
                    <input type="text" placeholder="Room (B-01)" className="p-6 bg-gray-100 rounded-[30px] font-black" value={formData.roomNumber || ""} onChange={e => setFormData({...formData, roomNumber: e.target.value})} />
                    <input type="number" placeholder="Floor" className="p-6 bg-gray-100 rounded-[30px] font-black" value={formData.floorNumber || 0} onChange={e => setFormData({...formData, floorNumber: parseInt(e.target.value)})} />
                  </div>
                )}
                {(modalType === 'campus' || modalType === 'building') && (
                  <div className="grid grid-cols-2 gap-8">
                    <input type="number" step="any" placeholder="Latitude" className="p-6 bg-gray-100 rounded-[30px] font-black" value={formData.latitude || ""} onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value)})} />
                    <input type="number" step="any" placeholder="Longitude" className="p-6 bg-gray-100 rounded-[30px] font-black" value={formData.longitude || ""} onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})} />
                  </div>
                )}
                <button type="submit" className="w-full bg-ma-blue text-white py-8 rounded-[35px] font-black text-xl hover:bg-blue-900 shadow-2xl transition transform active:scale-95 italic tracking-widest text-white uppercase">Save Information</button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;