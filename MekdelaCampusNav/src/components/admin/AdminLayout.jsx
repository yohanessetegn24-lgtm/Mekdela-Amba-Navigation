import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Map, Building2, UserCheck, Briefcase, Route, LogOut } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = localStorage.getItem('userName') || "Admin";
  const userInitial = userEmail.charAt(0).toUpperCase();

  const menuItems = [
    { label: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Manage Campuses', icon: Map, path: '/admin/campuses' },
    { label: 'Manage Buildings', icon: Building2, path: '/admin/buildings' },
    { label: 'Offices Hierarchy', icon: Briefcase, path: '/admin/offices' },
    { label: 'Manage Admins', icon: UserCheck, path: '/admin/users' },
    { label: 'Road Designer', icon: Route, path: '/admin/roads' },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-900 italic font-bold leading-none">
      {/* SIDEBAR */}
      <aside className="w-80 bg-[#006064] text-white p-8 flex flex-col z-50 shadow-2xl">
        <div className="flex items-center gap-4 mb-12 border-b border-white/10 pb-8 text-[#fbc02d]">
          <div className="bg-[#fbc02d] p-3 rounded-2xl text-[#006064] shadow-lg"><LayoutDashboard size={28}/></div>
          <div><h1 className="font-black text-xl tracking-tighter italic">MAU ADMIN</h1><p className="text-[10px] font-bold mt-1 uppercase tracking-widest text-[#C4A006]">Command Center</p></div>
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
          {menuItems.map((item, idx) => (
            <button key={idx} onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 p-5 rounded-[22px] transition-all duration-300 ${location.pathname === item.path ? 'bg-[#fbc02d] text-[#006064] font-black shadow-xl translate-x-3' : 'hover:bg-white/10 text-blue-200'}`}
            >
              <item.icon size={22} /> {item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => {localStorage.clear(); navigate('/login');}} className="flex items-center gap-4 p-5 text-red-300 border-t border-white/10 mt-4 pt-8"><LogOut size={22} /> Sign Out</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-12">
        <header className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-black text-[#006064] capitalize tracking-tight italic underline decoration-[#fbc02d] decoration-4 underline-offset-8">Admin Panel</h2>
          <div onClick={() => navigate('/admin/users')} className="w-14 h-14 bg-[#fbc02d] rounded-2xl border-4 border-[#fbc02d] flex items-center justify-center text-[#006064] font-black shadow-2xl cursor-pointer hover:scale-110 transition-transform text-2xl uppercase">
            {userInitial}
          </div>
        </header>
        <Outlet /> {/* ይህ ገጾቹ የሚቀያየሩበት ቦታ ነው */}
      </main>
    </div>
  );
};

export default AdminLayout;