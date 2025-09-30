// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// --- IMPORT ALL REQUIRED FILES ---
import TrafficDashboard from './App.jsx';
import RoleSelection from './components/RoleSelection.jsx';
import PoliceLogin from './components/PoliceLogin.jsx';
import DriverLogin from './components/DriverLogin.jsx';
import DriverSetup from './components/DriverSetup.jsx'; 
import HospitalDashboard from './components/HospitalLogin.jsx'; 
// --- CRITICAL FIX: IMPORT UNIQUE LOGIN COMPONENTS ---
import AdminLogin from './components/AdminLogin.jsx'; 
import HospitalLogin from './components/HospitalLogin.jsx';
// --------------------------------------------------

// --- LEAFLET CSS & ICON FIX (Keep this block) ---
import 'leaflet/dist/leaflet.css'; 
import L from 'leaflet'; 
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/images/marker-icon-2x.png', 
    iconUrl: '/images/marker-icon.png', 
    shadowUrl: '/images/marker-shadow.png',
});
// ------------------------------------------------


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Base Route: Role Selection (Home Page) */}
        <Route path="/" element={<RoleSelection />} />

        {/* ======================================= */}
        {/* POLICE FLOW             */}
        {/* ======================================= */}
        <Route path="/police/login" element={<PoliceLogin />} />
        <Route path="/police/dashboard" element={<TrafficDashboard role="Police" />} /> 

        {/* ======================================= */}
        {/* ADMIN FLOW (USING DEDICATED LOGIN)  */}
        {/* ======================================= */}
        <Route path="/admin/login" element={<AdminLogin />} /> 
        <Route path="/admin/dashboard" element={<TrafficDashboard role="Admin" />} /> 

        {/* ======================================= */}
        {/* HOSPITAL FLOW (USING DEDICATED LOGIN) */}
        {/* ======================================= */}
        <Route path="/hospital/login" element={<HospitalLogin />} /> 
        <Route path="/hospital/dashboard" element={<HospitalDashboard />} /> 

        {/* ======================================= */}
        {/* DRIVER FLOW               */}
        {/* ======================================= */}
        <Route path="/driver/login" element={<DriverLogin />} />
        <Route path="/driver/setup" element={<DriverSetup />} /> 
        <Route path="/driver/navigation" element={<TrafficDashboard role="Driver" />} /> 
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);