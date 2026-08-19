import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit, Trash2, Key, ShieldCheck, AlertCircle, X, CheckCircle2, ChevronRight } from 'lucide-react';

const ManageAdmins = () => {
  const [systemUsers, setSystemUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifyingEmail, setVerifyingEmail] = useState('');

  const fetchData = async () => { try { const res = await api.get('/Users'); setSystemUsers(res.data); } catch(e){} };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (systemUsers.length >= 3) return alert("ቢበዛ 3 አድሚን ብቻ ነው የሚፈቀደው!");
    try {
      await api.post('/Auth/register-admin', formData);
      setShowModal(false); setVerifyingEmail(formData.email); setShowVerifyModal(true);
    } catch (err) { alert(err.response?.data?.message || "ምዝገባ አልተሳካም"); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/Auth/verify-account?email=${verifyingEmail}&code=${otpCode}`);
      alert("አካውንትዎ በስኬት ተረጋግጧል! ✅"); setShowVerifyModal(false); fetchData();
    } catch (err) { alert("የገቡት ኮድ ስህተት ነው ወይም ጊዜው አልፏል!"); }
  };

  return (
    <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-6 italic font-bold text-[#00204E] uppercase">
      <div className="p-12 border-b flex justify-between items-center bg-white italic underline decoration-[#C4A006] decoration-4 underline-offset-8">
        <h3 className="text-xl font-black">AUTHORIZED ADMINISTRATORS ({systemUsers.length}/3)</h3>
        <button onClick={() => setShowModal(true)} disabled={systemUsers.length >= 3} className={`px-10 py-4 rounded-2xl font-black transition shadow-2xl text-white flex items-center gap-2 ${systemUsers.length >= 3 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#00204E] hover:bg-blue-900'}`}><Plus size={24}/> ADD ADMIN</button>
      </div>
      <table className="w-full text-left font-black">
        <thead className="bg-white text-gray-400 text-[10px] italic">
          <tr><th className="p-10">ID</th><th className="p-10">STATUS</th><th className="p-10">FULL NAME</th><th className="p-10">EMAIL</th><th className="p-10 text-center">MANAGE</th></tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {systemUsers.map(u => (
            <tr key={u.id} className="hover:bg-blue-50/10 transition italic">
              <td className="p-10 text-[#C4A006]">#{u.id}</td>
              <td className="p-10">{u.isActive ? <span className="text-green-500 text-[10px] flex items-center gap-2 font-black"><ShieldCheck size={16}/> VERIFIED</span> : <button onClick={() => {setVerifyingEmail(u.email); setShowVerifyModal(true);}} className="text-red-500 text-[10px] underline flex items-center gap-2 animate-pulse font-black"><AlertCircle size={16}/> NEEDS VERIFICATION</button>}</td>
              <td className="p-10">{u.fullName}</td>
              <td className="p-10 lowercase font-medium text-blue-600 text-sm italic">{u.email}</td>
              <td className="p-10 text-center flex justify-center gap-4">
                <button className="p-3 text-blue-600 bg-blue-50 rounded-2xl hover:scale-110 transition"><Edit size={20}/></button>
                <button onClick={async () => { if(window.confirm("Delete?")) { await api.delete(`/Users/${u.id}`); fetchData(); } }} className="p-3 text-red-500 bg-red-50 rounded-2xl hover:scale-110 transition"><Trash2 size={20}/></button>
              </td>
            </tr>))}</tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 bg-[#00204E]/40 backdrop-blur-md z-[100] flex items-center justify-center p-6 italic font-bold">
          <div className="bg-white w-full max-w-lg rounded-[60px] shadow-2xl p-16 relative border-t-[14px] border-[#C4A006] animate-in zoom-in">
            <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-red-500 transition-colors"><X size={44}/></button>
            <h3 className="text-3xl font-black mb-12 italic underline decoration-[#C4A006] decoration-8 uppercase">REGISTER USER</h3>
            <form onSubmit={handleSubmit} className="space-y-8">
              <input type="text" required className="w-full p-6 bg-gray-100/50 border-none rounded-3xl font-black text-lg shadow-inner italic" placeholder="FULL NAME" onChange={e => setFormData({...formData, fullName: e.target.value})} />
              <input type="email" required className="w-full p-6 bg-gray-100/50 border-none rounded-3xl font-black text-lg shadow-inner italic" placeholder="Admin Email" onChange={e => setFormData({...formData, email: e.target.value})} />
              <input type="password" required className="w-full p-6 bg-gray-100/50 border-none rounded-3xl font-black text-lg shadow-inner italic" placeholder="Set Password" onChange={e => setFormData({...formData, password: e.target.value, role: 'Admin'})} />
              <button type="submit" className="w-full bg-[#C4A006] text-[#00204E] py-6 rounded-[35px] font-black text-xl hover:bg-yellow-600 shadow-2xl flex items-center justify-center gap-3 uppercase">Next Step <ChevronRight size={28}/></button>
            </form>
          </div>
        </div>
      )}

      {showVerifyModal && (
        <div className="fixed inset-0 bg-[#00204E]/40 backdrop-blur-md z-[110] flex items-center justify-center p-6 italic font-bold leading-none">
          <div className="bg-white w-full max-w-md rounded-[60px] shadow-2xl p-16 text-center relative border-t-[14px] border-[#C4A006] animate-in zoom-in">
             <button onClick={() => setShowVerifyModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-red-500 transition-colors"><X size={38}/></button>
             <h3 className="text-3xl font-black text-[#00204E] uppercase italic underline decoration-[#C4A006] decoration-8 mb-4">REGISTER USER</h3>
             <p className="text-[10px] text-slate-400 mt-6 uppercase font-black tracking-widest italic">check your email for the 6-digit code.</p>
             <form onSubmit={handleVerifyOTP} className="mt-12 space-y-10">
                <input type="text" maxLength="6" required className="w-full text-center text-4xl tracking-[24px] py-8 bg-gray-100/50 border-none rounded-3xl font-black text-slate-400 shadow-inner outline-none" placeholder="0 0 0 0 0 0" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
                <button type="submit" className="w-full bg-[#00D261] text-white py-6 rounded-[35px] font-black text-xl hover:bg-green-600 transition shadow-2xl uppercase italic">Verify and Finish</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ManageAdmins;