// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import RoleSelection from './components/RoleSelection.jsx';
import DriverLogin from './components/DriverLogin.jsx';
import DriverSetup from './components/DriverSetup.jsx';
import HospitalDashboard from './components/HospitalDashboard.jsx'; 
import AdminLogin from './components/AdminLogin.jsx'; 
import HospitalLogin from './components/HospitalLogin.jsx';

import DriverDashboard from './pages/DriverDashboard.jsx';
import ControlDashboard from './pages/ControlDashboard.jsx';

// The old "leaflet/dist/leaflet.css" import has been removed.

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<RoleSelection />} />
      <Route path="/police/login" element={<PoliceLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} /> 
      <Route path="/hospital/login" element={<HospitalLogin />} /> 
      <Route path="/driver/login" element={<DriverLogin />} />
      <Route path="/driver/setup" element={<DriverSetup />} /> 
      <Route path="/police/dashboard" element={<ControlDashboard role="Police" />} /> 
      <Route path="/admin/dashboard" element={<ControlDashboard role="Admin" />} /> 
      <Route path="/hospital/dashboard" element={<HospitalDashboard />} /> 
      <Route path="/driver/navigation" element={<DriverDashboard />} /> 
    </Routes>
  </BrowserRouter>
);