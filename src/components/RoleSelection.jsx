// src/components/RoleSelection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { globalStyles as styles } from '../Styles/AppStyles';
import MARGAILogo from './MARGAILogo.jsx';
import { FaCar, FaUserShield, FaHospital, FaCogs } from 'react-icons/fa';

function RoleSelection() {
    const navigate = useNavigate();

    const handleRoleSelect = (role) => {
        if (role === 'Driver') navigate('/driver/login');
        else if (role === 'Police') navigate('/police/login');
        else if (role === 'Admin') navigate('/admin/login');
        else if (role === 'Hospital') navigate('/hospital/login');
    };

    const roles = [
        { name: 'Driver', icon: <FaCar /> },
        { name: 'Police', icon: <FaUserShield /> },
        { name: 'Hospital', icon: <FaHospital /> },
        { name: 'Admin', icon: <FaCogs /> },
    ];

    return (
        <div style={styles.centeredPageContainer}>
            <div style={styles.card}>
                <MARGAILogo />
                <h3 style={{
                    ...styles.heading,
                    background: 'linear-gradient(45deg, var(--accent-cyan), var(--accent-purple))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '20px'
                }}>Select your Role</h3>
                {roles.map(role => (
                    <button key={role.name} style={styles.primaryButton} onClick={() => handleRoleSelect(role.name)}>
                        {role.icon}
                        {role.name}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default RoleSelection;