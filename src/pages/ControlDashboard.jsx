// src/pages/ControlDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { JUNCTIONS, MAP_CENTER, ZOOM_LEVEL, ROUTES_MOCK } from '../data/mockCity';
import { useAmbulanceTracker } from '../hooks/useAmbulanceTracker.js';
import { dashboardStyles as styles, globalStyles } from '../styles/AppStyles';
import { FaBroadcastTower, FaTrafficLight, FaUserShield, FaVideo, FaHistory, FaPowerOff, FaMapPin } from 'react-icons/fa';
import AIMonitor from '../components/AIMonitor.jsx';

const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
        const timeoutId = setTimeout(() => { map.invalidateSize() }, 100);
        return () => clearTimeout(timeoutId);
    }, [map]);
    return null;
};
const ambulanceIcon = L.divIcon({ html: `<div style="background-color: white; width: 24px; height: 24px; border-radius: 50%; border: 4px solid var(--primary-blue); box-shadow: 0 0 10px var(--primary-blue);"></div>`, className: '', iconSize: [32, 32], iconAnchor: [16, 16], });
const createIconHTML = (color) => `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #121212; box-shadow: 0 0 10px ${color};"></div>`;
const trafficIconRed = L.divIcon({ className: 'traffic-light', html: createIconHTML('var(--accent-red)'), iconSize: [25, 25], iconAnchor: [12, 12] });
const trafficIconGreen = L.divIcon({ className: 'traffic-light', html: createIconHTML('var(--accent-green)'), iconSize: [25, 25], iconAnchor: [12, 12] });
const getTrafficColor = (trafficLevel) => {
    if (trafficLevel === 'High') return 'var(--accent-red)';
    if (trafficLevel === 'Medium') return 'var(--accent-yellow)';
    return 'var(--accent-green)';
};
const getTime = () => new Date().toLocaleTimeString('en-IN', { hour12: false });

function ControlDashboard({ role }) {
    const navigate = useNavigate();
    const query = new URLSearchParams(useLocation().search);
    const destKey = query.get('dest') || 'manipal_hosp';
    const routeKey = query.get('route') || 'main';
    const activeRouteData = ROUTES_MOCK[destKey]?.[routeKey];
    
    const [events, setEvents] = useState([]);
    const prevSignalsRef = useRef();
    const prevIsActiveRef = useRef(false);
    const logContainerRef = useRef(null);
    
    const addEvent = (message) => { setEvents(prev => [...prev, { time: getTime(), message }]) };
    
    if (!activeRouteData) { return ( <div style={globalStyles.centeredPageContainer}><div style={globalStyles.card}><h2 style={{color: 'var(--accent-red)'}}>Error: Route Not Found</h2><button style={globalStyles.primaryButton} onClick={() => navigate('/')}>Go Home</button></div></div>); }

    const routePath = activeRouteData.path;
    const { signals, ambulancePos, toggleManualOverride, startSimulation } = useAmbulanceTracker(JUNCTIONS, routePath);

    useEffect(() => {
        if (ambulancePos.isActive && !prevIsActiveRef.current) { addEvent("Ambulance simulation started."); }
        else if (!ambulancePos.isActive && prevIsActiveRef.current) { addEvent("Ambulance has reached the destination."); }
        prevIsActiveRef.current = ambulancePos.isActive;
    }, [ambulancePos.isActive]);

    useEffect(() => {
        if (prevSignalsRef.current) {
            signals.forEach(signal => {
                const prevSignal = prevSignalsRef.current.find(p => p.id === signal.id);
                if (prevSignal && prevSignal.status !== signal.status) {
                    addEvent(`Signal ${signal.name} status changed to ${signal.status}.`);
                }
            });
        }
        prevSignalsRef.current = signals;
    }, [signals]);

    useEffect(() => {
        if (logContainerRef.current) { logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight; }
    }, [events]);
    
    const nextClearingSignal = signals.find(s => s.status.includes('Red'));
    
    return (
        <div style={styles.container}>
            <div style={styles.controlPanel}>
                <h2 style={styles.header}><FaUserShield /> {role} Control Panel</h2>
                <div>
                    <h4 style={styles.subHeader}><FaVideo /> AI Camera Feed (J1)</h4>
                    <AIMonitor onDetect={startSimulation} isSimulationActive={ambulancePos.isActive} />
                </div>
                <div>
                    <h4 style={styles.subHeader}><FaBroadcastTower /> Real-Time Status</h4>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                       <div style={styles.statCard}>
                            <div style={{...styles.subHeader, marginBottom: '5px', fontSize: '14px'}}><FaPowerOff/> Status</div>
                            <p style={{...styles.driverMetricValue, fontSize: '24px', color: ambulancePos.isActive ? 'var(--accent-green)' : 'var(--text-primary)'}}>{ambulancePos.isActive ? 'IN TRANSIT' : 'IDLE'}</p>
                       </div>
                       <div style={styles.statCard}>
                            <div style={{...styles.subHeader, marginBottom: '5px', fontSize: '14px'}}><FaMapPin/> Next Signal to Clear</div>
                            <p style={{...styles.driverMetricValue, fontSize: '24px'}}>{ambulancePos.isActive ? (nextClearingSignal ? nextClearingSignal.name : 'ROUTE CLEAR') : 'N/A'}</p>
                       </div>
                    </div>
                </div>
                <div style={styles.eventLogContainer}>
                    <h4 style={styles.subHeader}><FaHistory /> Live Event Log</h4>
                    <div ref={logContainerRef} style={styles.eventLogContent}>
                        {events.map((event, index) => ( <div key={index} style={styles.eventLogItem}><span style={styles.eventLogTimestamp}>{event.time}</span><span>{event.message}</span></div> ))}
                    </div>
                </div>
                <div>
                    <h4 style={styles.subHeader}><FaTrafficLight /> Traffic Signals & Override</h4>
                    {signals.map(signal => {
                        const junction = JUNCTIONS.find(j => j.id === signal.id);
                        return (
                            <div key={signal.id} style={styles.signalEntry}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                    <div style={{width: '12px', height: '12px', borderRadius: '50%', backgroundColor: signal.status.includes('Red') ? 'var(--accent-red)' : 'var(--accent-green)'}}></div>
                                    <span>{signal.name}</span>
                                </div>
                                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                    {junction && (<span style={{...styles.trafficIndicator, backgroundColor: getTrafficColor(junction.traffic)}}>{junction.traffic}</span>)}
                                    <button onClick={() => toggleManualOverride(signal.id)} disabled={!ambulancePos.isActive} style={{...styles.overrideButton, opacity: ambulancePos.isActive ? 1 : 0.5}}>OVERRIDE</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <button onClick={() => navigate('/')} style={{...globalStyles.secondaryButton, marginTop: 'auto'}}>End Session</button>
            </div>
            <div style={styles.mapContainer}>
                <MapContainer center={MAP_CENTER} zoom={ZOOM_LEVEL} style={{ height: '100%', width: '100%' }}>
                    <MapResizer />
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap contributors' />
                    <Polyline positions={routePath} color={'var(--accent-cyan)'} weight={6} opacity={0.9} />
                    {signals.map(signal => <Marker key={signal.id} position={[signal.lat, signal.lng]} icon={signal.status.includes('Red') ? trafficIconRed : trafficIconGreen} />)}
                    {ambulancePos.isActive && <Marker position={[ambulancePos.lat, ambulancePos.lng]} icon={ambulanceIcon} />}
                </MapContainer>
            </div>
        </div>
    );
}

export default ControlDashboard;