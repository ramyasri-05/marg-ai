// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { HOSPITAL_OPTIONS, MAP_CENTER } from '../data/mockCity';
import { globalStyles as styles } from '../Styles/AppStyles';
import { useSimulation } from '../hooks/useSimulation';
import { FaUserShield, FaChartLine, FaUsers, FaGlobeAmericas, FaCheck, FaTimes, FaCheckCircle } from 'react-icons/fa';

const containerStyle = {
    width: '100%',
    height: '100%'
};

// Mock Data
const PENDING_USERS = [
    { id: 1, name: 'John Doe', role: 'Driver', unit: 'DL-04 Ambulances', status: 'Pending' },
    { id: 2, name: 'Central Command', role: 'Police', unit: 'Traffic HQ', status: 'Pending' },
];

const ANALYTICS_DATA = [
    { label: 'Avg Response Time', value: '8.4 mins', trend: '-12%', color: 'var(--accent-green)' },
    { label: 'Total Emergencies', value: '1,240', trend: '+5%', color: 'var(--primary-blue)' },
    { label: 'Signal Clearance Efficiency', value: '94%', trend: '+2%', color: 'var(--accent-cyan)' },
];

function AdminDashboard() {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    const { emergencyState } = useSimulation();

    const [activeTab, setActiveTab] = useState('live');
    const [users, setUsers] = useState(PENDING_USERS);

    const verifyUser = (id) => {
        setUsers(users.map(u => u.id === id ? { ...u, status: 'Verified' } : u));
    };

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Top Bar */}
            <div style={{
                height: '70px',
                backgroundColor: 'rgba(20,20,20,0.95)',
                borderBottom: 'var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 30px'
            }}>
                <h2 style={{ ...styles.heading, fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaUserShield color="var(--primary-blue)" /> MARG-AI <span style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Central Governance</span>
                </h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {['live', 'governance', 'analytics'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: activeTab === tab ? 'var(--primary-blue)' : 'transparent',
                                color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab === 'live' && <FaGlobeAmericas style={{ marginRight: '8px' }} />}
                            {tab === 'governance' && <FaUsers style={{ marginRight: '8px' }} />}
                            {tab === 'analytics' && <FaChartLine style={{ marginRight: '8px' }} />}
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

                {/* LIVE MAP VIEW */}
                {activeTab === 'live' && (
                    <div style={{ width: '100%', height: '100%' }}>
                        {isLoaded && (
                            <GoogleMap
                                mapContainerStyle={containerStyle}
                                center={{ lat: MAP_CENTER[0], lng: MAP_CENTER[1] }}
                                zoom={12}
                                options={{
                                    disableDefaultUI: true,
                                    styles: [
                                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                                        { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
                                        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
                                        { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }
                                    ]
                                }}
                            >
                                {/* Show All Hospitals */}
                                {HOSPITAL_OPTIONS.map(h => (
                                    <MarkerF key={h.value} position={{ lat: h.lat, lng: h.lng }} title={h.name} />
                                ))}

                                {/* Show Active Ambulance from Simulation */}
                                {emergencyState.isActive && emergencyState.currentLocation && (
                                    <MarkerF
                                        position={emergencyState.currentLocation}
                                        icon={{
                                            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                            scale: 6,
                                            fillColor: emergencyState.severity === 'CRITICAL' ? '#FF1744' : '#FFD600',
                                            fillOpacity: 1, // Full opacity
                                            strokeColor: 'white',
                                            strokeWeight: 2,
                                            anchor: new window.google.maps.Point(0, 2.5) // Center
                                        }}
                                    />
                                )}
                            </GoogleMap>
                        )}
                        <div style={{
                            position: 'absolute', bottom: '30px', left: '30px',
                            backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
                            padding: '20px', borderRadius: '16px', border: 'var(--glass-border)'
                        }}>
                            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)' }}>System Status</h4>
                            <div style={{ display: 'flex', gap: '30px' }}>
                                <div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-green)' }}>
                                        {emergencyState.isActive ? '1' : '0'}
                                    </div>
                                    <div style={{ fontSize: '12px' }}>Active Ops</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-red)' }}>
                                        {emergencyState.severity === 'CRITICAL' ? '1' : '0'}
                                    </div>
                                    <div style={{ fontSize: '12px' }}>Critical Alerts</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* GOVERNANCE VIEW */}
                {activeTab === 'governance' && (
                    <div style={{ padding: '50px', maxWidth: '1000px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '28px', marginBottom: '30px' }}>User Verification Queue</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {users.map(user => (
                                <div key={user.id} style={{
                                    backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'var(--glass-border)'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{user.name}</div>
                                        <div style={{ color: 'var(--text-secondary)' }}>{user.role} • {user.unit}</div>
                                    </div>
                                    {user.status === 'Pending' ? (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => verifyUser(user.id)}
                                                style={{ ...styles.primaryButton, padding: '8px 16px', background: 'var(--accent-green)', fontSize: '14px', display: 'flex', gap: '8px' }}
                                            >
                                                <FaCheck /> Verify
                                            </button>
                                            <button style={{ ...styles.secondaryButton, padding: '8px 16px', fontSize: '14px', display: 'flex', gap: '8px', color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}>
                                                <FaTimes /> Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ color: 'var(--accent-green)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FaCheckCircle /> Verified
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ANALYTICS VIEW */}
                {activeTab === 'analytics' && (
                    <div style={{ padding: '50px', maxWidth: '1200px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '28px', marginBottom: '30px' }}>System Performance Analytics</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                            {ANALYTICS_DATA.map((stat, idx) => (
                                <div key={idx} style={{
                                    backgroundColor: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '16px', border: 'var(--glass-border)',
                                    display: 'flex', flexDirection: 'column', gap: '10px'
                                }}>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{stat.label}</div>
                                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
                                    <div style={{ color: stat.trend.includes('-') ? 'var(--accent-green)' : 'var(--accent-green)', fontSize: '14px' }}>
                                        {stat.trend} vs last month
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: '30px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                            <h3 style={{ marginTop: 0 }}>Emergency Response Log</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: 'var(--text-secondary)' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #444' }}>
                                        <th style={{ padding: '15px' }}>ID</th>
                                        <th style={{ padding: '15px' }}>Date</th>
                                        <th style={{ padding: '15px' }}>Type</th>
                                        <th style={{ padding: '15px' }}>Route Clearance</th>
                                        <th style={{ padding: '15px' }}>Outcome</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {emergencyState.history && emergencyState.history.length > 0 ? (
                                        emergencyState.history.map((log, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                <td style={{ padding: '15px' }}>{log.id}</td>
                                                <td style={{ padding: '15px' }}>{log.date}</td>
                                                <td style={{ padding: '15px' }}>{log.type}</td>
                                                <td style={{ padding: '15px', color: 'var(--accent-green)' }}>{log.duration}</td>
                                                <td style={{ padding: '15px' }}>{log.outcome}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '30px', textAlign: 'center', opacity: 0.5 }}>
                                                No completed emergencies in session history.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
