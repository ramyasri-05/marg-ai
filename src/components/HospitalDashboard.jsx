// src/components/HospitalDashboard.jsx
import React, { useState, useEffect } from 'react';
import { GoogleMap, MarkerF, Polyline } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { JUNCTIONS, MAP_CENTER, ZOOM_LEVEL, HOSPITAL_OPTIONS } from '../data/mockCity';
import { useAmbulanceTracker } from '../hooks/useAmbulanceTracker.js';
import { dashboardStyles as styles, globalStyles } from '../styles/AppStyles';
import MARGAILogo from './MARGAILogo.jsx';
import { FaBroadcastTower, FaUserMd, FaHospital, FaHeartbeat, FaNotesMedical, FaSpinner } from 'react-icons/fa';

const mapStyles = [ { "elementType": "geometry", "stylers": [ { "color": "#242f3e" } ] }, { "elementType": "labels.text.fill", "stylers": [ { "color": "#746855" } ] }, { "elementType": "labels.text.stroke", "stylers": [ { "color": "#242f3e" } ] }, { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [ { "color": "#263c3f" } ] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [ { "color": "#6b9a76" } ] }, { "featureType": "road", "elementType": "geometry", "stylers": [ { "color": "#38414e" } ] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [ { "color": "#212a37" } ] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#9ca5b3" } ] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [ { "color": "#746855" } ] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#1f2835" } ] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [ { "color": "#f3d19c" } ] }, { "featureType": "transit", "elementType": "geometry", "stylers": [ { "color": "#2f3948" } ] }, { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#17263c" } ] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#515c6d" } ] }, { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [ { "color": "#17263c" } ] } ];

// --- ICONS ADDED LIKE DRIVER DASHBOARD ---
const ambulanceIcon = { path: window.google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: "white", fillOpacity: 1, strokeColor: "var(--primary-blue)", strokeWeight: 5 };
const hospitalIcon = { path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm-1.5 9H9v-2h1.5V9.5h2V11H14v2h-1.5v1.5h-2V13H9v-2z', fillColor: "white", fillOpacity: 1, strokeWeight: 0, rotation: 0, scale: 1.3, anchor: new window.google.maps.Point(12, 22) };
const junctionIcon = { path: window.google.maps.SymbolPath.CIRCLE, scale: 5, fillColor: "var(--accent-yellow)", fillOpacity: 0.9, strokeColor: "white", strokeWeight: 1.5, };

const internalStyles = { alertBanner: { position: 'absolute', top: 0, left: 0, width: '100%', padding: '10px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.2em', letterSpacing: '2px', zIndex: 1000, animation: 'flash-red 1.5s infinite', } };

function HospitalDashboard() {
    const navigate = useNavigate();
    const [showAlert, setShowAlert] = useState(true);
    const [directions, setDirections] = useState(null);
    const [trackerPath, setTrackerPath] = useState([]);

    const destination = HOSPITAL_OPTIONS.find(h => h.value === 'manipal_hosp');

    // --- DYNAMIC ROUTE LOGIC ADDED ---
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

    const { ambulancePos, signals, startSimulation } = useAmbulanceTracker(JUNCTIONS, trackerPath);

    useEffect(() => {
        if (trackerPath.length > 0 && !ambulancePos.isActive && ambulancePos.routeIndex === 0) {
            startSimulation();
        }
        const alertTimer = setTimeout(() => setShowAlert(false), 5000);
        return () => clearTimeout(alertTimer);
    }, [trackerPath, ambulancePos.isActive, ambulancePos.routeIndex, startSimulation]);

    const routeInfo = directions?.routes[0].legs[0];
    const routeProgress = trackerPath.length > 1 ? ambulancePos.routeIndex / (trackerPath.length - 1) : 1;
    const timeRemaining = routeInfo ? (routeInfo.duration.value * (1 - routeProgress)) : 0;
    const estimatedETA = ambulancePos.isActive ? `${Math.ceil(timeRemaining / 60)} min` : "Arrived";

    const LiveVitals = () => { const [hr, setHr] = useState(115); useEffect(() => { const interval = setInterval(() => { setHr(prevHr => prevHr + Math.floor(Math.random() * 5) - 2) }, 2000); return () => clearInterval(interval); }, []); return ( <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}> <div style={styles.statCard}> <p style={styles.driverMetricLabel}>Heart Rate</p> <p style={{...styles.driverMetricValue, color: 'var(--accent-red)'}}> {hr} <span style={{fontSize: '16px'}}>BPM</span> <FaHeartbeat style={{animation: 'pulse 1s infinite'}}/> </p> </div> <div style={styles.statCard}> <p style={styles.driverMetricLabel}>Blood Pressure</p> <p style={{...styles.driverMetricValue, color: 'var(--accent-red)', fontSize: '22px'}}>140/90</p> </div> </div> ); };
    const isAlertVisible = showAlert && ambulancePos.isActive;
    
    // --- LOADING STATE ADDED ---
    if (!directions || !destination) {
        return (
            <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
                <h2 style={styles.header}><FaSpinner className="fa-spin" /> Calculating Real Route...</h2>
            </div>
        );
    }
    
    return (
        <div style={styles.container}>
            {isAlertVisible && ( <div style={internalStyles.alertBanner}> INCOMING AMBULANCE </div> )}
            <div style={{ ...styles.controlPanel, paddingTop: isAlertVisible ? '75px' : '25px', transition: 'padding-top 0.5s ease-in-out' }}>
                <MARGAILogo />
                <h2 style={styles.header}><FaHospital/> Hospital ER</h2>
                <div><h4 style={styles.subHeader}><FaBroadcastTower/> Incoming Status</h4><div style={styles.statCard}><p style={styles.driverMetricLabel}>ETA</p><p style={styles.driverMetricValue}>{estimatedETA}</p></div></div>
                <div><h4 style={styles.subHeader}><FaHeartbeat /> Live Patient Vitals</h4><LiveVitals /></div>
                <div><h4 style={styles.subHeader}><FaNotesMedical /> Case Details</h4><div style={styles.statCard}><p style={styles.statusText}>Condition: <strong>Critical</strong></p><hr style={{border: 'none', borderBottom: '1px solid #333', margin: '10px 0'}}/><p style={styles.statusText}>Ambulance ID: <strong>AP 12 DN 3539</strong></p></div></div>
                <button onClick={() => navigate('/')} style={{...globalStyles.secondaryButton, marginTop: 'auto'}}>End Session</button>
            </div>
            {/* --- MAP UPDATED TO NEW STYLE --- */}
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

export default HospitalDashboard;