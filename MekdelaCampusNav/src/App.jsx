import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- 🏠 የPublic (ለሁሉም ሰው ክፍት የሆኑ) ገጾች ---
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import MapPage from './pages/MapPage';
import CampusesPage from './pages/CampusesPage'; // አዲሱ ዝርዝር ገጽ
import AboutUs from './pages/AboutUs';
import Services from './pages/Services';
import Contact from './pages/Contact';

// --- 🛠️ የAdmin (ለአስተዳዳሪ ብቻ) ገጾች ---
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
        
        {/* 1. 🌍 Public Routes (ሁሉም ተጠቃሚ የሚያያቸው) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/map/:campusId" element={<MapPage />} />
        
        {/* የHome Page ናቭባር ሊንኮች እዚህ ጋር ናቸው */}
        <Route path="/campuses" element={<CampusesPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />

        {/* 2. 🔐 Admin Routes (በ AdminLayout ውስጥ የታቀፉ) */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* /admin ተብሎ ብቻ ሲመጣ በቀጥታ ወደ dashboard ይወስዳል */}
          <Route index element={<Navigate to="dashboard" replace />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="campuses" element={<ManageCampuses />} />
          <Route path="buildings" element={<ManageBuildings />} />
          <Route path="users" element={<ManageAdmins />} />
          <Route path="roads" element={<RoadDesigner />} />
          <Route path="offices" element={<OfficeHierarchy />} /> 
        </Route>

        {/* 3. 🚫 404 - መንገድ ቢጠፋ ወደ Home እንዲመለስ */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;