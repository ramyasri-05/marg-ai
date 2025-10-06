// src/components/HospitalDashboard.jsx
import React, { useState, useEffect } from 'react';
import { GoogleMap, MarkerF, Polyline } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { JUNCTIONS, MAP_CENTER, ZOOM_LEVEL, ROUTES_MOCK, HOSPITAL_OPTIONS } from '../data/mockCity';
import { useAmbulanceTracker } from '../hooks/useAmbulanceTracker.js';
import { dashboardStyles as styles, globalStyles } from '../styles/AppStyles';
import MARGAILogo from './MARGAILogo.jsx';
import { FaBroadcastTower, FaUserMd, FaHospital, FaHeartbeat, FaNotesMedical } from 'react-icons/fa';

const mapStyles = [ { "elementType": "geometry", "stylers": [ { "color": "#242f3e" } ] }, { "elementType": "labels.text.fill", "stylers": [ { "color": "#746855" } ] }, { "elementType": "labels.text.stroke", "stylers": [ { "color": "#242f3e" } ] }, { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [ { "color": "#263c3f" } ] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [ { "color": "#6b9a76" } ] }, { "featureType": "road", "elementType": "geometry", "stylers": [ { "color": "#38414e" } ] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [ { "color": "#212a37" } ] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#9ca5b3" } ] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [ { "color": "#746855" } ] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#1f2835" } ] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [ { "color": "#f3d19c" } ] }, { "featureType": "transit", "elementType": "geometry", "stylers": [ { "color": "#2f3948" } ] }, { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#17263c" } ] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#515c6d" } ] }, { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [ { "color": "#17263c" } ] } ];
const internalStyles = { alertBanner: { position: 'absolute', top: 0, left: 0, width: '100%', padding: '10px', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '1.2em', letterSpacing: '2px', zIndex: 1000, animation: 'flash-red 1.5s infinite', } };

function HospitalDashboard() {
    const navigate = useNavigate();
    const [showAlert, setShowAlert] = useState(true);

    const LiveVitals = () => { const [hr, setHr] = useState(115); useEffect(() => { const interval = setInterval(() => { setHr(prevHr => prevHr + Math.floor(Math.random() * 5) - 2) }, 2000); return () => clearInterval(interval); }, []); return ( <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}> <div style={styles.statCard}> <p style={styles.driverMetricLabel}>Heart Rate</p> <p style={{...styles.driverMetricValue, color: 'var(--accent-red)'}}> {hr} <span style={{fontSize: '16px'}}>BPM</span> <FaHeartbeat style={{animation: 'pulse 1s infinite'}}/> </p> </div> <div style={styles.statCard}> <p style={styles.driverMetricLabel}>Blood Pressure</p> <p style={{...styles.driverMetricValue, color: 'var(--accent-red)', fontSize: '22px'}}>140/90</p> </div> </div> ); };
    const ETACountdown = ({ initialMinutes, isActive, routeProgress }) => { const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60); useEffect(() => { setTotalSeconds(initialMinutes * 60); }, [initialMinutes]); useEffect(() => { if (isActive) { const timer = setInterval(() => { setTotalSeconds(prev => (prev > 0 ? prev - 1 : 0)); }, 1000); return () => clearInterval(timer); } }, [isActive]); if (!isActive && routeProgress >= 1) { return <p style={{...styles.driverMetricValue, color: 'var(--accent-green)'}}>Arrived</p>; } const minutes = Math.ceil(totalSeconds / 60); return (<p style={{...styles.driverMetricValue}}>{`${minutes} min`}</p>); };
    
    const activeRouteData = ROUTES_MOCK?.['manipal_hosp']?.['main'];
    const destination = HOSPITAL_OPTIONS.find(h => h.value === 'manipal_hosp');
    if (!activeRouteData) { return ( <div style={globalStyles.centeredPageContainer}><h2>Error</h2></div> ); }

    const { ambulancePos, signals, startSimulation } = useAmbulanceTracker(JUNCTIONS, activeRouteData.path);
    const routePath = activeRouteData.path;

    useEffect(() => {
        if (activeRouteData && !ambulancePos.isActive && ambulancePos.routeIndex === 0) {
            startSimulation();
        }
        const alertTimer = setTimeout(() => setShowAlert(false), 5000);
        return () => clearTimeout(alertTimer);
    }, [activeRouteData, ambulancePos.isActive, ambulancePos.routeIndex, startSimulation]);

    const routeProgress = routePath.length > 1 ? ambulancePos.routeIndex / (routePath.length - 1) : 1;
    const isAlertVisible = showAlert && ambulancePos.isActive;
    const googleMapsRoutePath = routePath.map(point => ({ lat: point[0], lng: point[1] }));

    return (
        <div style={styles.container}>
            {isAlertVisible && ( <div style={internalStyles.alertBanner}> INCOMING AMBULANCE </div> )}
            <div style={{ ...styles.controlPanel, paddingTop: isAlertVisible ? '75px' : '25px', transition: 'padding-top 0.5s ease-in-out' }}>
                <MARGAILogo />
                <h2 style={styles.header}><FaHospital/> Hospital ER</h2>
                <div><h4 style={styles.subHeader}><FaBroadcastTower/> Incoming Status</h4><div style={styles.statCard}><p style={styles.driverMetricLabel}>ETA</p><ETACountdown initialMinutes={activeRouteData.timeInMinutes} isActive={ambulancePos.isActive} routeProgress={routeProgress} /></div></div>
                <div><h4 style={styles.subHeader}><FaHeartbeat /> Live Patient Vitals</h4><LiveVitals /></div>
                <div><h4 style={styles.subHeader}><FaNotesMedical /> Case Details</h4><div style={styles.statCard}><p style={styles.statusText}>Condition: <strong>Critical</strong></p><hr style={{border: 'none', borderBottom: '1px solid #333', margin: '10px 0'}}/><p style={styles.statusText}>Ambulance ID: <strong>AP 12 DN 3539</strong></p></div></div>
                <button onClick={() => navigate('/')} style={{...globalStyles.secondaryButton, marginTop: 'auto'}}>End Session</button>
            </div>
            <div style={styles.mapContainer}>
                <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={{ lat: MAP_CENTER[0], lng: MAP_CENTER[1] }} zoom={ZOOM_LEVEL} options={{ styles: mapStyles, disableDefaultUI: true, zoomControl: true }}>
                    {signals.map(signal => (<MarkerF key={signal.id} position={{ lat: signal.lat, lng: signal.lng }} />))}
                    {destination && (<MarkerF position={{ lat: destination.lat, lng: destination.lng }} />)}
                    <MarkerF position={{ lat: ambulancePos.lat, lng: ambulancePos.lng }} />
                    <Polyline path={googleMapsRoutePath} options={{ strokeColor: 'var(--accent-red)', strokeWeight: 5 }} />
                </GoogleMap>
            </div>
        </div>
    );
}

export default HospitalDashboard;