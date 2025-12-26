// src/pages/Signup.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { globalStyles as styles, formStyles } from '../Styles/AppStyles';
import MARGAILogo from '../components/MARGAILogo';

function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'driver',
        name: '',
        vehicleId: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async () => {
        if (!formData.email || !formData.password || !formData.name) {
            alert("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            // Point to backend port 5000
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Signup Successful! Please Login.");
                navigate('/'); // Go to Login
            } else {
                alert(data.message || "Signup Failed");
            }
        } catch (error) {
            console.error("Signup Error:", error);
            alert("Server Error. Ensure Backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.centeredPageContainer}>
            <div style={formStyles.formContainer}>
                <MARGAILogo />
                <h2 style={formStyles.header}>Create Account</h2>

                <div style={formStyles.inputGroup}>
                    <label style={formStyles.label}>Full Name</label>
                    <input
                        type="text" name="name"
                        value={formData.name} onChange={handleChange}
                        style={styles.input} placeholder="John Doe"
                    />
                </div>

                <div style={formStyles.inputGroup}>
                    <label style={formStyles.label}>Email Address</label>
                    <input
                        type="email" name="email"
                        value={formData.email} onChange={handleChange}
                        style={styles.input} placeholder="name@example.com"
                    />
                </div>

                <div style={formStyles.inputGroup}>
                    <label style={formStyles.label}>Password</label>
                    <input
                        type="password" name="password"
                        value={formData.password} onChange={handleChange}
                        style={styles.input} placeholder="••••••••"
                    />
                </div>

                <div style={formStyles.inputGroup}>
                    <label style={formStyles.label}>Select Role</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {['driver', 'hospital', 'police', 'admin'].map(role => (
                            <button
                                key={role}
                                onClick={() => setFormData({ ...formData, role: role })}
                                style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: formData.role === role ? '1px solid var(--primary-blue)' : '1px solid rgba(255,255,255,0.1)',
                                    backgroundColor: formData.role === role ? 'rgba(41, 121, 255, 0.2)' : 'transparent',
                                    color: formData.role === role ? 'white' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>

                {formData.role === 'driver' && (
                    <div style={formStyles.inputGroup}>
                        <label style={formStyles.label}>Vehicle ID</label>
                        <input
                            type="text" name="vehicleId"
                            value={formData.vehicleId} onChange={handleChange}
                            style={styles.input} placeholder="AP 16 AB 1234"
                        />
                    </div>
                )}

                <button onClick={handleSignup} style={{ ...styles.primaryButton, marginTop: '20px' }} disabled={loading}>
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>

                <p style={{ textAlign: 'center', marginTop: '15px', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/" style={{ color: 'var(--primary-blue)', textDecoration: 'none' }}>Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;
