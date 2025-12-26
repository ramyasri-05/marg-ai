// src/pages/ControlDashboard.jsx
import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, DirectionsRenderer } from '@react-google-maps/api';
import { HOSPITAL_OPTIONS, MAP_CENTER } from '../data/mockCity';
import { useSimulation } from '../hooks/useSimulation';
import { globalStyles as styles } from '../Styles/AppStyles';
import { FaUserShield, FaTrafficLight, FaCheckCircle, FaMapMarkerAlt, FaExclamationCircle } from 'react-icons/fa';

const containerStyle = {
    width: '100%',
    height: '100vh'
};

// Mock Signals along a generic path
const MOCK_SIGNALS = [
    { id: 'SIG-01', lat: 16.5085, lng: 80.6420, label: 'Benz Circle' },
    { id: 'SIG-02', lat: 16.5105, lng: 80.6350, label: 'MG Road Jcn' },
    { id: 'SIG-03', lat: 16.5125, lng: 80.6250, label: 'Police Control' }
];

function ControlDashboard({ role }) {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    const { emergencyState, toggleGreenCorridor } = useSimulation();

    const [directions, setDirections] = useState(null);
    const [signalStates, setSignalStates] = useState({});
    const [personnelDeployed, setPersonnelDeployed] = useState(false);

    // Initialize random signal states
    useEffect(() => {
        const initialStates = {};
        MOCK_SIGNALS.forEach(sig => initialStates[sig.id] = Math.random() > 0.5 ? 'RED' : 'GREEN');
        setSignalStates(initialStates);
    }, []);

    // Sync Signal State with Green Corridor
    useEffect(() => {
        if (emergencyState.greenCorridor) {
            const allGreen = {};
            MOCK_SIGNALS.forEach(sig => allGreen[sig.id] = 'GREEN');
            setSignalStates(allGreen);
        }
    }, [emergencyState.greenCorridor]);

    // Calculate route when emergency is active
    useEffect(() => {
        if (!emergencyState.isActive || !isLoaded) return;

        const destObj = emergencyState.destination ? emergencyState.destination : HOSPITAL_OPTIONS[0];

        const directionsService = new window.google.maps.DirectionsService();
        // Simulating a start point slightly away from the hospital for demo
        const origin = { lat: 16.508, lng: 80.648 }; // Consistent start point

        directionsService.route({
            origin: origin,
            destination: { lat: destObj.lat, lng: destObj.lng },
            travelMode: window.google.maps.TravelMode.DRIVING
        }, (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
                setDirections(result);
            }
        });
    }, [emergencyState.isActive, isLoaded, emergencyState.destination]);

    const handleSignalClick = (sigId) => {
        setSignalStates(prev => ({
            ...prev,
            [sigId]: prev[sigId] === 'RED' ? 'GREEN' : 'RED'
        }));
    };

    const handleDeploy = () => {
        setPersonnelDeployed(true);
        alert(`Personnel deployed to assist ${emergencyState.vehicle}.`);
    };

    if (loadError) return <div style={{ ...styles.centeredPageContainer, color: 'var(--accent-red)' }}>Error loading maps.</div>;
    if (!isLoaded) return <div style={{ ...styles.centeredPageContainer }}><h2 style={styles.heading}>Loading Control Center...</h2></div>;

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex' }}>

            {/* Sidebar - Control Panel */}
            <div style={{
                width: '350px',
                height: '100%',
                backgroundColor: 'var(--dark-surface)',
                borderRight: 'var(--glass-border)',
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '4px 0 20px rgba(0,0,0,0.5)'
            }}>
                <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'linear-gradient(to right, rgba(41, 121, 255, 0.1), transparent)' }}>
                    <h2 style={{ ...styles.heading, textAlign: 'left', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaUserShield color="var(--primary-blue)" /> Traffic Control
                    </h2>
                    <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>Live Emergency Monitoring</p>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Active Emergencies</h3>

                    {emergencyState.isActive ? (
                        <div
                            style={{
                                padding: '16px',
                                marginBottom: '12px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(41, 121, 255, 0.15)',
                                border: '1px solid var(--primary-blue)',
                                cursor: 'default',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{emergencyState.vehicle}</span>
                                <span style={{
                                    fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold',
                                    backgroundColor: emergencyState.severity === 'CRITICAL' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(241, 196, 15, 0.2)',
                                    color: emergencyState.severity === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-yellow)'
                                }}>{emergencyState.severity}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                <FaMapMarkerAlt /> To: {emergencyState.destination?.name}
                            </div>
                            <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--accent-green)', fontWeight: 'bold' }}>
                                ETA: {emergencyState.eta}
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <FaExclamationCircle size={30} style={{ marginBottom: '10px', opacity: 0.5 }} />
                            <p>No active emergencies detected.</p>
                        </div>
                    )}
                </div>

                {emergencyState.isActive && (
                    <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                        <h4 style={{ margin: '0 0 15px 0' }}>Actions for {emergencyState.id}</h4>
                        <button
                            onClick={() => toggleGreenCorridor(true)}
                            disabled={emergencyState.greenCorridor}
                            style={{
                                ...styles.primaryButton,
                                background: emergencyState.greenCorridor ? 'rgba(46, 204, 113, 0.3)' : 'var(--accent-green)',
                                marginBottom: '10px',
                                cursor: emergencyState.greenCorridor ? 'default' : 'pointer'
                            }}
                        >
                            <FaTrafficLight /> {emergencyState.greenCorridor ? 'Green Corridor Active' : 'Activate Green Corridor'}
                        </button>
                        <button onClick={handleDeploy} disabled={personnelDeployed} style={{ ...styles.secondaryButton, opacity: personnelDeployed ? 0.6 : 1 }}>
                            {personnelDeployed ? <><FaCheckCircle /> Deployed</> : 'Deploy Personnel'}
                        </button>
                    </div>
                )}
            </div>

            {/* Map Area */}
            <div style={{ flex: 1, position: 'relative' }}>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={{ lat: MAP_CENTER[0], lng: MAP_CENTER[1] }}
                    zoom={13}
                    options={{
                        styles: [
                            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                            { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
                            { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
                            { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }
                        ]
                    }}
                >
                    {directions && (
                        <DirectionsRenderer
                            directions={directions}
                            options={{
                                polylineOptions: { strokeColor: 'var(--accent-green)', strokeWeight: 6 }
                            }}
                        />
                    )}

                    {/* LIVE AMBULANCE MARKER */}
                    {emergencyState.isActive && emergencyState.currentLocation && (
                        <MarkerF
                            position={emergencyState.currentLocation}
                            icon={{
                                path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                scale: 6,
                                fillColor: emergencyState.severity === 'CRITICAL' ? '#FF1744' : '#FFD600',
                                fillOpacity: 1,
                                strokeColor: 'white',
                                strokeWeight: 2,
                            }}
                            zIndex={100}
                        />
                    )}

                    {/* Show Mock Signals */}
                    {MOCK_SIGNALS.map(sig => (
                        <MarkerF
                            key={sig.id}
                            position={{ lat: sig.lat, lng: sig.lng }}
                            icon={{
                                path: window.google.maps.SymbolPath.CIRCLE,
                                scale: 8,
                                fillColor: signalStates[sig.id] === 'GREEN' ? '#00E676' : '#FF1744',
                                fillOpacity: 1,
                                strokeColor: 'white',
                                strokeWeight: 2,
                            }}
                            onClick={() => handleSignalClick(sig.id)}
                            title={`${sig.label}: ${signalStates[sig.id]}`}
                        />
                    ))}
                </GoogleMap>

                {/* Floating Legend */}
                <div style={{
                    position: 'absolute', top: '20px', right: '20px',
                    backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    padding: '10px 15px', borderRadius: '8px', color: 'white', fontSize: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00E676' }}></div> Signal Green
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF1744' }}></div> Signal Red
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ControlDashboard;