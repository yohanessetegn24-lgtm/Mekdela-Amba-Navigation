import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { MapContainer, TileLayer, useMapEvents, CircleMarker, Polyline, useMap, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Save, Trash2, DownloadCloud, MousePointer2, Activity, Route } from 'lucide-react';

function AutoFocusMap({ coords }) {
  const map = useMap();
  useEffect(() => { if (coords && coords[0] !== 0) map.setView(coords, 18, { animate: true }); }, [coords, map]);
  return null;
}

function RoadBuilder({ nodes, onNodeAdd }) {
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

const RoadDesigner = () => {
  const [campuses, setCampuses] = useState([]);
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [roadNodes, setRoadNodes] = useState([]);
  const [existingRoads, setExistingRoads] = useState([]);

  useEffect(() => { api.get('/Campuses').then(res => setCampuses(res.data)); }, []);

  const fetchRoads = async () => {
    if (!selectedCampusId) return;
    try { const res = await api.get(`/Roads/network/${selectedCampusId}`); setExistingRoads(res.data); } catch (e) { setExistingRoads([]); }
  };
  useEffect(() => { fetchRoads(); }, [selectedCampusId]);

  const handleSave = async () => {
    if (!selectedCampusId || roadNodes.length < 2) return alert("እባክዎ መጀመሪያ ካምፓስ መርጠው መንገድ ይሳሉ!");
    await api.post('/Roads/save-network', { campusId: parseInt(selectedCampusId), nodes: roadNodes });
    setRoadNodes([]); fetchRoads(); alert("የመንገድ መረብ በስኬት ተቀምጧል! 🚀");
  };

  const selectedCampus = campuses.find(c => c.id == selectedCampusId);

  return (
    <div className="flex gap-8 h-[600px] animate-in slide-in-from-bottom-6 italic font-bold text-[#00204E] leading-none">
      <div className="w-96 bg-white rounded-[40px] shadow-xl border flex flex-col overflow-hidden">
        <div className="p-6 bg-gray-50/50 border-b flex items-center justify-between font-black uppercase text-sm">
          <h3>Saved Points ({existingRoads.length})</h3><button onClick={fetchRoads} className="text-[#C4A006] hover:rotate-180 transition-all"><Activity size={18}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {existingRoads.length === 0 ? <div className="text-center text-gray-300 opacity-50 py-20"><Route size={48} className="mx-auto mb-2"/><p className="text-[10px] font-black uppercase">No Roads Found</p></div> : 
            existingRoads.map((node, i) => <div key={i} className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-3"><div className="w-8 h-8 bg-[#00204E] text-[#C4A006] rounded-lg flex items-center justify-center text-[10px] font-black shadow-md">{i+1}</div><div><p className="text-[10px] font-black">ID: #{node.id}</p><p className="text-[8px] font-mono text-blue-400">{node.latitude?.toFixed(5)}, {node.longitude?.toFixed(5)}</p></div></div>)}
        </div>
        <div className="p-6 border-t bg-gray-50/30 space-y-3">
          <button onClick={handleSave} className="w-full bg-[#00204E] text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-900 transition flex items-center justify-center gap-3 text-xs uppercase italic underline decoration-[#C4A006] decoration-2 shadow-ma-gold/20"><Save size={18}/> Push to Database</button>
          <button onClick={async () => { if(window.confirm("እርግጠኛ ነህ?")) { await api.delete(`/Roads/clear-network/${selectedCampusId}`); fetchRoads(); } }} className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-black hover:bg-red-100 transition flex items-center justify-center gap-3 text-[10px] uppercase border border-red-100 shadow-sm"><Trash2 size={16}/> Clear All Saved Roads</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-[35px] shadow-lg flex justify-between items-center italic font-black uppercase tracking-tighter">
          <div className="flex items-center gap-4"><div className="bg-[#00204E] text-white p-3 rounded-xl shadow-lg animate-bounce"><MousePointer2 size={20}/></div><h3 className="text-lg">Satellite Designer</h3></div>
          <div className="flex gap-4">
            <select className="p-3 bg-gray-50 rounded-xl font-black text-xs shadow-inner" value={selectedCampusId} onChange={e => setSelectedCampusId(e.target.value)}><option value="">-- Choose Campus --</option>{campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <button onClick={() => setRoadNodes([])} className="px-5 py-3 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition text-[10px] uppercase">Reset Canvas</button>
          </div>
        </div>
        <div className={`flex-1 rounded-[45px] overflow-hidden shadow-2xl border-8 border-white relative transition-all ${!selectedCampusId && 'grayscale opacity-50'}`}>
          <MapContainer center={[10.985, 39.263]} zoom={18} className="h-full w-full">
            <TileLayer url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} />
            {selectedCampus && <AutoFocusMap coords={[selectedCampus.latitude, selectedCampus.longitude]} />}
            {existingRoads.map((node, idx) => (
              <React.Fragment key={idx}>
                <CircleMarker center={[node.latitude, node.longitude]} radius={5} pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.9 }} ><Popup><p className="font-black text-[10px]">Saved Point: #{node.id}</p></Popup></CircleMarker>
                {node.edges?.map((edge, eIdx) => { 
                  const target = existingRoads.find(n => n.id === edge.endNodeId); 
                  return target && <Polyline key={eIdx} positions={[[node.latitude, node.longitude], [target.latitude, target.longitude]]} color="#22c55e" weight={4} opacity={0.7} />; 
                })}
              </React.Fragment>
            ))}
            <RoadBuilder nodes={roadNodes} onNodeAdd={n => setRoadNodes([...roadNodes, n])} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};
export default RoadDesigner;