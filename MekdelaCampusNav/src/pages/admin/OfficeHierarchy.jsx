import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit, Trash2, X, Briefcase } from 'lucide-react';

const OfficeHierarchy = () => {
  const [campuses, setCampuses] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [offices, setOffices] = useState([]);
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => { api.get('/Campuses').then(res => setCampuses(res.data)); api.get('/Buildings').then(res => setBuildings(res.data)); }, []);

  useEffect(() => {
    if (selectedBuildingId) api.get(`/Offices/building/${selectedBuildingId}`).then(res => setOffices(res.data));
    else setOffices([]);
  }, [selectedBuildingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) await api.put(`/Offices/${formData.id}`, formData);
      else await api.post('/Offices', { ...formData, buildingId: parseInt(selectedBuildingId) });
      setShowModal(false); setSelectedBuildingId(selectedBuildingId); // Refresh
    } catch (e) { alert("Error"); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-bold text-[#00204E] italic">
      <div className="grid grid-cols-2 gap-8 uppercase">
        <div className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-100">
          <label className="text-[10px] font-black text-[#C4A006] uppercase mb-4 block">Step 1: Select Campus</label>
          <select className="w-full p-4 bg-gray-50 rounded-2xl font-black border-none shadow-inner" value={selectedCampusId} onChange={(e) => { setSelectedCampusId(e.target.value); setSelectedBuildingId(""); }}>
            <option value="">-- Choose Campus --</option>{campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className={`bg-white p-8 rounded-[35px] shadow-sm border border-gray-100 ${!selectedCampusId && 'opacity-30'}`}>
          <label className="text-[10px] font-black text-[#C4A006] uppercase mb-4 block">Step 2: Select Building</label>
          <select disabled={!selectedCampusId} className="w-full p-4 bg-gray-50 rounded-2xl font-black border-none shadow-inner" value={selectedBuildingId} onChange={(e) => setSelectedBuildingId(e.target.value)}>
            <option value="">-- Choose Building --</option>{buildings.filter(b => b.campusId == selectedCampusId).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      {selectedBuildingId && (
        <div className="bg-white rounded-[45px] shadow-xl border border-gray-100 overflow-hidden font-bold italic">
          <div className="p-10 border-b flex justify-between items-center bg-gray-50/30 font-black uppercase underline decoration-[#C4A006] decoration-4 underline-offset-8">
            <h3>Offices Management</h3>
            <button onClick={() => {setFormData({}); setIsEdit(false); setShowModal(true);}} className="bg-[#00204E] text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-900 shadow-lg uppercase"><Plus size={24}/> Add Office</button>
          </div>
          <table className="w-full text-left font-bold">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase"><tr><th className="p-8">ID</th><th className="p-8">Office Details</th><th className="p-8 text-center">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {offices.map(o => (
                <tr key={o.id} className="hover:bg-blue-50/10 transition group">
                  <td className="p-8 text-[#C4A006]">#{o.id}</td><td className="p-8">{o.name} - Room {o.roomNumber}</td>
                  <td className="p-8 text-center flex justify-center gap-4">
                    <button onClick={() => {setFormData(o); setIsEdit(true); setShowModal(true);}} className="p-3 text-blue-600 bg-blue-50 rounded-2xl"><Edit size={18}/></button>
                    <button onClick={async () => { if(window.confirm("Delete?")) { await api.delete(`/Offices/${o.id}`); setSelectedBuildingId(selectedBuildingId); } }} className="p-3 text-red-500 bg-red-50 rounded-2xl"><Trash2 size={20}/></button>
                  </td>
                </tr>))}</tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-6 italic font-bold">
          <div className="bg-white w-full max-w-xl rounded-[60px] shadow-2xl p-12 border-t-[14px] border-[#C4A006] animate-in zoom-in">
            <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-red-500"><X size={44}/></button>
            <h3 className="text-3xl font-black mb-8 uppercase italic">{isEdit ? 'Update' : 'Add'} Office</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input type="text" required className="w-full p-5 bg-gray-100 rounded-[25px] font-black italic shadow-inner" placeholder="Office Name" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value, fullName: e.target.value})} />
              <input type="text" className="w-full p-5 bg-gray-100 rounded-[25px] font-black italic shadow-inner" placeholder="Room Number (e.g R-101)" value={formData.roomNumber || ""} onChange={e => setFormData({...formData, roomNumber: e.target.value})} />
              <textarea rows="3" className="w-full p-5 bg-gray-50 rounded-[25px] shadow-inner text-sm" placeholder="Description" value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} />
              <button type="submit" className="w-full bg-[#00204E] text-white py-6 rounded-[30px] font-black text-xl shadow-2xl uppercase">Save Information</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default OfficeHierarchy;