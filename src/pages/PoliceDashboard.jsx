// src/pages/PoliceDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { JUNCTIONS, MAP_CENTER, ZOOM_LEVEL, ROUTES_MOCK } from '../data/mockCity';
import { useAmbulanceTracker } from '../hooks/useAmbulanceTracker.js';
import { dashboardStyles as styles, globalStyles } from '../Styles/AppStyles.js';
import { FaTrafficLight, FaUserShield, FaHistory, FaMapMarkedAlt, FaVideo, FaSignOutAlt } from 'react-icons/fa';
import AIMonitor from '../components/AIMonitor.jsx';

// --- LEAFLET ASSET & MAP RESIZING --- //
const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
        const timeoutId = setTimeout(() => { map.invalidateSize() }, 100);
        return () => clearTimeout(timeoutId);
    }, [map]);
    return null;
};

// --- DYNAMIC ICONS --- //
const getAmbulanceIcon = (isActive) => divIcon({
    html: `<div class="ambulance-icon ${isActive ? 'active' : ''}"><div class="ambulance-siren"></div></div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

const getTrafficIcon = (status) => divIcon({
    className: `traffic-light-icon`,
    html: `<div class="traffic-light-dot" style="background-color: var(${status.includes('Red') ? '--accent-red' : '--accent-green'});"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

const getTime = () => new Date().toLocaleTimeString('en-IN', { hour12: false });

// --- UI SUB-COMPONENTS --- //

const ControlPanel = ({ activeRouteData, signals, ambulancePos, toggleManualOverride, startSimulation, events, onEndSession }) => {
    const nextClearingSignal = signals.find(s => s.status.includes('Red'));
    
    return (
        <div style={styles.controlPanel}>
            <h2 style={styles.header}><FaUserShield /> Police Control</h2>
            
            <div style={styles.statCard}>
                <h4 style={styles.subHeader}><FaVideo /> AI Camera Feed (J1)</h4>
                <AIMonitor onDetect={startSimulation} isSimulationActive={ambulancePos.isActive} />
            </div>

            <div style={styles.statCard}>
                <h4 style={styles.subHeader}><FaMapMarkedAlt /> Mission Details</h4>
                <p style={styles.statusText}><strong>Destination:</strong> {activeRouteData.destination}</p>
                <p style={styles.statusText}>
                    <strong>Status:</strong>
                    <span className={ambulancePos.isActive ? 'status-en-route' : ''} style={{color: ambulancePos.isActive ? 'var(--accent-green)' : 'var(--text-secondary)'}}>
                        {ambulancePos.isActive ? 'En Route' : 'Inactive'}
                    </span>
                </p>
                {ambulancePos.isActive && nextClearingSignal && (
                    <p style={styles.statusText}><strong>Next Signal:</strong> {nextClearingSignal.name}</p>
                )}
            </div>

            <div style={{...styles.statCard, flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0}}>
                <h4 style={styles.subHeader}><FaHistory /> Live Event Log</h4>
                <div style={styles.eventLogContent}>
                    {events.length === 0 ? <p style={{color: 'var(--text-secondary)', textAlign: 'center'}}>Awaiting events...</p> : 
                    events.map((event, index) => (
                        <div key={index} style={styles.eventLogItem}>
                            <span style={styles.eventLogTimestamp}>{event.time}</span>
                            <span>{event.message}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{...styles.statCard, maxHeight: '250px', display: 'flex', flexDirection: 'column'}}>
                <h4 style={styles.subHeader}><FaTrafficLight /> Signal Override</h4>
                <div style={styles.scrollableArea}>
                    {signals.map(signal => (
                        <div key={signal.id} style={styles.signalEntry}>
                            <span>{signal.name}: <strong>{signal.status}</strong></span>
                            <button onClick={() => toggleManualOverride(signal.id)} disabled={!ambulancePos.isActive} style={{...styles.overrideButton, opacity: ambulancePos.isActive ? 1 : 0.5}}>
                                OVERRIDE
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            
            <button onClick={onEndSession} style={{...globalStyles.secondaryButton, marginTop: 'auto', background: 'var(--accent-red)'}}><FaSignOutAlt/> End Session</button>
        </div>
    );
};

const MapPanel = ({ routePath, signals, ambulancePos }) => (
    <div style={styles.mapContainer}>
        <MapContainer center={MAP_CENTER} zoom={ZOOM_LEVEL} style={{ height: '100%', width: '100%' }}>
            <MapResizer />
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CartoDB' />
            <Polyline positions={routePath} color={'var(--accent-cyan)'} weight={5} opacity={0.8} dashArray="10, 10" />
            {signals.map(signal => <Marker key={signal.id} position={[signal.lat, signal.lng]} icon={getTrafficIcon(signal.status)} />)}
            {ambulancePos && <Marker position={[ambulancePos.lat, ambulancePos.lng]} icon={getAmbulanceIcon(ambulancePos.isActive)} />}
        </MapContainer>
        {!ambulancePos.isActive && (
            <div className="map-overlay">
                <h3>System Standby</h3>
                <p>Awaiting AI detection to initiate emergency route clearing.</p>
            </div>
        )}
    </div>
);


// --- MAIN DASHBOARD COMPONENT --- //

function PoliceDashboard() {
    const navigate = useNavigate();
    const { search } = useLocation();
    const query = new URLSearchParams(search);

    const destKey = query.get('dest') || 'manipal_hosp';
    const routeKey = query.get('route') || 'main';
    const activeRouteData = ROUTES_MOCK[destKey]?.[routeKey];
    
    const [events, setEvents] = useState([]);
    const prevSignalsRef = useRef();
    
    // Custom hook for managing the simulation logic
    const { signals, ambulancePos, toggleManualOverride, startSimulation } = useAmbulanceTracker(JUNCTIONS, activeRouteData?.path);

    const addEvent = (message) => setEvents(prev => [{ time: getTime(), message }, ...prev]);

    useEffect(() => {
        if (!activeRouteData) return;
        
        const wasActive = ambulancePos.isActive;
        // This effect runs when isActive status changes
        if (ambulancePos.isActive) {
            addEvent("Ambulance Detected. Route clearing initiated.");
        } else if (wasActive && !ambulancePos.isActive) {
            addEvent("Ambulance has reached the destination. System standby.");
        }
    }, [ambulancePos.isActive, activeRouteData]);

    useEffect(() => {
        if (!activeRouteData) return;

        if (prevSignalsRef.current) {
            signals.forEach(signal => {
                const prevSignal = prevSignalsRef.current.find(p => p.id === signal.id);
                if (prevSignal && prevSignal.status !== signal.status) {
                    addEvent(`Signal ${signal.name} status changed to ${signal.status}.`);
                }
            });
        }
        prevSignalsRef.current = signals;
    }, [signals, activeRouteData]);

    if (!activeRouteData) {
        return (
            <div style={{...globalStyles.centeredPageContainer, color: 'var(--accent-red)' }}>
                <h2>Error: Route data not found.</h2>
                <p>Please select a valid route from the main page.</p>
                <button onClick={() => navigate('/')} style={{...globalStyles.primaryButton, width: '200px'}}>Go Back</button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <ControlPanel 
                activeRouteData={activeRouteData}
                signals={signals}
                ambulancePos={ambulancePos}
                toggleManualOverride={toggleManualOverride}
                startSimulation={startSimulation}
                events={events}
                onEndSession={() => navigate('/')}
            />
            <MapPanel 
                routePath={activeRouteData.path}
                signals={signals}
                ambulancePos={ambulancePos}
            />
        </div>
    );
}

export default PoliceDashboard;
