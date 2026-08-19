import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Map, Building2, UserCheck, Users, Activity } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState({ campuses: [], buildings: [], users: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, b, u] = await Promise.all([api.get('/Campuses'), api.get('/Buildings'), api.get('/Users')]);
        setData({ campuses: c.data, buildings: b.data, users: u.data });
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const usageData = [
    { name: 'Mon', visits: 400 }, { name: 'Tue', visits: 700 }, { name: 'Wed', visits: 550 },
    { name: 'Thu', visits: 900 }, { name: 'Fri', visits: 1100 }, { name: 'Sat', visits: 300 }, { name: 'Sun', visits: 200 }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-[#00204E] font-black">
        <div className="bg-white p-8 rounded-[35px] border-b-8 border-b-blue-500 shadow-xl">
          <Map className="text-blue-500 mb-2" size={32}/><p className="text-gray-400 text-[10px] uppercase font-black">Campuses</p>
          <p className="text-3xl font-black">{data.campuses.length}</p>
        </div>
        <div className="bg-white p-8 rounded-[35px] border-b-8 border-b-[#C4A006] shadow-xl">
          <Building2 className="text-[#C4A006] mb-2" size={32}/><p className="text-gray-400 text-[10px] uppercase font-black">Buildings</p>
          <p className="text-3xl font-black">{data.buildings.length}</p>
        </div>
        <div className="bg-white p-8 rounded-[35px] border-b-8 border-b-green-500 shadow-xl">
          <UserCheck className="text-green-500 mb-2" size={32}/><p className="text-gray-400 text-[10px] uppercase font-black">Admins</p>
          <p className="text-3xl font-black">{data.users.length}</p>
        </div>
        <div className="bg-white p-8 rounded-[35px] border-b-8 border-b-purple-500 shadow-xl">
          <Users className="text-purple-500 mb-2" size={32}/><p className="text-gray-400 text-[10px] uppercase font-black">Active Users</p>
          <p className="text-3xl font-black">1,420</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[50px] shadow-2xl h-80 italic font-bold">
          <h3 className="text-lg font-black text-[#00204E] mb-6 flex items-center gap-2 italic"><Activity size={18} className="text-[#C4A006]"/> Weekly Traffic</h3>
          <ResponsiveContainer width="100%" height="80%"><LineChart data={usageData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" hide /><Tooltip/><Line type="monotone" dataKey="visits" stroke="#00204E" strokeWidth={4} dot={{r: 4, fill: '#C4A006'}} /></LineChart></ResponsiveContainer>
        </div>
        <div className="bg-white p-10 rounded-[50px] shadow-2xl h-80">
          <h3 className="text-lg font-black text-[#00204E] mb-6 flex items-center gap-2 italic font-black"><Map size={18} className="text-[#C4A006]"/> Infrastructure</h3>
          <ResponsiveContainer width="100%" height="80%"><BarChart data={data.campuses.map(c => ({ name: c.name.split(' ')[0], count: data.buildings.filter(b => b.campusId === c.id).length }))}><XAxis dataKey="name" hide /><Tooltip/><Bar dataKey="count" fill="#00204E" radius={[10, 10, 0, 0]} /></BarChart></ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;