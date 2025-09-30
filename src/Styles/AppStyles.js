// src/styles/AppStyles.js
import React from 'react';

// --- Shared Styles for All Login/Setup Screens (Dark Background) ---
export const globalStyles = {
    loginContainer: { 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#1C2833', // Deep Blue-Black for modern interface
        fontFamily: 'Arial, sans-serif'
    },
    card: { 
        backgroundColor: '#FFFFFF', 
        padding: '35px', 
        borderRadius: '12px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)', 
        width: '350px', 
        textAlign: 'center' 
    },
    input: { 
        width: '100%', 
        padding: '12px', 
        margin: '10px 0', 
        border: '1px solid #D1D9E6', 
        borderRadius: '6px',
        boxSizing: 'border-box'
    },
    
    // --- Button Styles ---
    primaryButton: { 
        width: '100%', 
        padding: '12px', 
        marginTop: '15px', 
        backgroundColor: '#007BFF', 
        color: 'white', 
        cursor: 'pointer', 
        borderRadius: '8px', 
        border: 'none',
        fontWeight: 'bold',
        transition: 'background-color 0.2s, transform 0.1s'
    },
    secondaryButton: { 
        width: '100%', 
        padding: '12px', 
        backgroundColor: '#6C757D', 
        color: 'white', 
        cursor: 'pointer', 
        borderRadius: '8px', 
        border: 'none',
        fontWeight: 'bold',
        transition: 'background-color 0.2s, transform 0.1s'
    },
    heading: {
        color: '#333333',
        marginBottom: '20px'
    },
    logo: { 
        fontSize: '30px', 
        fontWeight: 'extrabold', 
        marginBottom: '25px', 
        color: '#0056B3',
        border: '2px solid #0056B3',
        padding: '10px'
    }
};

// --- Dashboard Specific Styles (Dark Theme for Control Room/Tracking) ---
export const dashboardStyles = {
    container: { display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },
    
    // Dark sidebar for a Control Panel/Cockpit feel
    controlPanel: { 
        width: '400px', 
        padding: '25px', 
        backgroundColor: '#2C3E50', // Deep Control Room Blue/Grey
        color: '#ECF0F1', // Light text
        boxShadow: '4px 0 15px rgba(0,0,0,0.5)',
        display: 'flex', 
        flexDirection: 'column',
        overflowY: 'auto'
    },
    header: { 
        color: '#00BFFF', 
        marginBottom: '20px', 
        borderBottom: '3px solid #00BFFF',
        paddingBottom: '10px'
    }, 
    subHeader: { 
        color: '#BDC3C7', 
        borderBottom: '1px solid #495460', 
        paddingBottom: '5px', 
        marginBottom: '10px' 
    },
    
    // Status and Data Styles
    statusText: { fontSize: '15px', marginBottom: '8px' },
    dataHighlight: { color: '#2ECC71', fontWeight: 'bold' },
    etaHighlight: { fontSize: '1.8em', color: '#F1C40F', fontWeight: 'bold' }, 
    
    signalEntry: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '8px', 
        padding: '10px',
        backgroundColor: '#34495E', 
        borderRadius: '6px',
        transition: 'background-color 0.2s'
    },
    
    // Hospital Specific Highlighting
    hospitalStatusBox: {
        padding: '15px', 
        border: '2px solid #E74C3C', // Red border for urgency
        borderRadius: '8px', 
        backgroundColor: '#34495E', 
        color: '#fff' 
    },
    mapContainer: { flexGrow: 1, backgroundColor: '#1E293B', border: '1px solid #ccc' }, // Dark background for map load
};