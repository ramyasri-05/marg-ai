// src/components/HospitalLogin.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { globalStyles as styles } from '../Styles/AppStyles.js';
import MARGAILogo from './MARGAILogo.jsx';

function HospitalLogin() {
    const navigate = useNavigate();

    const handleLogin = () => {
        // Navigate to the hospital dashboard after login
        navigate('/hospital/dashboard');
    };

    return (
        // Use the simple centered layout container
        <div style={styles.centeredPageContainer}>
            <div style={styles.card}>
                <MARGAILogo />
                <h3 style={styles.heading}>Hospital Portal Login</h3>

                <input type="text" placeholder="Hospital ID" style={styles.input} />
                <input type="password" placeholder="Password" style={styles.input} />

                <button
                    onClick={handleLogin}
                    style={styles.primaryButton}
                >
                    Login
                </button>
            </div>
        </div>
    );
}

export default HospitalLogin;