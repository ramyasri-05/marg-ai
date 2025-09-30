// src/components/DriverSetup.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HOSPITAL_OPTIONS, ROUTES_MOCK } from '../data/mockCity';
import { globalStyles as styles } from '../styles/AppStyles'; // Import styles

function DriverSetup() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const query = new URLSearchParams(location.search);
    const destinationValue = query.get('dest') || 'manipal_hosp';
    
    const destinationHospital = HOSPITAL_OPTIONS.find(h => h.value === destinationValue) || HOSPITAL_OPTIONS[0];

    const [selectedRouteKey, setSelectedRouteKey] = useState('highway'); 
    const [showConfirmation, setShowConfirmation] = useState(false);
    
    const activeRouteData = ROUTES_MOCK[selectedRouteKey];

    const handleStartNavigation = () => {
        // Redirect to the Driver's map view, passing the selected route
        navigate(`/driver/navigation?route=${selectedRouteKey}&dest=${destinationValue}`); 
    };

    return (
        <div style={styles.loginContainer}>
            <div style={styles.card}>
                <h3>Driver Destination Setup</h3>
                
                {/* 1. Destination Display */}
                <h4>Destination: <strong>{destinationHospital.name}</strong></h4>
                <p style={{fontSize: '14px'}}>({destinationHospital.address})</p>
                
                <hr style={{ margin: '15px 0' }}/>

                {/* 2. AI Route Optimization (Choose Best Path) */}
                <h4>AI Route Optimization (Choose Best Path)</h4>
                
                {Object.entries(ROUTES_MOCK).map(([key, route]) => (
                    <div key={key} style={internalStyles.routeOption}>
                        <input 
                            type="radio" 
                            name="route" 
                            value={key} 
                            checked={selectedRouteKey === key} 
                            onChange={(e) => setSelectedRouteKey(e.target.value)}
                            id={`route-${key}`}
                            style={{marginRight: '8px'}}
                        />
                        <label htmlFor={`route-${key}`}>
                            **{route.name}** ({route.distance}) - ETA: **{route.time}**
                        </label>
                    </div>
                ))}
                
                <button 
                    onClick={() => setShowConfirmation(true)} 
                    style={internalStyles.navigateButton}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                >
                    ACTIVATE MARG-AI SYSTEM
                </button>

                {/* 3. Confirmation Dialog (Wireframe Screen 2) */}
                {showConfirmation && (
                    <div style={internalStyles.confirmationBox}>
                        <h4>Start Navigation?</h4>
                        <p>Route: **{activeRouteData.name}**</p>
                        <button style={{...styles.primaryButton, width: '45%'}} onClick={handleStartNavigation}>YES</button>
                        <button style={{...styles.secondaryButton, width: '45%', marginLeft: '10px'}} onClick={() => setShowConfirmation(false)}>NO</button>
                    </div>
                )}
            </div>
        </div>
    );
}

const internalStyles = {
    // Styles specific to this component, reusing global structures
    navigateButton: { 
        width: '100%', padding: '12px', margin: '20px 0 10px', 
        backgroundColor: '#dc3545', color: 'white', cursor: 'pointer', 
        borderRadius: '5px', fontWeight: 'bold', border: 'none'
    },
    routeOption: { 
        textAlign: 'left', padding: '5px 0', borderBottom: '1px dotted #eee', 
        marginBottom: '8px', display: 'flex', alignItems: 'center' 
    },
    confirmationBox: { 
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        padding: '20px', border: '3px solid #007bff', borderRadius: '8px', 
        backgroundColor: 'white', zIndex: 10, boxShadow: '0 0 15px rgba(0,0,0,0.2)'
    },
};

export default DriverSetup;