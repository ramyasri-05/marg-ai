// src/pages/ControlDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { JUNCTIONS, MAP_CENTER, ZOOM_LEVEL, ROUTES_MOCK } from '../data/mockCity';
import { useAmbulanceTracker } from '../hooks/useAmbulanceTracker.js';
import { dashboardStyles as styles, globalStyles } from '../Styles/AppStyles.js';
import { FaBroadcastTower, FaTrafficLight, FaUserShield, FaVideo, FaHistory } from 'react-icons/fa';
import AIMonitor from '../components/AIMonitor.jsx';

const MapResizer = () => { /* ... (no changes) ... */ };
const ambulanceIcon = divIcon({ /* ... (no changes) ... */ });
const getTrafficIcon = (status) => { /* ... (no changes) ... */ };

// Helper to get the current timestamp
const getTime = () => new Date().toLocaleTimeString('en-IN', { hour12: false });

function ControlDashboard({ role }) {
    const navigate = useNavigate();
    const query = new URLSearchParams(useLocation().search);
    const destKey = query.get('dest') || 'manipal_hosp';
    const routeKey = query.get('route') || 'main';
    const activeRouteData = ROUTES_MOCK[destKey]?.[routeKey];

    // --- NEW: State for the event log ---
    const [events, setEvents] = useState([]);
    const addEvent = (message) => {
        setEvents(prev => [...prev, { time: getTime(), message }]);
    };
    // Ref to hold the previous state of signals to detect changes
    const prevSignalsRef = useRef();
    // ------------------------------------
    
    if (!activeRouteData) {
        return (
            <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>
                <h2>Error: Route data not found.</h2>
                <p>Please check the destination and route parameters.</p>
            </div>
        );
    }

    const routePath = activeRouteData.path;
    const { signals, ambulancePos, toggleManualOverride, startSimulation } = useAmbulanceTracker(JUNCTIONS, routePath);

    // --- NEW: useEffects to generate log events ---
    useEffect(() => {
        // Log when the simulation starts or ends
        if (ambulancePos.isActive) {
            addEvent("Ambulance simulation started.");
        } else if (ambulancePos.routeIndex > 0) { // Check if it just finished
            addEvent("Ambulance has reached the destination.");
        }
    }, [ambulancePos.isActive]);

    useEffect(() => {
        // Log when a signal changes
        if (prevSignalsRef.current) {
            signals.forEach(signal => {
                const prevSignal = prevSignalsRef.current.find(p => p.id === signal.id);
                if (prevSignal && prevSignal.status !== signal.status) {
                    addEvent(`Signal ${signal.name} status changed to ${signal.status}.`);
                }
            });
        }
        // Update the ref with the current signals for the next render
        prevSignalsRef.current = signals;
    }, [signals]);
    // -----------------------------------------

    const nextClearingSignal = signals.find(s => s.status.includes('Red'));
    
    return (
        <div style={styles.container}>
            <div style={styles.controlPanel}>
                <h2 style={styles.header}><FaUserShield /> {role} Control Panel</h2>
                
                <div>
                    <h4 style={styles.subHeader}><FaVideo /> AI Camera Feed (J1)</h4>
                    <AIMonitor onDetect={startSimulation} isSimulationActive={ambulancePos.isActive} />
                </div>

                {/* --- NEW: Live Event Log Component --- */}
                <div style={styles.eventLogContainer}>
                    <h4 style={styles.subHeader}><FaHistory /> Live Event Log</h4>
                    <div style={styles.eventLogContent}>
                        {events.length === 0 && <p style={{color: 'var(--text-secondary)'}}>Awaiting events...</p>}
                        {events.map((event, index) => (
                            <div key={index} style={styles.eventLogItem}>
                                <span style={styles.eventLogTimestamp}>{event.time}</span>
                                <span>{event.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* --- End of Event Log --- */}

                <div style={{display: 'flex', flexDirection: 'column', minHeight: 0}}>
                    <h4 style={styles.subHeader}><FaTrafficLight /> Traffic Signals & Override</h4>
                    <div style={styles.scrollableArea}>
                        {signals.map(signal => {
                            const color = signal.status.includes('Red') ? 'var(--accent-red)' : 'var(--accent-green)';
                            return (
                                <div key={signal.id} style={styles.signalEntry}>
                                    {/* CHANGE: Added a visual status indicator dot */}
                                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                        <div style={{width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color}}></div>
                                        <span>{signal.name}: <strong>{signal.status.toUpperCase()}</strong></span>
                                    </div>
                                    <button onClick={() => toggleManualOverride(signal.id)} disabled={!ambulancePos.isActive} style={{...styles.overrideButton, opacity: ambulancePos.isActive ? 1 : 0.5}}>OVERRIDE</button>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <button onClick={() => navigate('/')} style={{...globalStyles.secondaryButton, flexShrink: 0}}>End Session</button>
            </div>
            
            <div style={styles.mapContainer}>
                <MapContainer center={MAP_CENTER} zoom={ZOOM_LEVEL} style={{ height: '100%', width: '100%' }}>
                    <MapResizer />
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap contributors' />
                    <Polyline positions={routePath} color={'var(--accent-cyan)'} weight={6} opacity={0.9} />
                    {signals.map(signal => <Marker key={signal.id} position={[signal.lat, signal.lng]} icon={getTrafficIcon(signal.status)} />)}
                    {ambulancePos.isActive && <Marker position={[ambulancePos.lat, ambulancePos.lng]} icon={ambulanceIcon} />}
                </MapContainer>
            </div>
        </div>
    );
}

export default ControlDashboard;