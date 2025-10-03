// src/components/DriverSetup.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HOSPITAL_OPTIONS, ROUTES_MOCK } from '../data/mockCity';
// CHANGE: The styles are imported as 'styles'
import { globalStyles as styles } from '../styles/AppStyles';
import MARGAILogo from './MARGAILogo';

function DriverSetup() {
    const navigate = useNavigate();
    const location = useLocation();

    const query = new URLSearchParams(location.search);
    const destinationValue = query.get('dest');

    const availableRoutes = ROUTES_MOCK[destinationValue] || {};
    const firstRouteKey = Object.keys(availableRoutes)[0];

    const destinationHospital = HOSPITAL_OPTIONS.find(h => h.value === destinationValue);

    const [selectedRouteKey, setSelectedRouteKey] = useState(firstRouteKey);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        const routesForDest = ROUTES_MOCK[destinationValue] || {};
        const firstKey = Object.keys(routesForDest)[0];
        setSelectedRouteKey(firstKey);
    }, [destinationValue]);

    if (!destinationHospital || !firstRouteKey) {
        // This will now correctly show if the destination in the URL is invalid
        return (
            <div style={styles.centeredPageContainer}>
                <p style={{color: 'white', fontSize: '18px'}}>Error: Invalid destination or no routes found for the selected hospital.</p>
            </div>
        );
    }

    const activeRouteData = availableRoutes[selectedRouteKey];

    const handleStartNavigation = () => {
        // This navigation is incorrect, it should pass the route key for the specific hospital
        const routeKeyForNav = `${destinationValue}_${selectedRouteKey}`;
        navigate(`/driver/navigation?route=${selectedRouteKey}&dest=${destinationValue}`);
    };

    return (
        // CHANGE: Fixed the reference from 'globalStyles' to 'styles'
        <div style={styles.centeredPageContainer}>
            <div style={{...styles.card, position: 'relative'}}>
                <MARGAILogo />
                <h3 style={styles.heading}>Route Setup</h3>

                <div style={internalStyles.destinationInfo}>
                    <p style={{margin: 0, color: 'var(--text-secondary)'}}>DESTINATION</p>
                    <h4 style={{margin: '5px 0', color: 'var(--text-primary)'}}>{destinationHospital.name}</h4>
                    <p style={{margin: 0, fontSize: '14px', color: 'var(--text-secondary)'}}>({destinationHospital.address})</p>
                </div>

                <hr style={{ border: 'none', borderBottom: '1px solid #333', margin: '25px 0' }}/>

                <h4 style={{...styles.heading, fontSize: '18px', textAlign: 'left'}}>Available Routes</h4>

                {Object.entries(availableRoutes).map(([key, route]) => (
                    <div
                        key={key}
                        style={{
                           ...internalStyles.routeOption,
                           borderColor: selectedRouteKey === key ? 'var(--primary-blue)' : '#333',
                           backgroundColor: selectedRouteKey === key ? 'rgba(0, 123, 255, 0.1)' : 'var(--dark-card)',
                        }}
                        onClick={() => setSelectedRouteKey(key)}
                    >
                        <input
                            type="radio"
                            name="route"
                            value={key}
                            checked={selectedRouteKey === key}
                            onChange={() => setSelectedRouteKey(key)}
                            style={{marginRight: '10px', accentColor: 'var(--primary-blue)'}}
                        />
                        <label htmlFor={`route-${key}`} style={{width: '100%', cursor: 'pointer'}}>
                           <strong>{route.name}</strong>
                           <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)'}}>
                               <span>{route.distance}</span>
                               <span>ETA: {route.time}</span>
                           </div>
                        </label>
                    </div>
                ))}

                <button
                    onClick={() => setShowConfirmation(true)}
                    style={{...styles.primaryButton, backgroundColor: 'var(--accent-red)', marginTop: '25px'}}
                >
                    ACTIVATE MARG-AI SYSTEM
                </button>

                {showConfirmation && (
                    <div style={internalStyles.confirmationBox}>
                        <h4 style={internalStyles.confirmationTitle}>Start Navigation?</h4>
                        <p style={internalStyles.confirmationText}>
                           Route: <strong>{activeRouteData.name}</strong>
                        </p>
                        <div style={internalStyles.buttonContainer}>
                            <button style={internalStyles.confirmButtonNo} onClick={() => setShowConfirmation(false)}>NO</button>
                            <button style={internalStyles.confirmButtonYes} onClick={handleStartNavigation}>YES</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const internalStyles = {
    destinationInfo: {
        padding: '15px',
        border: '1px solid #333',
        borderRadius: '8px',
        backgroundColor: 'var(--dark-card)',
        textAlign: 'left'
    },
    routeOption: {
        textAlign: 'left',
        padding: '12px',
        border: '2px solid #333',
        borderRadius: '8px',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background-color 0.2s',
    },
    confirmationBox: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '25px',
        border: '1px solid #444',
        borderRadius: '12px',
        backgroundColor: '#fff',
        zIndex: 10,
        boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        width: '90%',
        textAlign: 'center',
        color: '#333'
    },
    confirmationTitle: { margin: 0, color: '#111', fontWeight: '600' },
    confirmationText: { margin: '10px 0 20px 0', color: '#555' },
    buttonContainer: { display: 'flex', justifyContent: 'space-between', gap: '10px' },
    confirmButtonYes: { flex: 1, padding: '12px', backgroundColor: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
    confirmButtonNo: { flex: 1, padding: '12px', backgroundColor: 'var(--secondary-gray)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }
};

export default DriverSetup;