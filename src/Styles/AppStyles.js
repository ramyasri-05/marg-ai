// src/Styles/AppStyles.js

export const globalStyles = {
    centeredPageContainer: {
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent', // Handled by body background
        padding: '20px',
        position: 'relative',
    },
    card: {
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        backgroundColor: 'var(--dark-card)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)', // Safari support
        borderRadius: '20px',
        border: 'var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        boxSizing: 'border-box',
        animation: 'slideUp 0.6s ease-out',
    },
    heading: {
        color: 'var(--text-primary)',
        fontSize: '28px',
        fontWeight: '700',
        margin: '0',
        textAlign: 'center',
        letterSpacing: '0.5px',
    },
    subText: {
        color: 'var(--text-secondary)',
        fontSize: '15px',
        textAlign: 'center',
        margin: '-10px 0 10px 0',
        lineHeight: '1.5',
    },
    primaryButton: {
        width: '100%',
        padding: '16px',
        background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-hover) 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(41, 121, 255, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
    },
    secondaryButton: {
        width: '100%',
        padding: '14px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        color: 'var(--text-primary)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    input: {
        width: '100%',
        padding: '16px 20px',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        color: 'var(--text-primary)',
        fontSize: '16px',
        boxSizing: 'border-box',
        transition: 'border-color 0.3s',
        outline: 'none',
    },
};

export const formStyles = {
    // Reusing card style for consistency, but keeping this export for backward compatibility if needed
    formContainer: globalStyles.card,
    header: globalStyles.heading,
    subHeader: globalStyles.subText,
    input: globalStyles.input,
    label: {
        color: 'var(--text-secondary)',
        fontSize: '14px',
        marginBottom: '8px',
        display: 'block',
        fontWeight: '500',
    }
};

export const dashboardStyles = {
    container: {
        display: 'flex',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--dark-bg)', // Fallback
        color: 'var(--text-primary)',
    },
    header: {
        fontSize: '22px', 
        fontWeight: '600', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px'
    }
    // Add other dashboard-specific styles here if needed
};