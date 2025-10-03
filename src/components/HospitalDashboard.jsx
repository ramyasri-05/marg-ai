// src/components/HospitalDashboard.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { JUNCTIONS, MAP_CENTER, ZOOM_LEVEL, ROUTES_MOCK, HOSPITAL_OPTIONS } from '../data/mockCity';
import { useAmbulanceTracker } from '../hooks/useAmbulanceTracker.js';
import { dashboardStyles as styles, globalStyles } from '../styles/AppStyles';
import MARGAILogo from './MARGAILogo.jsx';
import { FaBroadcastTower, FaUserMd, FaHospital, FaHeartbeat, FaNotesMedical } from 'react-icons/fa';

// Icon Definitions
const ambulanceIcon = divIcon({ html: `<div style="background-color: white; width: 24px; height: 24px; border-radius: 50%; border: 4px solid var(--primary-blue); box-shadow: 0 0 10px var(--primary-blue);"></div>`, className: '', iconSize: [32, 32], iconAnchor: [16, 16], });
const hospitalIcon = divIcon({ html: `<div style="font-size: 20px; font-weight: bold; color: white; background: var(--accent-red); width: 32px; height: 32px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 3px solid white; box-shadow: 0 0 10px #000;">H</div>`, className: '', iconSize: [32, 32], iconAnchor: [16, 32], });
const getTrafficIcon = (status) => { let color = status === 'Green' ? 'var(--accent-green)' : 'var(--accent-red)'; return divIcon({ className: `traffic-light`, html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #121212;"></div>`, iconSize: [25, 25], iconAnchor: [12, 12], }); };

function HospitalDashboard() {
    const navigate = useNavigate();
    const [showAlert, setShowAlert] = useState(true);

    // --- CHANGE: All helper components and styles are now defined INSIDE the main component ---
    
    // Helper component to fix map rendering issues
    const MapResizer = () => {
        const map = useMap();
        useEffect(() => {
            const timeoutId = setTimeout(() => { map.invalidateSize() }, 100);
            return () => clearTimeout(timeoutId);
        }, [map]);
        return null;
    };
    
    // Helper component to follow the ambulance
    const MapPanner = ({ position, isActive }) => {
        const map = useMap();
        useEffect(() => {
            if (isActive && position.lat && position.lng) {
                map.panTo([position.lat, position.lng], { animate: true, duration: 0.5 });
            }
        }, [map, position.lat, position.lng, isActive]);
        return null;
    };
    
    // Component to simulate live patient vitals
    const LiveVitals = () => {
        const [hr, setHr] = useState(115);
        useEffect(() => {
            const interval = setInterval(() => {
                setHr(prevHr => prevHr + Math.floor(Math.random() * 5) - 2);
            }, 2000);
            return () => clearInterval(interval);
        }, []);
        return (
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div style={styles.statCard}>
                    <p style={styles.driverMetricLabel}>Heart Rate</p>
                    <p style={{...styles.driverMetricValue, color: 'var(--accent-red)'}}>
                        {hr} <span style={{fontSize: '16px'}}>BPM</span> <FaHeartbeat style={{animation: 'pulse 1s infinite'}}/>
                    </p>
                </div>
                <div style={styles.statCard}>
                    <p style={styles.driverMetricLabel}>Blood Pressure</p>
                    <p style={{...styles.driverMetricValue, color: 'var(--accent-red)', fontSize: '22px'}}>140/90</p>
                </div>
            </div>
        );
    };

    // Component for the live ETA countdown
    const ETACountdown = ({ initialMinutes, isActive, routeProgress }) => {
        const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
        useEffect(() => { setTotalSeconds(initialMinutes * 60); }, [initialMinutes]);
        useEffect(() => {
            if (isActive) {
                const timer = setInterval(() => {
                    setTotalSeconds(prev => (prev > 0 ? prev - 1 : 0));
                }, 1000);
                return () => clearInterval(timer);
            }
        }, [isActive]);
        if (!isActive && routeProgress >= 1) {
            return <p style={{...styles.driverMetricValue, color: 'var(--accent-green)'}}>Arrived</p>;
        }
        const minutes = Math.ceil(totalSeconds / 60);
        return (<p style={{...styles.driverMetricValue}}>{`${minutes} min`}</p>);
    };

    // Styles for the alert banner
    const internalStyles = {
        alertBanner: {
            position: 'absolute', top: 0, left: 0, width: '100%', padding: '10px', color: 'white', fontWeight: 'bold',
            textAlign: 'center', fontSize: '1.2em', letterSpacing: '2px', zIndex: 1000, animation: 'flash-red 1.5s infinite',
        }
    };
    // --- End of moved components and styles ---

    const activeRouteData = ROUTES_MOCK?.['manipal_hosp']?.['main'];
    const destination = HOSPITAL_OPTIONS.find(h => h.value === 'manipal_hosp');

    if (!activeRouteData) {
        return ( <div style={globalStyles.centeredPageContainer}><div style={globalStyles.card}><h2 style={{color: 'var(--accent-red)'}}>Error: Default Route Data Not Found</h2><p style={{color: 'var(--text-secondary)'}}>There might be an issue with `src/data/mockCity.js`.</p><button style={globalStyles.primaryButton} onClick={() => navigate('/')}>Go Home</button></div></div> );
    }

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

    return (
        <div style={styles.container}>
            {isAlertVisible && ( <div style={internalStyles.alertBanner}> INCOMING AMBULANCE </div> )}
            <div style={{ ...styles.controlPanel, paddingTop: isAlertVisible ? '75px' : '25px', transition: 'padding-top 0.5s ease-in-out' }}>
                <MARGAILogo />
                <h2 style={styles.header}><FaHospital/> Hospital ER</h2>
                <div>
                    <h4 style={styles.subHeader}><FaBroadcastTower/> Incoming Status</h4>
                    <div style={styles.statCard}>
                        <p style={styles.driverMetricLabel}>Estimated Time of Arrival</p>
                        <ETACountdown initialMinutes={activeRouteData.timeInMinutes} isActive={ambulancePos.isActive} routeProgress={routeProgress} />
                    </div>
                </div>
                <div>
                    <h4 style={styles.subHeader}><FaHeartbeat /> Live Patient Vitals</h4>
                    <LiveVitals />
                </div>
                <div>
                    <h4 style={styles.subHeader}><FaNotesMedical /> Case Details</h4>
                     <div style={styles.statCard}>
                        <p style={styles.statusText}>Condition: <strong>Critical (Cardiac)</strong></p>
                        <hr style={{border: 'none', borderBottom: '1px solid #333', margin: '10px 0'}}/>
                        <p style={styles.statusText}>Ambulance ID: <strong>AP 12 DN 3539</strong></p>
                    </div>
                </div>
                <button onClick={() => navigate('/')} style={{...globalStyles.secondaryButton, marginTop: 'auto'}}> End Session </button>
            </div>
            <div style={styles.mapContainer}>
                <MapContainer center={MAP_CENTER} zoom={ZOOM_LEVEL} style={{ height: '100%' }}>
                    <MapResizer />
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap contributors' />
                    <Polyline positions={activeRouteData.path} color='red' weight={6} opacity={0.9} />
                    {signals.map(signal => <Marker key={signal.id} position={[signal.lat, signal.lng]} icon={getTrafficIcon(signal.status)} />)}
                    <Marker position={[ambulancePos.lat, ambulancePos.lng]} icon={ambulanceIcon} />
                    {destination && <Marker position={[destination.lat, destination.lng]} icon={hospitalIcon} />}
                </MapContainer>
            </div>
        </div>
    );
}

export default HospitalDashboard;