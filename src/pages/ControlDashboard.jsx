// src/pages/ControlDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleMap, MarkerF, Polyline } from '@react-google-maps/api';
import { JUNCTIONS, MAP_CENTER, ZOOM_LEVEL, ROUTES_MOCK } from '../data/mockCity';
import { useAmbulanceTracker } from '../hooks/useAmbulanceTracker.js';
import { dashboardStyles as styles, globalStyles } from '../styles/AppStyles';
import { FaBroadcastTower, FaTrafficLight, FaUserShield, FaVideo, FaHistory, FaPowerOff, FaMapPin } from 'react-icons/fa';
import AIMonitor from '../components/AIMonitor.jsx';

const mapStyles = [ { "elementType": "geometry", "stylers": [ { "color": "#242f3e" } ] }, { "elementType": "labels.text.fill", "stylers": [ { "color": "#746855" } ] }, { "elementType": "labels.text.stroke", "stylers": [ { "color": "#242f3e" } ] }, { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [ { "color": "#263c3f" } ] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [ { "color": "#6b9a76" } ] }, { "featureType": "road", "elementType": "geometry", "stylers": [ { "color": "#38414e" } ] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [ { "color": "#212a37" } ] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#9ca5b3" } ] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [ { "color": "#746855" } ] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#1f2835" } ] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [ { "color": "#f3d19c" } ] }, { "featureType": "transit", "elementType": "geometry", "stylers": [ { "color": "#2f3948" } ] }, { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#17263c" } ] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#515c6d" } ] }, { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [ { "color": "#17263c" } ] } ];
const getTrafficColor = (trafficLevel) => { if (trafficLevel === 'High') return 'var(--accent-red)'; if (trafficLevel === 'Medium') return 'var(--accent-yellow)'; return 'var(--accent-green)'; };
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
    
    if (!activeRouteData) { return ( <div>Error</div> ); }

    const routePath = activeRouteData.path;
    const { signals, ambulancePos, toggleManualOverride, startSimulation } = useAmbulanceTracker(JUNCTIONS, routePath);

    useEffect(() => { if (ambulancePos.isActive && !prevIsActiveRef.current) { addEvent("Ambulance started."); } else if (!ambulancePos.isActive && prevIsActiveRef.current) { addEvent("Ambulance reached destination."); } prevIsActiveRef.current = ambulancePos.isActive; }, [ambulancePos.isActive]);
    useEffect(() => { if (prevSignalsRef.current) { signals.forEach(signal => { const prevSignal = prevSignalsRef.current.find(p => p.id === signal.id); if (prevSignal && prevSignal.status !== signal.status) { addEvent(`Signal ${signal.name} changed to ${signal.status}.`); } }); } prevSignalsRef.current = signals; }, [signals]);
    useEffect(() => { if (logContainerRef.current) { logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight; } }, [events]);
    
    const nextClearingSignal = signals.find(s => s.status.includes('Red'));
    const googleMapsRoutePath = routePath.map(point => ({ lat: point[0], lng: point[1] }));
    
    return (
        <div style={styles.container}>
            <div style={styles.controlPanel}>
                <h2 style={styles.header}><FaUserShield /> {role} Control Panel</h2>
                <div><h4 style={styles.subHeader}><FaVideo /> AI Camera Feed (J1)</h4><AIMonitor onDetect={startSimulation} isSimulationActive={ambulancePos.isActive} /></div>
                <div><h4 style={styles.subHeader}><FaBroadcastTower /> Real-Time Status</h4><div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}><div style={styles.statCard}><div style={{...styles.subHeader, marginBottom: '5px', fontSize: '14px'}}><FaPowerOff/> Status</div><p style={{...styles.driverMetricValue, fontSize: '24px', color: ambulancePos.isActive ? 'var(--accent-green)' : 'var(--text-primary)'}}>{ambulancePos.isActive ? 'IN TRANSIT' : 'IDLE'}</p></div><div style={styles.statCard}><div style={{...styles.subHeader, marginBottom: '5px', fontSize: '14px'}}><FaMapPin/> Next Signal</div><p style={{...styles.driverMetricValue, fontSize: '24px'}}>{ambulancePos.isActive ? (nextClearingSignal ? nextClearingSignal.name : 'CLEAR') : 'N/A'}</p></div></div></div>
                <div style={styles.eventLogContainer}><h4 style={styles.subHeader}><FaHistory /> Live Event Log</h4><div ref={logContainerRef} style={styles.eventLogContent}>{events.map((event, index) => ( <div key={index} style={styles.eventLogItem}><span style={styles.eventLogTimestamp}>{event.time}</span><span>{event.message}</span></div> ))}</div></div>
                <div><h4 style={styles.subHeader}><FaTrafficLight /> Traffic Signals & Override</h4>{signals.map(signal => { const junction = JUNCTIONS.find(j => j.id === signal.id); return ( <div key={signal.id} style={styles.signalEntry}><div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><div style={{width: '12px', height: '12px', borderRadius: '50%', backgroundColor: signal.status.includes('Red') ? 'var(--accent-red)' : 'var(--accent-green)'}}></div><span>{signal.name}</span></div><div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>{junction && (<span style={{...styles.trafficIndicator, backgroundColor: getTrafficColor(junction.traffic)}}>{junction.traffic}</span>)}<button onClick={() => toggleManualOverride(signal.id)} disabled={!ambulancePos.isActive} style={{...styles.overrideButton, opacity: ambulancePos.isActive ? 1 : 0.5}}>OVERRIDE</button></div></div> ); })}</div>
                <button onClick={() => navigate('/')} style={{...globalStyles.secondaryButton, marginTop: 'auto'}}>End Session</button>
            </div>
            <div style={styles.mapContainer}>
                <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={{ lat: MAP_CENTER[0], lng: MAP_CENTER[1] }} zoom={ZOOM_LEVEL} options={{ styles: mapStyles, disableDefaultUI: true, zoomControl: true }}>
                    {signals.map(signal => (<MarkerF key={signal.id} position={{ lat: signal.lat, lng: signal.lng }} />))}
                    <MarkerF position={{ lat: ambulancePos.lat, lng: ambulancePos.lng }} />
                    <Polyline path={googleMapsRoutePath} options={{ strokeColor: 'var(--accent-cyan)', strokeWeight: 5 }} />
                </GoogleMap>
            </div>
        </div>
    );
}

export default ControlDashboard;