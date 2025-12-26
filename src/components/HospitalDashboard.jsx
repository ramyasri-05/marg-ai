// src/components/HospitalDashboard.jsx
import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, DirectionsRenderer } from '@react-google-maps/api';
import { HOSPITAL_OPTIONS, MAP_CENTER } from '../data/mockCity';
import { globalStyles as styles } from '../Styles/AppStyles';
import { useSimulation } from '../hooks/useSimulation';
import { FaHospital, FaAmbulance, FaProcedures, FaUserMd, FaSyringe, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const containerStyle = {
    width: '100%',
    height: '100vh'
};

function HospitalDashboard() {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    const { emergencyState } = useSimulation();

    const [selectedPatient, setSelectedPatient] = useState(null);
    const [hospitalPrep, setHospitalPrep] = useState({}); // { 'PAT-ID': { bed: true... } }
    const [directions, setDirections] = useState(null);

    // Auto-select patient when simulation starts
    useEffect(() => {
        if (emergencyState.isActive) {
            setSelectedPatient(emergencyState);
        } else {
            setSelectedPatient(null);
        }
    }, [emergencyState.isActive]);

    // Helper to get current prep status
    const currentPrep = selectedPatient && hospitalPrep[selectedPatient.id] ? hospitalPrep[selectedPatient.id] : { bed: false, team: false, equipment: false };
    const prepPercentage = Object.values(currentPrep).filter(Boolean).length / 3 * 100;

    const togglePrep = (type) => {
        if (!selectedPatient) return;
        setHospitalPrep(prev => ({
            ...prev,
            [selectedPatient.id]: {
                ...prev[selectedPatient.id],
                [type]: !currentPrep[type]
            }
        }));
    };

    // Calculate simulated route
    useEffect(() => {
        if (!selectedPatient || !isLoaded) return;

        // Use simulation destination or default to first hospital
        const destObj = selectedPatient.destination ? selectedPatient.destination : HOSPITAL_OPTIONS[0];

        const directionsService = new window.google.maps.DirectionsService();
        // Simulate start point
        const origin = { lat: destObj.lat - 0.03, lng: destObj.lng - 0.03 };

        directionsService.route({
            origin: origin,
            destination: { lat: destObj.lat, lng: destObj.lng },
            travelMode: window.google.maps.TravelMode.DRIVING
        }, (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
                setDirections(result);
            }
        });
    }, [selectedPatient, isLoaded]);

    if (loadError) return <div style={{ ...styles.centeredPageContainer, color: 'var(--accent-red)' }}>Error loading maps.</div>;
    if (!isLoaded) return <div style={{ ...styles.centeredPageContainer }}><h2 style={styles.heading}>Loading Medical Command...</h2></div>;

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', display: 'flex' }}>

            {/* Sidebar - Medical Command */}
            <div style={{
                width: '380px',
                height: '100%',
                backgroundColor: 'var(--dark-surface)',
                borderRight: 'var(--glass-border)',
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '4px 0 30px rgba(0,0,0,0.6)'
            }}>
                <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'linear-gradient(to right, rgba(231, 76, 60, 0.1), transparent)' }}>
                    <h2 style={{ ...styles.heading, textAlign: 'left', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaHospital color="var(--accent-red)" /> Emergency Bay
                    </h2>
                    <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>Live Incoming Arrivals</p>
                </div>

                <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '15px' }}>Incoming Ambulances</h3>

                    {emergencyState.isActive ? (
                        <div
                            onClick={() => setSelectedPatient(emergencyState)}
                            style={{
                                padding: '16px',
                                marginBottom: '12px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                borderLeft: `4px solid ${emergencyState.severity === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-green)'}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <FaAmbulance color="var(--text-secondary)" />
                                    <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{emergencyState.vehicle}</span>
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Live Emergency</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '16px', color: emergencyState.severity === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                                    {emergencyState.eta}
                                </div>
                                <div style={{ fontSize: '11px', color: 'gray' }}>ETA</div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'gray', marginTop: '20px' }}>No Incoming Patients</div>
                    )}
                </div>

                {/* Preparation Panel */}
                <div style={{ padding: '24px', backgroundColor: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h4 style={{ margin: 0, fontSize: '16px' }}>Preparation Status</h4>
                        <span style={{
                            fontWeight: 'bold',
                            color: prepPercentage === 100 ? 'var(--accent-green)' : 'var(--accent-yellow)',
                            fontSize: '18px'
                        }}>{Math.round(prepPercentage)}% Ready</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            onClick={() => togglePrep('bed')}
                            disabled={!selectedPatient}
                            style={{ ...styles.secondaryButton, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: currentPrep.bed ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)', opacity: selectedPatient ? 1 : 0.5 }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaProcedures /> Allocate ICU Bed</span>
                            {currentPrep.bed && <FaCheckCircle color="var(--accent-green)" />}
                        </button>
                        <button
                            onClick={() => togglePrep('team')}
                            disabled={!selectedPatient}
                            style={{ ...styles.secondaryButton, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: currentPrep.team ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)', opacity: selectedPatient ? 1 : 0.5 }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaUserMd /> Alert Trauma Team</span>
                            {currentPrep.team && <FaCheckCircle color="var(--accent-green)" />}
                        </button>
                        <button
                            onClick={() => togglePrep('equipment')}
                            disabled={!selectedPatient}
                            style={{ ...styles.secondaryButton, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: currentPrep.equipment ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)', opacity: selectedPatient ? 1 : 0.5 }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FaSyringe /> Prep Equipment</span>
                            {currentPrep.equipment && <FaCheckCircle color="var(--accent-green)" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Map Area */}
            <div style={{ flex: 1, position: 'relative' }}>
                <div style={{
                    position: 'absolute', top: '20px', left: '20px', right: '20px', zIndex: 10,
                    display: 'flex', justifyContent: 'center'
                }}>
                    {(selectedPatient?.severity === 'CRITICAL' || (selectedPatient?.eta && (selectedPatient.eta.startsWith('1 min') || selectedPatient.eta.startsWith('2 min') || selectedPatient.eta.includes('sec')))) && (
                        <div style={{
                            backgroundColor: selectedPatient?.severity === 'CRITICAL' ? 'rgba(231, 76, 60, 0.9)' : 'rgba(243, 156, 18, 0.9)',
                            color: 'white', padding: '10px 20px', borderRadius: '30px',
                            fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px',
                            boxShadow: '0 0 20px rgba(0,0,0, 0.5)',
                            animation: 'pulse 1s infinite'
                        }}>
                            <FaExclamationCircle />
                            {selectedPatient?.severity === 'CRITICAL' ? `CRITICAL PATIENT INBOUND - ETA ${selectedPatient.eta}` : `PRE-ARRIVAL ALERT - ETA ${selectedPatient.eta}`}
                        </div>
                    )}
                </div>

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
                                polylineOptions: { strokeColor: selectedPatient?.severity === 'CRITICAL' ? '#E74C3C' : '#2ECC71', strokeWeight: 6 }
                            }}
                        />
                    )}

                    {/* Hospital Marker */}
                    {HOSPITAL_OPTIONS.map(hospital => (
                        <MarkerF
                            key={hospital.value}
                            position={{ lat: hospital.lat, lng: hospital.lng }}
                            title={hospital.name}
                        />
                    ))}
                </GoogleMap>
            </div>
        </div>
    );
}

export default HospitalDashboard;