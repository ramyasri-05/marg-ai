// src/components/PoliceLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalStyles as styles } from '../Styles/AppStyles.js';
import { FaUserShield } from 'react-icons/fa';

function PoliceLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // In a real app, you'd have authentication logic here.
        // For this demo, we'll just navigate to the dashboard.
        navigate('/police/dashboard');
    };

    return (
        <div style={styles.centeredPageContainer}>
            <div style={styles.card}>
                <h3 style={{...styles.heading, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}><FaUserShield /> Police Login</h3>
                <form onSubmit={handleLogin}>
                    <input 
                        type="text" 
                        placeholder="Username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        style={styles.input}
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        style={styles.input}
                    />
                    <button type="submit" style={styles.primaryButton}>Login</button>
                </form>
            </div>
        </div>
    );
}

export default PoliceLogin;