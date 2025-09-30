// src/components/DriverLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HOSPITAL_OPTIONS } from '../data/mockCity'; 

function DriverLogin() { // <--- FUNCTION START
    const navigate = useNavigate();
    const [destination, setDestination] = useState('manipal_hosp');
    const [id, setId] = useState('');
    const [pass, setPass] = useState('');

    // SCENARIO 1 (Planned Route - Go to Setup Page)
    const handleLoginAndPlanRoute = () => {
        if (!id || !pass || !destination) {
            alert("Please enter ID, Password, and select a Destination.");
            return;
        }
        navigate(`/driver/setup?dest=${destination}`); 
    };

    // SCENARIO 2 (AI Detection Only - Go to Map immediately)
    const handleAIBasedStart = () => {
        if (!id || !pass) {
            alert("Please enter ID and Password to identify the vehicle.");
            return;
        }
        navigate(`/driver/navigation?route=highway&dest=ai_detect`); 
    };
    
    const handleSignUp = () => {
        alert('Driver registration simulated! Proceeding to login.');
    };

    return ( // <--- RETURN START (Inside the function)
        <div style={styles.loginContainer}>
            <div style={styles.card}>
                <h3>Vehicle Driver Login</h3>
                
                {/* ID and Password Inputs */}
                <input type="text" placeholder="Driver ID" value={id} onChange={(e) => setId(e.target.value)} style={styles.input} />
                <input type="password" placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)} style={styles.input} />
                
                {/* Destination selection is optional */}
                <select style={styles.input} value={destination} onChange={(e) => setDestination(e.target.value)}>
                    <option value="">Select Destination Hospital (Scenario 1)</option>
                    {HOSPITAL_OPTIONS.map(hospital => (
                        <option key={hospital.value} value={hospital.value}>
                            {hospital.name} ({hospital.address})
                        </option>
                    ))}
                </select>
                
                {/* SCENARIO 1 BUTTON */}
                <button onClick={handleLoginAndPlanRoute} style={styles.loginButton}>Login & Plan Route (Scenario 1)</button>
                
                <p style={{ margin: '15px 0', fontWeight: 'bold' }}>— OR —</p>
                
                {/* SCENARIO 2 BUTTON: AI Detects -> Immediate Start */}
                <button onClick={handleAIBasedStart} style={styles.aiStartButton}>
                    Simulate AI Detection Start (Scenario 2)
                </button>
                
                <p style={{ margin: '10px 0' }}>— New User? —</p>
                <button onClick={handleSignUp} style={styles.signUpButton}>Sign Up</button>
            </div>
        </div>
    ); // <--- RETURN END (Inside the function)
} // <--- FUNCTION END

const styles = {
    loginContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0' },
    card: { backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '300px', textAlign: 'center' },
    input: { width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '5px' },
    loginButton: { width: '100%', padding: '10px', marginTop: '15px', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer', borderRadius: '5px', border: 'none' },
    aiStartButton: { width: '100%', padding: '10px', backgroundColor: '#6c757d', color: 'white', cursor: 'pointer', borderRadius: '5px', border: 'none', fontSize: '0.9em' },
    signUpButton: { width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', cursor: 'pointer', borderRadius: '5px', border: 'none' }
};

export default DriverLogin;