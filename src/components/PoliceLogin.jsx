// src/components/PoliceLogin.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
// --- NEW IMPORT ---
import { globalStyles as styles } from '../styles/AppStyles'; // Import the new styles
// ------------------

function PoliceLogin() {
    const navigate = useNavigate();

    const handleLogin = () => {
        // ... (login logic)
        navigate('/police/dashboard'); 
    };

    const handleSignUp = () => {
        alert('Police registration simulated! Please log in now.');
    };

    return (
        // Use the imported styles object
        <div style={styles.loginContainer}> 
            <div style={styles.card}>
                <h3 style={styles.heading}>Police Login</h3>
                
                <input type="text" placeholder="Id" style={styles.input} />
                <input type="password" placeholder="Password" style={styles.input} />
                
                <button onClick={handleLogin} style={styles.loginButton}>Login</button>
                <p style={{ margin: '10px 0', color: '#6C757D' }}>— OR —</p>
                <button onClick={handleSignUp} style={styles.signUpButton}>Sign Up</button>
            </div>
        </div>
    );
}

export default PoliceLogin;