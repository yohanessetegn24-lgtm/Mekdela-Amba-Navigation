import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ገጾቹን እዚህ ጋር እናስመጣ (Imports)
import Home from './pages/Home';
import Login from './pages/Login';
import CampusSelection from './pages/CampusSelection';
import MapPage from './pages/MapPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/campuses" element={<CampusSelection />} />
        <Route path="/map/:campusId" element={<MapPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

// ⚠️ ይህ መስመር ነው የጎደለው! ይህ ከሌለ ሲስተሙ አይነሳም
export default App;