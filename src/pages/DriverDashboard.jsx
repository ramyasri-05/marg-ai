import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleMap, MarkerF, Polyline } from '@react-google-maps/api';
import * as geolib from 'geolib';
import { JUNCTIONS, MAP_CENTER, HOSPITAL_OPTIONS } from '../data/mockCity';
import { useAmbulanceTracker } from '../hooks/useAmbulanceTracker.js';
import { dashboardStyles as styles, globalStyles } from '../styles/AppStyles';
import { FaAmbulance, FaHospital, FaClock, FaRoad, FaArrowUp, FaArrowLeft, FaArrowRight, FaFlagCheckered, FaSpinner } from 'react-icons/fa';

const mapStyles = [ { "elementType": "geometry", "stylers": [ { "color": "#242f3e" } ] }, { "elementType": "labels.text.fill", "stylers": [ { "color": "#746855" } ] }, { "elementType": "labels.text.stroke", "stylers": [ { "color": "#242f3e" } ] }, { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [ { "color": "#263c3f" } ] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [ { "color": "#6b9a76" } ] }, { "featureType": "road", "elementType": "geometry", "stylers": [ { "color": "#38414e" } ] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [ { "color": "#212a37" } ] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#9ca5b3" } ] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [ { "color": "#746855" } ] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#1f2835" } ] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [ { "color": "#f3d19c" } ] }, { "featureType": "transit", "elementType": "geometry", "stylers": [ { "color": "#2f3948" } ] }, { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#17263c" } ] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#515c6d" } ] }, { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [ { "color": "#17263c" } ] } ];

const ambulanceIcon = { path: window.google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: "white", fillOpacity: 1, strokeColor: "var(--primary-blue)", strokeWeight: 5 };
const hospitalIcon = { path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm-1.5 9H9v-2h1.5V9.5h2V11H14v2h-1.5v1.5h-2V13H9v-2z', fillColor: "white", fillOpacity: 1, strokeWeight: 0, rotation: 0, scale: 1.3, anchor: new window.google.maps.Point(12, 22), labelOrigin: new window.google.maps.Point(12, 8), };
const junctionIcon = { path: window.google.maps.SymbolPath.CIRCLE, scale: 5, fillColor: "var(--accent-yellow)", fillOpacity: 0.9, strokeColor: "white", strokeWeight: 1.5, };

const MapSimulation = ({ destination }) => {
    const [directions, setDirections] = useState(null);
    const [currentStep, setCurrentStep] = useState(null);
    useEffect(() => { if (!destination || !window.google) return; const directionsService = new window.google.maps.DirectionsService(); const origin = { lat: JUNCTIONS[0].lat, lng: JUNCTIONS[0].lng }; const dest = { lat: destination.lat, lng: destination.lng }; directionsService.route({ origin, destination: dest, travelMode: 'DRIVING' }, (result, status) => { if (status === 'OK') setDirections(result); else console.error(`error fetching directions ${result}`); }); }, [destination]);
    const trackerPath = directions ? window.google.maps.geometry.encoding.decodePath(directions.routes[0].overview_polyline).map(p => [p.lat(), p.lng()]) : [];
    const { signals, ambulancePos, startSimulation } = useAmbulanceTracker(JUNCTIONS, trackerPath);
    useEffect(() => { if (trackerPath.length > 0 && !ambulancePos.isActive && ambulancePos.routeIndex === 0) { startSimulation(); } }, [trackerPath, ambulancePos.isActive, ambulancePos.routeIndex, startSimulation]);
    useEffect(() => { if (!directions || !ambulancePos.isActive) return; const steps = directions.routes[0].legs[0].steps; let stepIndex = 0; let cumulativePath = 0; for (let i = 0; i < steps.length; i++) { cumulativePath += steps[i].path.length; if (ambulancePos.routeIndex < cumulativePath) { stepIndex = i; break; } } setCurrentStep(steps[stepIndex]); }, [ambulancePos.routeIndex, directions, ambulancePos.isActive]);
    if (!directions) { return ( <div style={{...styles.container, justifyContent: 'center', alignItems: 'center'}}><h2 style={styles.header}><FaSpinner className="fa-spin" /> Calculating Real Route...</h2></div> ); }
    const routeInfo = directions.routes[0].legs[0];
    const routeProgress = trackerPath.length > 1 ? ambulancePos.routeIndex / (trackerPath.length - 1) : 1;
    const timeRemaining = (routeInfo.duration.value * (1 - routeProgress));
    const distanceRemaining = (routeInfo.distance.value * (1 - routeProgress));
    const estimatedETA = ambulancePos.isActive ? `${Math.ceil(timeRemaining / 60)} min` : "Arrived";
    const distanceText = ambulancePos.isActive ? `${(distanceRemaining / 1000).toFixed(1)} km` : "0.0 km";
    const instructionText = currentStep ? currentStep.instructions.replace(/<[^>]*>/g, '') : "Approaching Destination...";
    const getManeuverIcon = (maneuver) => { if (maneuver?.includes('turn-left')) return <FaArrowLeft />; if (maneuver?.includes('turn-right')) return <FaArrowRight />; return <FaArrowUp />; };
    const instructionIcon = currentStep ? getManeuverIcon(currentStep.maneuver) : <FaFlagCheckered />;
    return (
        <>
            <div style={styles.controlPanel}>
                <h2 style={styles.header}><FaAmbulance /> Live Navigation</h2>
                <div style={styles.driverMetricsContainer}><div style={styles.driverMetricBox}><p style={styles.driverMetricLabel}>ETA</p><p style={styles.driverMetricValue}>{estimatedETA}</p></div><div style={styles.driverMetricBox}><p style={styles.driverMetricLabel}>Distance</p><p style={styles.driverMetricValue}>{distanceText}</p></div></div>
                <div style={styles.driverInstructionCard}>{ambulancePos.isActive ? ( <><div style={styles.driverInstructionIcon}>{instructionIcon}</div><p style={styles.driverInstructionText}>{instructionText}</p></> ) : ( <><div style={styles.driverInstructionIcon}><FaFlagCheckered /></div><p style={styles.driverInstructionText}>You have arrived</p></> )}</div>
                <button onClick={() => window.location.href = '/'} style={{...globalStyles.secondaryButton, marginTop: 'auto'}}>End Trip</button>
            </div>
            <div style={styles.mapContainer}>
                <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={{ lat: ambulancePos.lat, lng: ambulancePos.lng }} zoom={16} options={{ styles: mapStyles, disableDefaultUI: true, zoomControl: true }}>
                    {signals.map(signal => (<MarkerF key={signal.id} position={{ lat: signal.lat, lng: signal.lng }} icon={junctionIcon} title={signal.name} />))}
                    <MarkerF position={{ lat: destination.lat, lng: destination.lng }} icon={hospitalIcon} title={destination.name} />
                    <MarkerF position={{ lat: ambulancePos.lat, lng: ambulancePos.lng }} icon={ambulanceIcon} zIndex={100} />
                    <Polyline path={trackerPath.map(p => ({ lat: p[0], lng: p[1] }))} options={{ strokeColor: '#4285F4', strokeWeight: 6, zIndex: 1 }} />                </GoogleMap>
            </div>
        </>
    );
};

function DriverDashboard() {
    const query = new URLSearchParams(useLocation().search);
    const destKey = query.get('dest') || 'manipal_hosp';
    const destination = HOSPITAL_OPTIONS.find(h => h.value === destKey);
    return ( <div style={styles.container}>{destination ? <MapSimulation destination={destination} /> : <h2>Error: Destination not found.</h2>}</div> );
}

export default DriverDashboard;