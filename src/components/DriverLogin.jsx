// src/components/DriverLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalStyles as styles } from '../Styles/AppStyles';
import MARGAILogo from './MARGAILogo';
import { useSimulation } from '../hooks/useSimulation'; // Import Hook

function DriverLogin() {
    const navigate = useNavigate();
    const [id, setId] = useState('');
    const [pass, setPass] = useState('');
    const { endEmergency } = useSimulation(); // Get reset function

    const handleLogin = () => {
        if (!id || !pass) {
            alert("Please enter ID and Password.");
            return;
        }

        // RESET STATE on Login: Ensure we start fresh
        // detailed cleanup to ensure no residual "Navigating" state
        endEmergency();

        // Direct navigation to Dashboard (now guaranteed Idle)
        navigate(`/driver/navigation`);
    };

    return (
        <div style={styles.centeredPageContainer}>
            <div style={styles.card}>
                <MARGAILogo />
                <h3 style={styles.heading}>Vehicle Driver Login</h3>
                <input
                    type="text"
                    placeholder="Driver ID"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    style={styles.input}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    style={styles.input}
                />

                <button onClick={handleLogin} style={{ ...styles.primaryButton, marginTop: '20px' }} >
                    Login to Dashboard
                </button>
            </div>
        </div>
    );
}

export default DriverLogin;