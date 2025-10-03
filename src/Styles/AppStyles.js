// src/styles/AppStyles.js

// --- Styles for Login, Role Selection, and Setup Screens ---
export const globalStyles = {
    // This is the main layout for all auth/login/setup pages
    centeredPageContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        fontFamily: "'Poppins', sans-serif",
        background: 'linear-gradient(135deg, #121212 0%, #1E1E1E 50%, #2A2A2A 100%)',
    },
    card: {
        backgroundColor: 'rgba(30, 30, 30, 0.7)',
        backdropFilter: 'blur(10px)',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        width: '420px',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    input: {
        width: '100%',
        padding: '14px 20px',
        margin: '10px 0',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        color: 'var(--text-primary)',
        border: '1px solid #444',
        borderRadius: '8px',
        fontSize: '16px',
        transition: 'border-color 0.2s, box-shadow 0.2s'
    },
    primaryButton: {
        width: '100%',
        padding: '14px',
        marginTop: '15px',
        background: 'linear-gradient(90deg, #007BFF, #00BFFF)',
        color: 'white',
        cursor: 'pointer',
        borderRadius: '8px',
        border: 'none',
        fontWeight: '600',
        fontSize: '16px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px'
    },
    secondaryButton: {
        width: '100%',
        padding: '14px',
        marginTop: '10px',
        backgroundColor: 'var(--secondary-gray)',
        color: 'white',
        cursor: 'pointer',
        borderRadius: '8px',
        border: 'none',
        fontWeight: '600',
        fontSize: '16px',
        transition: 'background-color 0.2s, transform 0.1s'
    },
    heading: {
        color: 'var(--text-primary)',
        marginBottom: '25px',
        fontWeight: '600'
    },
};

// --- Dashboard Specific Styles ---
export const dashboardStyles = {
    container: {
        display: 'flex',
        height: '100vh',
        fontFamily: "'Poppins', sans-serif",
        position: 'relative',
    },
    controlPanel: {
        width: '400px',
        minWidth: '400px',
        height: '100vh',
        padding: '25px',
        backgroundColor: 'var(--dark-surface)',
        color: 'var(--text-primary)',
        borderRight: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
        gap: '25px',
        overflowY: 'auto',
    },
    scrollableArea: {
        flexGrow: 1,
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--secondary-gray) var(--dark-card)',
    },
    header: {
        color: 'var(--accent-cyan)',
        paddingBottom: '10px',
        fontSize: '24px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        margin: 0
    },
    subHeader: {
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        fontSize: '12px',
        fontWeight: '600',
        letterSpacing: '1px',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    statCard: {
        backgroundColor: 'var(--dark-card)',
        padding: '15px',
        borderRadius: '10px',
        border: '1px solid #333',
    },
    driverMetricsContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px'
    },
    driverMetricBox: {
        backgroundColor: 'var(--dark-card)',
        padding: '15px',
        borderRadius: '10px',
        textAlign: 'center'
    },
    driverMetricLabel: {
        color: 'var(--text-secondary)',
        fontSize: '12px',
        textTransform: 'uppercase',
        margin: '0 0 5px 0'
    },
    driverMetricValue: {
        color: 'var(--accent-yellow)',
        fontSize: '24px',
        fontWeight: '600',
        margin: 0
    },
    driverInstructionCard: {
        backgroundColor: 'var(--primary-blue)',
        borderRadius: '12px',
        padding: '25px',
        textAlign: 'center',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    driverInstructionIcon: {
        fontSize: '80px',
        color: 'white',
        marginBottom: '15px'
    },
    driverInstructionText: {
        fontSize: '22px',
        fontWeight: '600',
        color: 'white',
        margin: 0
    },
    tripProgressContainer: {
        width: '100%',
        backgroundColor: 'var(--dark-card)',
        borderRadius: '10px',
        padding: '5px'
    },
    tripProgressBar: {
        height: '10px',
        backgroundColor: 'var(--accent-green)',
        borderRadius: '5px',
        transition: 'width 0.5s ease-in-out'
    },
    statusText: {
        fontSize: '15px',
        margin: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    dataHighlight: {
        color: 'var(--accent-green)',
        fontWeight: 'bold'
    },
    signalEntry: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        padding: '12px',
        backgroundColor: 'var(--dark-card)',
        borderRadius: '8px',
        border: '1px solid #333',
        transition: 'background-color 0.2s'
    },
    overrideButton: {
        backgroundColor: 'transparent',
        color: 'var(--accent-yellow)',
        border: '1px solid var(--accent-yellow)',
        borderRadius: '6px',
        padding: '5px 10px',
        cursor: 'pointer',
        transition: 'background-color 0.2s, color 0.2s',
        fontSize: '12px',
    },
    activationButton: {
        padding: '15px',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: 'var(--accent-red)',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.3s, transform 0.2s'
    },
    eventLogContainer: {
        backgroundColor: 'var(--dark-card)',
        padding: '15px',
        borderRadius: '10px',
        border: '1px solid #333',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
    },
    eventLogContent: {
        flexGrow: 1,
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: '14px',
    },
    eventLogItem: {
        marginBottom: '8px',
        paddingBottom: '8px',
        borderBottom: '1px solid #333',
        color: 'var(--text-secondary)',
    },
    eventLogTimestamp: {
        color: 'var(--accent-cyan)',
        marginRight: '10px',
    },
    mapContainer: {
        flexGrow: 1,
        backgroundColor: 'var(--dark-bg)'
    },
};