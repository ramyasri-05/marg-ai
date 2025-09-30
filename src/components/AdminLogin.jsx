// src/components/AdminLogin.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/admin/dashboard'); 
    };
    
    const handleSignUp = () => {
        alert('Admin registration simulated! Please log in now.');
    };

    return (
        <div style={styles.loginContainer}>
            <div style={styles.card}>
                <h3>Admin Control Login</h3>
                <input type="text" placeholder="Admin ID" style={styles.input} />
                <input type="password" placeholder="Password" style={styles.input} />
                
                {/* LOGIN BUTTON */}
                <button onClick={handleLogin} style={styles.loginButton}>Login</button>
                <p style={{ margin: '10px 0' }}>— OR —</p>
                {/* SIGN UP BUTTON */}
                <button onClick={handleSignUp} style={styles.signUpButton}>Sign Up</button>
            </div>
        </div>
    );
}

const styles = {
    loginContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0' },
    card: { backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '300px', textAlign: 'center' },
    input: { width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '5px' },
    loginButton: { width: '100%', padding: '10px', marginTop: '15px', backgroundColor: '#343a40', color: 'white', cursor: 'pointer', borderRadius: '5px', border: 'none' },
    signUpButton: { width: '100%', padding: '10px', backgroundColor: '#6c757d', color: 'white', cursor: 'pointer', borderRadius: '5px', border: 'none' }
};

export default AdminLogin;