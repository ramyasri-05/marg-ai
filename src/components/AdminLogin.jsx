// src/components/AdminLogin.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { globalStyles as styles } from '../styles/AppStyles';
import MARGAILogo from './MARGAILogo.jsx';

function AdminLogin() {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/admin/dashboard');
    };
    
    const handleSignUp = () => {
        alert('Admin registration simulated! Please log in now.');
    };

    return (
        <div style={styles.centeredPageContainer}>
            <div style={styles.card}>
                <MARGAILogo />
                <h3 style={styles.heading}>Admin Control Login</h3>
                <input type="text" placeholder="Admin ID" style={styles.input} />
                <input type="password" placeholder="Password" style={styles.input} />
                
                <button onClick={handleLogin} style={styles.primaryButton}>Login</button>
                <p style={{ margin: '20px 0', color: 'var(--text-secondary)' }}>— New User? —</p>
                <button onClick={handleSignUp} style={styles.secondaryButton}>Sign Up</button>
            </div>
        </div>
    );
}

export default AdminLogin;