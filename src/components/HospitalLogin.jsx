// src/components/HospitalDashboard.jsx
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { JUNCTIONS, MAP_CENTER, ZOOM_LEVEL, ROUTES_MOCK } from '../data/mockCity';
import { useAmbulanceTracker } from '../hooks/useAmbulanceTracker.js';
import { dashboardStyles as styles, globalStyles } from '../styles/AppStyles';
import MARGAILogo from './MARGAILogo.jsx';


// --- Icon Definitions (Reused from App.jsx - MUST BE DEFINED) ---
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

// Component to dynamically center the map on the ambulance
const MapPanner = ({ position, isActive }) => {
    const map = useMap(); 
    useEffect(() => {
        if (isActive && position.lat && position.lng) {
            map.panTo([position.lat, position.lng], { animate: true, duration: 0.5 });
        }
    }, [map, position.lat, position.lng, isActive]);
    return null;
};

function HospitalDashboard() {
    const navigate = useNavigate();
    
    // Hospital view tracks the primary route ('highway')
    const activeRouteData = ROUTES_MOCK['highway'];
    
    // Initialize the tracker hook (The map logic runs here!)
    const { ambulancePos, signals, startSimulation, resetSimulation } = useAmbulanceTracker(JUNCTIONS, activeRouteData.path);

    // Auto-start simulation when the dashboard loads for a live view
    useEffect(() => {
        if (!ambulancePos.isActive) {
            startSimulation();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    // Mock ETA calculation based on remaining route points
    const remainingPoints = activeRouteData.path.length - ambulancePos.routeIndex;
    const estimatedETA = ambulancePos.isActive 
        ? `${Math.max(1, Math.round(remainingPoints * 0.2))} min` 
        : activeRouteData.time;

    return (
        <div style={styles.container}>
            
            {/* 1. LEFT SIDE: HOSPITAL STATUS PANEL */}
            <div style={styles.controlPanel}>
                <MARGAILogo />
                <h2 style={styles.header}>🏥 Hospital Tracking</h2>
                
                <h3 style={styles.subHeader}>Incoming Ambulance Status</h3>
                
                <div style={styles.hospitalStatusBox}>
                    <p style={styles.statusText}>Status: <strong style={{ color: ambulancePos.isActive ? '#2ECC71' : '#fff' }}>{ambulancePos.isActive ? 'IN TRANSIT' : 'AWAITING DISPATCH'}</strong></p>
                    <p style={styles.statusText}>Estimated Arrival: <strong style={styles.etaHighlight}>{estimatedETA}</strong></p>
                </div>

                <hr style={styles.divider} />
                
                <h4 style={styles.subHeader}>Patient & Vehicle Details</h4>
                <p style={styles.statusText}>Condition: <strong>Critical (Cardiac)</strong></p>
                <p style={styles.statusText}>Ambulance ID: <strong>AP 12 DN 3539</strong></p>
                <p style={styles.statusText}>Destination: <strong>{JUNCTIONS.find(j => j.id === 'J5').name}</strong></p>
                
                <button 
                    onClick={() => navigate('/')} 
                    style={{...globalStyles.secondaryButton, marginTop: 'auto', marginBottom: '10px'}}
                >
                    End Session & Log Out
                </button>
            </div>
            
            {/* 2. RIGHT SIDE: MAP VISUALIZATION */}
            <div style={styles.mapContainer}>
                <MapContainer center={MAP_CENTER} zoom={ZOOM_LEVEL} style={{ height: '100%' }}>
                    <MapPanner position={ambulancePos} isActive={ambulancePos.isActive} /> 
                    
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {/* Render the Active Route Polyline (Fixed red for clear visualization) */}
                    <Polyline positions={activeRouteData.path} color='red' weight={5} opacity={0.8} />

                    {/* Render Traffic Signal Markers */}
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

export default HospitalDashboard;