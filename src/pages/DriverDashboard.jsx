// src/pages/DriverDashboard.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { JUNCTIONS, MAP_CENTER, ZOOM_LEVEL, ROUTES_MOCK, HOSPITAL_OPTIONS } from '../data/mockCity';
import { useAmbulanceTracker } from '../hooks/useAmbulanceTracker.js';
import { dashboardStyles as styles, globalStyles } from '../Styles/AppStyles.js';
import { FaAmbulance, FaHospital, FaClock, FaRoad, FaArrowUp, FaArrowLeft, FaArrowRight, FaFlagCheckered } from 'react-icons/fa';

const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
        const timeoutId = setTimeout(() => { map.invalidateSize() }, 100);
        return () => clearTimeout(timeoutId);
    }, [map]);
    return null;
};

const ambulanceIcon = L.divIcon({ html: `<div style="background-color: white; width: 24px; height: 24px; border-radius: 50%; border: 4px solid var(--primary-blue); box-shadow: 0 0 10px var(--primary-blue);"></div>`, className: '', iconSize: [32, 32], iconAnchor: [16, 16], });
const hospitalIcon = L.divIcon({ html: `<div style="font-size: 20px; font-weight: bold; color: white; background: var(--accent-red); width: 32px; height: 32px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 3px solid white; box-shadow: 0 0 10px #000;">H</div>`, className: '', iconSize: [32, 32], iconAnchor: [16, 32], });
const getTrafficIcon = (status) => {
    let color = 'var(--accent-red)';
    if (status === 'Green') color = 'var(--accent-green)';
    if (status === 'Red-Forced') color = '#8b0000';
    return L.divIcon({ className: `traffic-light`, html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #121212;"></div>`, iconSize: [25, 25], iconAnchor: [12, 12], });
};

const mockTurnInstructions = [ { index: 0, icon: <FaArrowUp />, text: 'Start and head North' }, { index: 3, icon: <FaArrowLeft />, text: 'Turn Left at Varadhi Bridge' }, { index: 5, icon: <FaArrowRight />, text: 'Turn Right at Labbipet Jct' }, { index: 7, icon: <FaArrowRight />, text: 'Keep Right onto MG Road' }, { index: 9, icon: <FaFlagCheckered />, text: 'Destination Ahead' }, ];

function DriverDashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search);
    const destKey = query.get('dest') || 'manipal_hosp';
    const routeKey = query.get('route') || 'main';
    const destination = HOSPITAL_OPTIONS.find(h => h.value === destKey);
    const activeRouteData = ROUTES_MOCK[destKey]?.[routeKey];

    if (!activeRouteData) {
        return ( <div style={globalStyles.centeredPageContainer}><div style={globalStyles.card}><h2 style={{color: 'var(--accent-red)'}}>Error: Route Not Found</h2><button style={globalStyles.primaryButton} onClick={() => navigate('/')}>Go Home</button></div></div> );
    }

    const routePath = activeRouteData.path;
    const { signals, ambulancePos, startSimulation } = useAmbulanceTracker(JUNCTIONS, routePath);

    useEffect(() => {
        if (activeRouteData && !ambulancePos.isActive && ambulancePos.routeIndex === 0) {
            startSimulation();
        }
    }, [activeRouteData, ambulancePos.isActive, ambulancePos.routeIndex, startSimulation]);

    const routeProgress = routePath.length > 1 ? ambulancePos.routeIndex / (routePath.length - 1) : 1;
    const estimatedETA = ambulancePos.isActive ? `${Math.max(1, Math.ceil(activeRouteData.timeInMinutes * (1 - routeProgress)))} min` : "Arrived";
    const distanceRemaining = ambulancePos.isActive ? `${(parseFloat(activeRouteData.distance) * (1 - routeProgress)).toFixed(1)} km` : "0.0 km";
    const currentInstruction = [...mockTurnInstructions].reverse().find(inst => ambulancePos.routeIndex >= inst.index) || mockTurnInstructions[0];

    return (
        <div style={styles.container}>
            <div style={styles.controlPanel}>
                <h2 style={styles.header}><FaAmbulance /> Live Navigation</h2>
                <div style={styles.driverMetricsContainer}>
                    <div style={styles.driverMetricBox}><p style={styles.driverMetricLabel}>Time Remaining</p><p style={styles.driverMetricValue}>{estimatedETA}</p></div>
                    <div style={styles.driverMetricBox}><p style={styles.driverMetricLabel}>Distance Left</p><p style={styles.driverMetricValue}>{distanceRemaining}</p></div>
                </div>
                <div style={styles.driverInstructionCard}>
                    {ambulancePos.isActive ? ( <><div style={styles.driverInstructionIcon}>{currentInstruction.icon}</div><p style={styles.driverInstructionText}>{currentInstruction.text}</p></> ) : ( <><div style={styles.driverInstructionIcon}><FaFlagCheckered /></div><p style={styles.driverInstructionText}>You have arrived</p></> )}
                </div>
                <div>
                    <p style={{...styles.driverMetricLabel, textAlign: 'center'}}>Trip Progress</p>
                    <div style={styles.tripProgressContainer}><div style={{...styles.tripProgressBar, width: `${routeProgress * 100}%`}}></div></div>
                </div>
                <button onClick={() => navigate('/')} style={{...globalStyles.secondaryButton, marginTop: 'auto'}}>End Trip</button>
            </div>
            <div style={styles.mapContainer}>
                <MapContainer center={MAP_CENTER} zoom={ZOOM_LEVEL} style={{ height: '100%', width: '100%' }}>
                    <MapResizer />
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap contributors' />
                    <Polyline positions={routePath} color={'var(--accent-red)'} weight={6} opacity={0.9} />
                    {signals.map(signal => <Marker key={signal.id} position={[signal.lat, signal.lng]} icon={getTrafficIcon(signal.status)} />)}
                    {destination && <Marker position={[destination.lat, destination.lng]} icon={hospitalIcon} title={destination.name} />}
                    <Marker position={[ambulancePos.lat, ambulancePos.lng]} icon={ambulanceIcon} />
                </MapContainer>
            </div>
        </div>
    );
}

export default DriverDashboard;