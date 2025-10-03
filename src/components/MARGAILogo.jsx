// src/components/MARGAILogo.jsx
import React from 'react';

// THIS IS THE FIX: The 'styles' object must be defined BEFORE the component uses it.
const styles = {
    logoContainer: {
        textAlign: 'center',
        marginBottom: '30px',
    },
    text: {
        fontSize: '40px',
        fontWeight: '700',
        margin: 0,
        background: 'linear-gradient(90deg, var(--primary-blue), var(--accent-cyan))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    tagline: {
        fontSize: '14px',
        color: 'var(--text-secondary)',
        margin: '5px 0 0 0',
        fontStyle: 'italic',
        fontWeight: '400'
    }
};

function MARGAILogo() {
    return (
        <div style={styles.logoContainer}>
            <h1 style={styles.text}>MARG-AI</h1>
            <p style={styles.tagline}>Intelligent Route Guidance</p>
        </div>
    );
}

export default MARGAILogo;