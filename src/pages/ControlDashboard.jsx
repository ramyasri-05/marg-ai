// src/pages/ControlDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleMap, MarkerF, Polyline } from '@react-google-maps/api';
import { JUNCTIONS, MAP_CENTER, ZOOM_LEVEL, HOSPITAL_OPTIONS } from '../data/mockCity';
import { useAmbulanceTracker } from '../hooks/useAmbulanceTracker.js';
import { dashboardStyles as styles, globalStyles } from '../styles/AppStyles';
import { FaBroadcastTower, FaTrafficLight, FaUserShield, FaVideo, FaHistory, FaPowerOff, FaMapPin, FaSpinner } from 'react-icons/fa';
import AIMonitor from '../components/AIMonitor.jsx';

const mapStyles = [ { "elementType": "geometry", "stylers": [ { "color": "#242f3e" } ] }, { "elementType": "labels.text.fill", "stylers": [ { "color": "#746855" } ] }, { "elementType": "labels.text.stroke", "stylers": [ { "color": "#242f3e" } ] }, { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [ { "color": "#263c3f" } ] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [ { "color": "#6b9a76" } ] }, { "featureType": "road", "elementType": "geometry", "stylers": [ { "color": "#38414e" } ] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [ { "color": "#212a37" } ] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#9ca5b3" } ] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [ { "color": "#746855" } ] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#1f2835" } ] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [ { "color": "#f3d19c" } ] }, { "featureType": "transit", "elementType": "geometry", "stylers": [ { "color": "#2f3948" } ] }, { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#17263c" } ] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#515c6d" } ] }, { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [ { "color": "#17263c" } ] } ];

const ambulanceIcon = { path: window.google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: "white", fillOpacity: 1, strokeColor: "var(--primary-blue)", strokeWeight: 5 };
const hospitalIcon = { path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm-1.5 9H9v-2h1.5V9.5h2V11H14v2h-1.5v1.5h-2V13H9v-2z', fillColor: "white", fillOpacity: 1, strokeWeight: 0, rotation: 0, scale: 1.3, anchor: new window.google.maps.Point(12, 22) };
const junctionIcon = { path: window.google.maps.SymbolPath.CIRCLE, scale: 5, fillColor: "var(--accent-yellow)", fillOpacity: 0.9, strokeColor: "white", strokeWeight: 1.5, };

const getTrafficColor = (trafficLevel) => { if (trafficLevel === 'High') return 'var(--accent-red)'; if (trafficLevel === 'Medium') return 'var(--accent-yellow)'; return 'var(--accent-green)'; };
const getTime = () => new Date().toLocaleTimeString('en-IN', { hour12: false });

function ControlDashboard({ role }) {
    const navigate = useNavigate();
    const query = new URLSearchParams(useLocation().search);
    const destKey = query.get('dest') || 'manipal_hosp';
    const destination = HOSPITAL_OPTIONS.find(h => h.value === destKey);

    const [directions, setDirections] = useState(null);
    const [trackerPath, setTrackerPath] = useState([]);
    const [events, setEvents] = useState([]);
    const prevSignalsRef = useRef();
    const prevIsActiveRef = useRef(false);
    const logContainerRef = useRef(null);
    
    useEffect(() => {
        if (!destination || !window.google) return;
        const directionsService = new window.google.maps.DirectionsService();
        const origin = { lat: JUNCTIONS[0].lat, lng: JUNCTIONS[0].lng };
        const dest = { lat: destination.lat, lng: destination.lng };
        directionsService.route({ origin, destination: dest, travelMode: 'DRIVING' }, (result, status) => {
            if (status === 'OK') {
                setDirections(result);
                const decodedPath = window.google.maps.geometry.encoding.decodePath(result.routes[0].overview_polyline).map(p => [p.lat(), p.lng()]);
                setTrackerPath(decodedPath);
            } else {
                console.error(`error fetching directions ${result}`);
            }
        });
    }, [destination]);

    const { signals, ambulancePos, toggleManualOverride, startSimulation } = useAmbulanceTracker(JUNCTIONS, trackerPath);

    const addEvent = (message) => { setEvents(prev => [...prev, { time: getTime(), message }]) };

    useEffect(() => { if (ambulancePos.isActive && !prevIsActiveRef.current) { addEvent("Ambulance started."); } else if (!ambulancePos.isActive && prevIsActiveRef.current) { addEvent("Ambulance reached destination."); } prevIsActiveRef.current = ambulancePos.isActive; }, [ambulancePos.isActive]);
    useEffect(() => { if (prevSignalsRef.current) { signals.forEach(signal => { const prevSignal = prevSignalsRef.current.find(p => p.id === signal.id); if (prevSignal && prevSignal.status !== signal.status) { addEvent(`Signal ${signal.name} changed to ${signal.status}.`); } }); } prevSignalsRef.current = signals; }, [signals]);
    useEffect(() => { if (logContainerRef.current) { logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight; } }, [events]);
    
    // --- THIS IS THE FIX ---
    const nextClearingSignal = signals.find(s => s.status && s.status.includes('Red'));
    
    if (!directions || !destination) {
        return (
            <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
                <h2 style={styles.header}><FaSpinner className="fa-spin" /> Calculating Real Route...</h2>
            </div>
        );
    }
    
    return (
        <div style={styles.container}>
            <div style={styles.controlPanel}>
                <h2 style={styles.header}><FaUserShield /> {role} Control Panel</h2>
                <div><h4 style={styles.subHeader}><FaVideo /> AI Camera Feed (J1)</h4><AIMonitor onDetect={startSimulation} isSimulationActive={ambulancePos.isActive} /></div>
                <div><h4 style={styles.subHeader}><FaBroadcastTower /> Real-Time Status</h4><div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}><div style={styles.statCard}><div style={{...styles.subHeader, marginBottom: '5px', fontSize: '14px'}}><FaPowerOff/> Status</div><p style={{...styles.driverMetricValue, fontSize: '24px', color: ambulancePos.isActive ? 'var(--accent-green)' : 'var(--text-primary)'}}>{ambulancePos.isActive ? 'IN TRANSIT' : 'IDLE'}</p></div><div style={styles.statCard}><div style={{...styles.subHeader, marginBottom: '5px', fontSize: '14px'}}><FaMapPin/> Next Signal</div><p style={{...styles.driverMetricValue, fontSize: '24px'}}>{ambulancePos.isActive ? (nextClearingSignal ? nextClearingSignal.name : 'CLEAR') : 'N/A'}</p></div></div></div>
                <div style={styles.eventLogContainer}><h4 style={styles.subHeader}><FaHistory /> Live Event Log</h4><div ref={logContainerRef} style={styles.eventLogContent}>{events.map((event, index) => ( <div key={index} style={styles.eventLogItem}><span style={styles.eventLogTimestamp}>{event.time}</span><span>{event.message}</span></div> ))}</div></div>
                <div><h4 style={styles.subHeader}><FaTrafficLight /> Traffic Signals & Override</h4>{signals.map(signal => { const junction = JUNCTIONS.find(j => j.id === signal.id); return ( <div key={signal.id} style={styles.signalEntry}><div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><div style={{width: '12px', height: '12px', borderRadius: '50%', backgroundColor: signal.status && signal.status.includes('Red') ? 'var(--accent-red)' : 'var(--accent-green)'}}></div><span>{signal.name}</span></div><div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>{junction && (<span style={{...styles.trafficIndicator, backgroundColor: getTrafficColor(junction.traffic)}}>{junction.traffic}</span>)}<button onClick={() => toggleManualOverride(signal.id)} disabled={!ambulancePos.isActive} style={{...styles.overrideButton, opacity: ambulancePos.isActive ? 1 : 0.5}}>OVERRIDE</button></div></div> ); })}</div>
                <button onClick={() => navigate('/')} style={{...globalStyles.secondaryButton, marginTop: 'auto'}}>End Session</button>
            </div>
            <div style={styles.mapContainer}>
                <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={{ lat: ambulancePos.lat, lng: ambulancePos.lng }} zoom={16} options={{ styles: mapStyles, disableDefaultUI: true, zoomControl: true }}>
                    {signals.map(signal => (<MarkerF key={signal.id} position={{ lat: signal.lat, lng: signal.lng }} icon={junctionIcon} title={signal.name} />))}
                    <MarkerF position={{ lat: destination.lat, lng: destination.lng }} icon={hospitalIcon} title={destination.name} />
                    <MarkerF position={{ lat: ambulancePos.lat, lng: ambulancePos.lng }} icon={ambulanceIcon} zIndex={100} />
                    <Polyline path={trackerPath.map(p => ({ lat: p[0], lng: p[1] }))} options={{ strokeColor: '#4285F4', strokeWeight: 6, zIndex: 1 }} />
                </GoogleMap>
            </div>
        </div>
    );
}

export default ControlDashboard;