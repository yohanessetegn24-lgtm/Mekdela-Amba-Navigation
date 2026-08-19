import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit, Trash2, X, Upload } from 'lucide-react';

const ManageBuildings = () => {
  const [campuses, setCampuses] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [isEdit, setIsEdit] = useState(false);

  const fetchData = async () => {
    try {
      const [c, b] = await Promise.all([api.get('/Campuses'), api.get('/Buildings')]);
      setCampuses(c.data); setBuildings(b.data);
    } catch(e){}
  };
  useEffect(() => { fetchData(); }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setFormData({ ...formData, imageUrl: reader.result }); };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) await api.put(`/Buildings/${formData.id}`, formData);
      else await api.post('/Buildings', { ...formData, campusId: parseInt(selectedCampusId) });
      setShowModal(false); fetchData(); setFormData({});
    } catch (err) { alert("Error saving"); }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700 italic font-bold">
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 text-[#00204E] font-black uppercase">
        <label className="text-[10px] text-[#C4A006] uppercase mb-4 block tracking-widest">Step 1: Choose Campus</label>
        <select className="w-full p-4 bg-gray-50 rounded-2xl font-black border-none shadow-inner" value={selectedCampusId} onChange={(e) => setSelectedCampusId(e.target.value)}>
          <option value="">-- Choose Campus --</option>{campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {selectedCampusId && (
        <div className="bg-white rounded-[45px] shadow-xl border border-gray-100 overflow-hidden text-[#00204E]">
          <div className="p-10 border-b flex justify-between items-center bg-gray-50/30">
            <h3 className="text-xl font-black uppercase underline decoration-[#C4A006] decoration-4 underline-offset-8">Buildings List</h3>
            <button onClick={() => {setFormData({}); setIsEdit(false); setShowModal(true);}} className="bg-[#00204E] text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-900 shadow-lg uppercase"><Plus size={22}/> New Building</button>
          </div>
          <table className="w-full text-left font-black">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase"><tr><th className="p-8">ID</th><th className="p-8">Building Name</th><th className="p-8 text-center">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {buildings.filter(b => b.campusId == selectedCampusId).map(b => (
                <tr key={b.id} className="hover:bg-blue-50/20 group">
                  <td className="p-8 text-[#C4A006]">#{b.id}</td><td className="p-8">{b.name}</td>
                  <td className="p-8 text-center flex justify-center gap-4">
                    <button onClick={() => {setFormData(b); setIsEdit(true); setShowModal(true);}} className="p-3 text-blue-600 bg-blue-50 rounded-2xl"><Edit size={18}/></button>
                    <button onClick={async () => { if(window.confirm("Delete?")) { await api.delete(`/Buildings/${b.id}`); fetchData(); } }} className="p-3 text-red-500 bg-red-50 rounded-2xl"><Trash2 size={18}/></button>
                  </td>
                </tr>))}</tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 italic font-bold">
          <div className="bg-white w-full max-w-xl rounded-[60px] shadow-2xl p-12 relative border-t-[14px] border-[#C4A006] animate-in zoom-in">
            <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-red-500"><X size={44}/></button>
            <h3 className="text-3xl font-black mb-10 underline decoration-[#C4A006] decoration-8 uppercase italic">{isEdit ? 'Update' : 'Register'} Building</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input type="text" required className="w-full p-5 bg-gray-100 rounded-[25px] font-black shadow-inner italic" placeholder="Building Name" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} />
              <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-[25px] border-2 border-dashed relative">
                <Upload className="text-[#C4A006]" size={24} /><span className="text-[10px] text-gray-500">{formData.imageUrl ? "Image Ready ✅" : "Select Photo"}</span>
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload}/>
              </div>
              <textarea rows="3" className="w-full p-5 bg-gray-50 rounded-[25px] shadow-inner text-sm" placeholder="Building Description" value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="any" className="p-5 bg-gray-100 rounded-[25px] shadow-inner italic" placeholder="Latitude" value={formData.latitude || ""} onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value)})} />
                <input type="number" step="any" className="p-5 bg-gray-100 rounded-[25px] shadow-inner italic" placeholder="Longitude" value={formData.longitude || ""} onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})} />
              </div>
              <button type="submit" className="w-full bg-[#00204E] text-white py-6 rounded-[30px] font-black text-xl shadow-2xl uppercase">Save Information</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ManageBuildings;