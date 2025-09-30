// src/components/MARGAILogo.jsx
import React from 'react';

function MARGAILogo() {
    return (
        <div style={styles.logoContainer}>
            <div style={styles.icon}>
                {/* Ambulance Symbol (A stylized 'A' for Aid/Ambulance) */}
                <span style={styles.aidSymbol}>A</span> 
                {/* AI Pulse (A stylized 'M' or graph line) */}
                <div style={styles.pulse}></div>
            </div>
            <h1 style={styles.text}>MARG-AI</h1>
            <p style={styles.tagline}>Intelligent Route Guidance</p>
        </div>
    );
}

const styles = {
    logoContainer: {
        textAlign: 'center',
        marginBottom: '35px',
        padding: '15px',
        border: '3px solid #0056B3', // Bold border
        borderRadius: '10px',
        backgroundColor: '#F0F5FF', // Very light blue background
        boxShadow: '0 4px 15px rgba(0, 86, 179, 0.2)',
    },
    icon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 5px',
    },
    aidSymbol: {
        fontSize: '40px',
        fontWeight: '900',
        color: '#dc3545', // Emergency Red
        marginRight: '5px',
        textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
    },
    pulse: {
        width: '30px',
        height: '5px',
        backgroundColor: '#0056B3', // AI Blue
        borderRadius: '3px',
        boxShadow: '0 0 8px #0056B3',
        animation: 'pulse 1.5s infinite alternate', // Simple pulsing animation
    },
    text: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#333',
        margin: '5px 0 0',
    },
    tagline: {
        fontSize: '12px',
        color: '#666',
        marginTop: '3px',
        fontStyle: 'italic',
    }
};

// CRITICAL: Since you are using animation, ensure you add this basic CSS
// to your src/index.css file, or the animation won't work:
/*
@keyframes pulse {
    0% { transform: scaleX(0.8); opacity: 0.7; }
    100% { transform: scaleX(1.2); opacity: 1; }
}
*/

export default MARGAILogo;