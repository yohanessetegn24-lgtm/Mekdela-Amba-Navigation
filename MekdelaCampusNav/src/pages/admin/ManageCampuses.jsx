import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit, Trash2, X, Upload } from 'lucide-react';

const ManageCampuses = () => {
  const [campuses, setCampuses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [isEdit, setIsEdit] = useState(false);

  const fetchCampuses = async () => { try { const res = await api.get('/Campuses'); setCampuses(res.data); } catch(e){} };
  useEffect(() => { fetchCampuses(); }, []);

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
      if (isEdit) await api.put(`/Campuses/${formData.id}`, formData);
      else await api.post('/Campuses', formData);
      setShowModal(false); fetchCampuses(); setFormData({});
    } catch (err) { alert("Error saving data"); }
  };

  return (
    <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-6">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30 text-[#00204E] font-black uppercase">
         <h3>Registered Campuses</h3>
         <button onClick={() => {setIsEdit(false); setFormData({}); setShowModal(true);}} className="bg-[#00204E] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-900 transition shadow-lg italic"><Plus size={20}/> New Campus</button>
      </div>
      <table className="w-full text-left font-black italic">
        <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase italic tracking-widest">
          <tr><th className="p-8">ID</th><th className="p-8">Name</th><th className="p-8 text-center">Location</th><th className="p-8 text-center">Actions</th></tr>
        </thead>
        <tbody className="divide-y divide-gray-50">{campuses.map(c => (
          <tr key={c.id} className="hover:bg-blue-50/20 transition group">
            <td className="p-8 text-[#C4A006]">#{c.id}</td><td className="p-8">{c.name}</td>
            <td className="p-8 text-center font-mono text-xs">{c.latitude?.toFixed(4)}, {c.longitude?.toFixed(4)}</td>
            <td className="p-8 text-center flex justify-center gap-4">
              <button onClick={() => {setFormData(c); setIsEdit(true); setShowModal(true);}} className="p-3 text-blue-600 bg-blue-50 rounded-2xl"><Edit size={18}/></button>
              <button onClick={async () => { if(window.confirm("እርግጠኛ ነህ?")) { await api.delete(`/Campuses/${c.id}`); fetchCampuses(); } }} className="p-3 text-red-500 bg-red-50 rounded-2xl"><Trash2 size={18}/></button>
            </td>
          </tr>))}</tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 italic font-bold">
          <div className="bg-white w-full max-w-xl rounded-[60px] shadow-2xl p-12 relative border-t-[18px] border-[#C4A006] animate-in zoom-in duration-300">
            <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-red-500"><X size={44}/></button>
            <h3 className="text-3xl font-black mb-10 underline decoration-[#C4A006] decoration-8 uppercase">{isEdit ? 'Update' : 'Register'} Campus</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input type="text" required className="w-full p-5 bg-gray-100 rounded-[25px] font-black italic shadow-inner" placeholder="Campus Name" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value, fullName: e.target.value})} />
              <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-[25px] border-2 border-dashed relative">
                <Upload className="text-[#C4A006]" size={24} /><span className="text-[10px] text-gray-500">{formData.imageUrl ? "Image Ready ✅" : "Select Photo"}</span>
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload}/>
              </div>
              <textarea rows="3" className="w-full p-5 bg-gray-50 rounded-[25px] shadow-inner text-sm" placeholder="Description" value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="any" className="p-5 bg-gray-100 rounded-[25px] italic shadow-inner" placeholder="Lat" value={formData.latitude || ""} onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value)})} />
                <input type="number" step="any" className="p-5 bg-gray-100 rounded-[25px] italic shadow-inner" placeholder="Lng" value={formData.longitude || ""} onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})} />
              </div>
              <button type="submit" className="w-full bg-[#00204E] text-white py-6 rounded-[30px] font-black text-xl hover:bg-black transition-all shadow-2xl uppercase">Save Information</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ManageCampuses;