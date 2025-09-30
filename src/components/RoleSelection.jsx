// src/components/RoleSelection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { globalStyles as styles } from '../styles/AppStyles'; // Import the new global styles
import MARGAILogo from './MARGAILogo.jsx'; // Import the custom logo component

function RoleSelection() {
    const navigate = useNavigate();

    const handleRoleSelect = (role) => {
        // Map button clicks to their unique login routes
        if (role === 'Driver') {
            navigate('/driver/login');
        } else if (role === 'Police') {
            navigate('/police/login');
        } else if (role === 'Admin') { 
            navigate('/admin/login');
        } else if (role === 'Hospital') { 
            navigate('/hospital/login');
        } else {
            alert(`${role} Dashboard - Not Configured`);
        }
    };

    const roleButtons = ['Driver', 'Police', 'Hospital', 'Admin'];

    return (
        <div style={styles.loginContainer}>
            <div 
                style={styles.card}
                // Subtle animation on hover
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
            >
                {/* 1. LOGO */}
                <MARGAILogo /> 
                
                {/* 2. ROLE SELECTION */}
                <h3 style={styles.heading}>Select your Role</h3>
                
                {roleButtons.map(role => (
                    <button 
                        key={role} 
                        style={styles.primaryButton}
                        onClick={() => handleRoleSelect(role)}
                        // Enhanced button hover effects
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0069D9'} 
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007BFF'}
                    >
                        {role}
                    </button>
                ))}
            </div>
        </div>
    );
}

// NOTE: The 'styles' object is imported from '../styles/AppStyles', so 
// the styling definitions are not included here.

export default RoleSelection;