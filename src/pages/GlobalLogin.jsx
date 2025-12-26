// src/pages/GlobalLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { globalStyles as styles, formStyles } from '../Styles/AppStyles';
import MARGAILogo from '../components/MARGAILogo';
import { useSimulation } from '../hooks/useSimulation';

function GlobalLogin() {
    const navigate = useNavigate();
    const { endEmergency } = useSimulation(); // Reset simulation on login
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!formData.email || !formData.password) {
            alert("Please enter Email and Password.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Store User Data
                localStorage.setItem('marg_user', JSON.stringify(data.user));

                // Clear any lingering simulation state if Driver
                endEmergency();

                // Redirect based on Role
                switch (data.user.role) {
                    case 'driver':
                        navigate('/driver/dashboard'); // Will create this route or map existing to it
                        break;
                    case 'admin':
                        navigate('/admin');
                        break;
                    case 'police':
                        navigate('/police');
                        break;
                    case 'hospital':
                        navigate('/hospital');
                        break;
                    default:
                        alert("Unknown Role: " + data.user.role);
                }
            } else {
                alert(data.message || "Login Failed");
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Server Error. Ensure Backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.centeredPageContainer}>
            <div style={formStyles.formContainer}>
                <MARGAILogo />
                <h3 style={formStyles.header}>MargAI Login</h3>

                <div style={formStyles.inputGroup}>
                    <label style={formStyles.label}>Email Address</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={styles.input}
                        placeholder="name@example.com"
                    />
                </div>

                <div style={formStyles.inputGroup}>
                    <label style={formStyles.label}>Password</label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        style={styles.input}
                        placeholder="••••••••"
                    />
                </div>

                <button onClick={handleLogin} style={{ ...styles.primaryButton, marginTop: '20px' }} disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                <p style={{ textAlign: 'center', marginTop: '15px', color: 'var(--text-secondary)' }}>
                    New here? <Link to="/signup" style={{ color: 'var(--primary-blue)', textDecoration: 'none' }}>Create Account</Link>
                </p>

                {/* Fallback for Demo without Backend */}
                {/* <button onClick={() => navigate('/driver/dashboard')} style={{ ...styles.secondaryButton, marginTop: '20px', fontSize: '12px' }}>
                    [DEV ONLY] Quick Driver Access
                </button> */}
            </div>
        </div>
    );
}

export default GlobalLogin;
