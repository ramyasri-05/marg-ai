// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// --- IMPORT ALL REQUIRED FILES ---
import RoleSelection from './components/RoleSelection.jsx';
import DriverLogin from './components/DriverLogin.jsx';
import DriverSetup from './components/DriverSetup.jsx';
import HospitalDashboard from './components/HospitalDashboard.jsx'; 
import AdminLogin from './components/AdminLogin.jsx'; 
import HospitalLogin from './components/HospitalLogin.jsx';
import PoliceLogin from './components/PoliceLogin.jsx';
import PoliceDashboard from './pages/PoliceDashboard.jsx';

import DriverDashboard from './pages/DriverDashboard.jsx';
import ControlDashboard from './pages/ControlDashboard.jsx';

// --- LEAFLET CSS ---
import 'leaflet/dist/leaflet.css';

// CHANGE: The <React.StrictMode> tags have been removed from around the BrowserRouter.
ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelection />} />

        {/* --- LOGIN & SETUP FLOWS --- */}
        <Route path="/police/login" element={<PoliceLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} /> 
        <Route path="/hospital/login" element={<HospitalLogin />} /> 
        <Route path="/driver/login" element={<DriverLogin />} />
        <Route path="/driver/setup" element={<DriverSetup />} /> 

        {/* --- DASHBOARD FLOWS --- */}
        <Route path="/police/dashboard" element={<PoliceDashboard />} /> 
        <Route path="/admin/dashboard" element={<ControlDashboard role="Admin" />} /> 
        <Route path="/hospital/dashboard" element={<HospitalDashboard />} /> 
        <Route path="/driver/navigation" element={<DriverDashboard />} /> 
      </Routes>
    </BrowserRouter>
);