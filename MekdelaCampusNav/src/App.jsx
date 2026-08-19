import React from 'react';
// 🚀 አንድ ላይ የተጠቃለለ Import (Duplicates ተወግደዋል)
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- 🏠 የPublic ገጾች Imports ---
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import CampusSelection from './pages/CampusSelection';
import MapPage from './pages/MapPage';

// --- 🛠️ የAdmin ገጾች Imports (ከአዲሱ ፎልደር) ---
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ManageCampuses from './pages/admin/ManageCampuses';
import ManageBuildings from './pages/admin/ManageBuildings';
import ManageAdmins from './pages/admin/ManageAdmins';
import RoadDesigner from './pages/admin/RoadDesigner';
import OfficeHierarchy from './pages/admin/OfficeHierarchy';

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. 🌍 የሁሉም ሰው (Public) መንገዶች */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/campuses" element={<CampusSelection />} />
        <Route path="/map/:campusId" element={<MapPage />} />

        {/* 2. 🔐 የAdmin መንገዶች (በ AdminLayout ውስጥ የታቀፉ) */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* /admin ተብሎ ብቻ ሲመጣ በቀጥታ ወደ dashboard እንዲሄድ */}
          <Route index element={<Navigate to="dashboard" replace />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="campuses" element={<ManageCampuses />} />
          <Route path="buildings" element={<ManageBuildings />} />
          <Route path="users" element={<ManageAdmins />} />
          <Route path="roads" element={<RoadDesigner />} />
           <Route path="offices" element={<OfficeHierarchy />} /> 
        </Route>

        {/* 404 - ያልተመዘገበ መንገድ ሲመጣ ወደ Home እንዲመልስ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// ✅ አሁን በትክክል Export ተደርጓል
export default App;