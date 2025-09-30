// src/App.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { JUNCTIONS, MAP_CENTER, ZOOM_LEVEL, ROUTES_MOCK } from './data/mockCity';
import { useAmbulanceTracker } from './hooks/useAmbulanceTracker.js';
import { dashboardStyles as styles } from './styles/AppStyles'; // Import dark theme styles
import './index.css';

// --- ICON SETUP ---
const getTrafficIcon = (status) => {
    let color = 'red';
    if (status === 'Green') color = 'green';
    if (status === 'Red-Forced') color = 'darkred'; 

    return new L.DivIcon({
        className: `traffic-light ${color}`,
        html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #333;"></div>`,
        iconSize: [25, 25],
        iconAnchor: [12, 12],
    });
};
const ambulanceIcon = L.icon({ 
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3233/3233519.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});
// ------------------------------------------

// Component to dynamically pan the map center to the ambulance's current location
const MapPanner = ({ position, isActive }) => {
    const map = useMap();

    useEffect(() => {
        if (isActive && position.lat && position.lng) {
            // Pan the map smoothly to the ambulance's current position
            map.panTo([position.lat, position.lng], {
                animate: true,
                duration: 0.5 
            });
        }
    }, [map, position.lat, position.lng, isActive]);

    return null;
};


function TrafficDashboard({ role = 'Police' }) {
    const location = useLocation();
    
    // Determine which route to use from URL query, defaulting to 'highway'
    const query = new URLSearchParams(location.search);
    const routeKey = query.get('route') || 'highway';
    const activeRouteData = ROUTES_MOCK[routeKey];
    const routePath = activeRouteData.path; 

    // Initialize the hook with the active path
    const { signals, ambulancePos, toggleManualOverride, startSimulation, resetSimulation } = useAmbulanceTracker(JUNCTIONS, routePath);

    const isControlView = role === 'Police' || role === 'Admin';
    const isDriverView = role === 'Driver';

    // Auto-start simulation when the component loads for the first time
    useEffect(() => {
        // We only auto-start if the route is defined (i.e., someone clicked "Start Navigation")
        if (activeRouteData && !ambulancePos.isActive) {
            startSimulation();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [role, routeKey]); 

    // Handle route selection change (for Police/Admin)
    const handleRouteChange = (e) => {
        // This is only active for Police/Admin to select a different route mid-session
        setActiveRouteKey(e.target.value);
        resetSimulation(); // Reset simulation to the new route start point
    };
    
    const nextClearingSignal = signals.find(s => s.status === 'Red' || s.status === 'Red-Forced');
    
    // Dynamic button text
    let buttonText = 'AI Detects Ambulance - START GREEN CORRIDOR';
    if (ambulancePos.isActive) {
        buttonText = 'SIMULATION RUNNING...';
    } else if (ambulancePos.routeIndex > 0) {
         buttonText = 'ROUTE COMPLETED! Re-Activate';
    }

    const polylineColor = isDriverView ? '#E74C3C' : '#00BFFF'; // Red for Driver, Cyan for Control
    
    // Determine header text for the driver
    const driverHeader = isDriverView ? `Live Navigation - ${activeRouteData.name}` : '';

    return (
        <div style={styles.container}>
            
            {/* 1. LEFT SIDE: CONTROL PANEL / STATUS (Conditional Rendering) */}
            {isControlView ? (
                // --- POLICE / ADMIN CONTROL VIEW ---
                <div style={styles.controlPanel}>
                    <h2 style={styles.header}>🚨 {role} Control Panel</h2>
                    
                    {/* DYNAMIC ROUTE SELECTION */}
                    <h4 style={styles.subHeader}>Route Optimization Result</h4>
                    <select 
                        onChange={handleRouteChange} 
                        value={activeRouteKey} 
                        disabled={ambulancePos.isActive}
                        style={styles.selectInput}
                    >
                        {Object.entries(ROUTES_MOCK).map(([key, route]) => (
                            <option key={key} value={key}>
                                {route.name} ({route.time})
                            </option>
                        ))}
                    </select>

                    {/* AI ACTIVATION BUTTON (Police/Admin can restart the demo) */}
                    <button 
                        style={styles.activationButton(ambulancePos.isActive)}
                        disabled={ambulancePos.isActive}
                        onClick={startSimulation}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 191, 255, 0.6)'} 
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                    >
                        {buttonText}
                    </button>
                    
                    <hr style={styles.divider}/>
                    
                    {/* REAL-TIME STATUS INFO */}
                    <h4 style={styles.subHeader}>Real-Time Status</h4>
                    <p style={styles.statusText}>Ambulance Status: <strong style={styles.dataHighlight}>{ambulancePos.isActive ? 'IN TRANSIT' : 'IDLE'}</strong></p>
                    <p style={styles.statusText}>Current Route: <strong>{activeRouteData.name}</strong></p>
                    <p style={styles.statusText}>Next Clearance: 
                        <strong style={{ color: '#F1C40F', fontWeight: 'bold' }}> 
                            {ambulancePos.isActive ? (nextClearingSignal ? `CLEAR ${nextClearingSignal.name}` : 'ROUTE CLEAR') : 'AWAITING START'}
                        </strong>
                    </p>
                    <hr style={styles.divider}/>
                    
                    {/* MANUAL OVERRIDE LIST */}
                    <h4 style={styles.subHeader}>Traffic Signals & Override</h4>
                    <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                        {signals.map(signal => (
                            <div key={signal.id} style={styles.signalEntry}>
                                <span>
                                    **{signal.name}**: <strong style={{ color: signal.status.toLowerCase().includes('red') ? '#E74C3C' : '#2ECC71', fontWeight: 'bold' }}>{signal.status.toUpperCase()}</strong>
                                </span>
                                <button
                                    onClick={() => toggleManualOverride(signal.id)}
                                    disabled={!ambulancePos.isActive}
                                    style={styles.overrideButton(signal.status, ambulancePos.isActive)}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                                >
                                    {signal.status === 'Red-Forced' ? 'FORCED STOP' : 'MANUAL OVERRIDE'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // --- DRIVER NAVIGATION VIEW (Minimal Sidebar) ---
                <div style={styles.controlPanel}>
                    <h2 style={styles.header}>🚑 {driverHeader}</h2>
                    <h4 style={styles.subHeader}>Turn-by-Turn Navigation (Mock)</h4>
                    <div style={styles.signalEntry}>
                        <p style={{marginBottom: '0'}}>Current Status:</p>
                        <strong style={styles.dataHighlight}>{ambulancePos.isActive ? 'EN ROUTE' : 'COMPLETED'}</strong>
                    </div>
                    <div style={{ padding: '10px 0', borderBottom: '1px solid #495460' }}>
                        <h1 style={{ color: styles.dataHighlight.color, margin: '0' }}>
                            {ambulancePos.isActive ? "-> NEXT TURN: LEFT" : "DESTINATION REACHED"}
                        </h1>
                        <p style={{ margin: '5px 0 0', color: '#BDC3C7' }}>{ambulancePos.isActive ? "in 300 meters at J2" : "Hospital J5"}</p>
                    </div>
                    <button 
                        onClick={() => navigate('/')} 
                        style={{...styles.secondaryButton, marginTop: 'auto', marginBottom: '10px'}}
                    >
                        End Trip & Log Out
                    </button>
                </div>
            )}
            
            {/* 2. RIGHT SIDE: MAP VISUALIZATION */}
            <div style={styles.mapContainer}>
                <MapContainer 
                    center={MAP_CENTER}
                    zoom={ZOOM_LEVEL} 
                    style={{ height: '100vh', width: '100%' }}
                >
                    {/* CRITICAL: FOLLOWS THE AMBULANCE */}
                    <MapPanner position={ambulancePos} isActive={ambulancePos.isActive} /> 
                    
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {/* Render the Active Route Polyline */}
                    <Polyline 
                        positions={routePath} 
                        color={polylineColor} 
                        weight={5} 
                        opacity={0.8} 
                        dashArray={isDriverView ? '0' : '10, 10'} 
                    />

                    {/* Render all Traffic Signal Markers */}
                    {signals.map(signal => (
                        <Marker 
                            key={signal.id} 
                            position={[signal.lat, signal.lng]} 
                            icon={getTrafficIcon(signal.status)}
                            title={signal.name}
                        />
                    ))}

                    {/* Render the Moving Ambulance Marker */}
                    {ambulancePos.isActive && (
                        <Marker 
                            position={[ambulancePos.lat, ambulancePos.lng]} 
                            icon={ambulanceIcon}
                        />
                    )}
                </MapContainer>
            </div>
        </div>
    );
}

export default TrafficDashboard;