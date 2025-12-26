// src/pages/DriverDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, MarkerF } from '@react-google-maps/api';
import { HOSPITAL_OPTIONS, MAP_CENTER } from '../data/mockCity';
import { useSimulation } from '../hooks/useSimulation';
import { globalStyles as styles } from '../Styles/AppStyles';
import { FaSpinner, FaExclamationTriangle, FaRoad, FaClock, FaHeartbeat, FaBroadcastTower, FaMapMarkerAlt, FaHospital, FaTimes } from 'react-icons/fa';

const containerStyle = {
    width: '100%',
    height: '100vh'
};

const SEVERITY_LEVELS = {
    STABLE: { color: 'var(--accent-green)', label: 'Stable' },
    MEDIUM: { color: 'var(--accent-yellow)', label: 'Medium' },
    CRITICAL: { color: 'var(--accent-red)', label: 'Critical' }
};

const LIBRARIES = ['places'];

// Helper to calculate bearing between two points
const computeHeading = (lat1, lng1, lat2, lng2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const toDeg = (rad) => (rad * 180) / Math.PI;

    const dLon = toRad(lng2 - lng1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
        Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

    const heading = toDeg(Math.atan2(y, x));
    return (heading + 360) % 360;
};

// Helper: Distance Calculation
const getDistance = (from, to) => {
    const R = 6371;
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLon = (to.lng - from.lng) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Helper Component: Bottom Navigation
const BottomNav = ({ activeTab, setActiveTab }) => (
    <div style={{
        position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: 'rgba(20, 20, 20, 0.9)', backdropFilter: 'blur(10px)',
        borderRadius: '30px', padding: '5px', display: 'flex', gap: '5px',
        border: '1px solid rgba(255,255,255,0.1)', zIndex: 10
    }}>
        <button
            onClick={() => setActiveTab('emergency')}
            style={{
                padding: '10px 20px', borderRadius: '25px', border: 'none', cursor: 'pointer',
                backgroundColor: activeTab === 'emergency' ? 'var(--accent-red)' : 'transparent',
                color: activeTab === 'emergency' ? 'white' : 'var(--text-secondary)',
                fontWeight: 'bold', transition: 'all 0.3s'
            }}
        >
            🚨 Emergency
        </button>
        <button
            onClick={() => setActiveTab('history')}
            style={{
                padding: '10px 20px', borderRadius: '25px', border: 'none', cursor: 'pointer',
                backgroundColor: activeTab === 'history' ? 'var(--primary-blue)' : 'transparent',
                color: activeTab === 'history' ? 'white' : 'var(--text-secondary)',
                fontWeight: 'bold', transition: 'all 0.3s'
            }}
        >
            📜 History
        </button>
    </div>
);

function DriverDashboard() {
    // STATE: active tab ('emergency' or 'history')
    const [activeTab, setActiveTab] = useState('emergency');

    // STATE: View Mode ('IDLE', 'SEARCHING', 'NAVIGATING')
    const [viewMode, setViewMode] = useState('IDLE');

    // STATE: Search Logic
    const [hospitals, setHospitals] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchStatus, setSearchStatus] = useState('');

    // STATE: Navigation Logic
    const [destination, setDestination] = useState(null);
    const [directions, setDirections] = useState(null);
    const [routePath, setRoutePath] = useState([]);
    const [loadingMessage, setLoadingMessage] = useState('Loading map...');
    const [tripStats, setTripStats] = useState({ distance: '--', duration: '--' });
    const [map, setMap] = useState(null);

    // STATE: History (Mock for now, could fetch from backend)
    const [history, setHistory] = useState([]);

    const { emergencyState, startEmergency, updateSeverity, updateETA, updateLocation, addToHistory, endEmergency } = useSimulation();

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES
    });

    // EFFECT: Check if simulation is already active on load
    useEffect(() => {
        if (emergencyState.isActive && emergencyState.destination) {
            setDestination(emergencyState.destination);
            setViewMode('NAVIGATING');
            setActiveTab('emergency'); // Force emergency tab when navigating
        }
    }, [emergencyState.isActive]);

    // EFFECT: Load user history on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('marg_user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user.history) {
                    setHistory(user.history);
                }
            } catch (e) {
                console.error("Failed to load user history", e);
            }
        }
    }, []);

    // HANDLER: specific hospital selection
    const handleSelectHospital = (hospital) => {
        const dest = {
            name: hospital.name,
            value: hospital.id || 'custom',
            lat: hospital.lat,
            lng: hospital.lng
        };
        setDestination(dest);

        // Start Emergency Here
        startEmergency({
            vehicle: 'Ambulance Unit-1',
            destination: dest,
            severity: 'MEDIUM'
        });

        setViewMode('NAVIGATING');
    };

    // HANDLER: Start Emergency Button Click
    const handleStartEmergencyClick = () => {
        setViewMode('SEARCHING');
        setIsSearching(true);
        setSearchStatus('Updating nearby hospitals...');

        // 1. IMPROVEMENT: Show Static List Immediately (Instant Feedback)
        const initialRef = emergencyState.currentLocation || { lat: MAP_CENTER[0], lng: MAP_CENTER[1] };
        fallbackToStaticList(initialRef.lat, initialRef.lng);

        const geoOptions = {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const userLoc = new window.google.maps.LatLng(latitude, longitude);

                // 2. IMPROVEMENT: 20km Radius, Generic Type, Capture Status
                const service = new window.google.maps.places.PlacesService(document.createElement('div'));
                const request = {
                    location: userLoc,
                    radius: '20000', // 20km radius
                    type: ['hospital'] // Broadest category
                };

                service.nearbySearch(request, (results, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                        const formatted = results.map(place => {
                            const placeLoc = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
                            const dist = getDistance({ lat: latitude, lng: longitude }, placeLoc);
                            return {
                                id: place.place_id,
                                name: place.name,
                                lat: placeLoc.lat,
                                lng: placeLoc.lng,
                                address: place.vicinity,
                                rating: place.rating,
                                userRatingsTotal: place.user_ratings_total,
                                distance: dist
                            };
                        }).sort((a, b) => a.distance - b.distance);
                        setHospitals(formatted); // Update with real data
                        setIsSearching(false);
                    } else {
                        // 3. IMPROVEMENT: Specific Error Reporting
                        console.warn("Places Search Failed:", status);
                        setSearchStatus(`⚠️ API Status: ${status} (Using Default List)`);
                        setIsSearching(false);
                    }
                });
            },
            (err) => {
                console.error("Loc Error:", err);
                setSearchStatus('Location Access Denied. Using Default List.');
                setIsSearching(false);
            },
            geoOptions
        );
    };

    const fallbackToStaticList = (lat, lng) => {
        let sorted = [...HOSPITAL_OPTIONS];
        if (lat && lng) {
            const userLoc = { lat, lng };
            sorted = sorted.map(h => ({
                ...h, id: h.value, distance: getDistance(userLoc, h)
            })).sort((a, b) => a.distance - b.distance);
        } else {
            sorted = sorted.map(h => ({ ...h, id: h.value, distance: 0 }));
        }
        setHospitals(sorted);
    };

    // --- NAVIGATION LOGIC ---

    // Auto-Center Map Logic
    useEffect(() => {
        if (map && emergencyState.currentLocation && viewMode === 'NAVIGATING') {
            map.panTo(emergencyState.currentLocation);
        }
    }, [map, emergencyState.currentLocation, viewMode]);

    // Calculate Route
    useEffect(() => {
        if (!isLoaded || viewMode !== 'NAVIGATING' || !destination) return;

        setLoadingMessage('Calculating route...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const origin = { lat: latitude, lng: longitude };

                const directionsService = new window.google.maps.DirectionsService();
                directionsService.route({
                    origin: origin,
                    destination: { lat: destination.lat, lng: destination.lng },
                    travelMode: window.google.maps.TravelMode.DRIVING
                }, (result, status) => {
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        setDirections(result);
                        setTripStats({
                            distance: result.routes[0].legs[0].distance.text,
                            duration: result.routes[0].legs[0].duration.text
                        });
                        updateETA(result.routes[0].legs[0].duration.text);

                        // Extract Path
                        const path = [];
                        result.routes[0].legs[0].steps.forEach(step => {
                            step.path.forEach(p => path.push({ lat: p.lat(), lng: p.lng() }));
                        });
                        setRoutePath(path);
                    } else {
                        setLoadingMessage('Error: Could not calculate route.');
                    }
                });
            },
            () => setLoadingMessage('Error: Location access denied.')
        );
    }, [isLoaded, destination, viewMode]);

    // Movement Loop
    useEffect(() => {
        if (viewMode !== 'NAVIGATING' || !emergencyState.isActive || routePath.length === 0 || !directions) return;

        let currentIndex = 0;
        const totalPoints = routePath.length;
        const driveTimeMs = 60000;
        const intervalTime = 1000;
        const stepsPerTick = Math.max(1, Math.floor(totalPoints / (driveTimeMs / intervalTime)));

        const totalDistanceMeters = directions.routes[0].legs[0].distance.value;
        const totalDurationSeconds = directions.routes[0].legs[0].duration.value;

        const interval = setInterval(() => {
            const prevIndex = currentIndex;
            currentIndex += stepsPerTick;
            const progress = Math.min(currentIndex / totalPoints, 1);

            // Stats Update
            const remainingMeters = totalDistanceMeters * (1 - progress);
            const remainingSeconds = totalDurationSeconds * (1 - progress);
            setTripStats({
                distance: remainingMeters > 1000 ? (remainingMeters / 1000).toFixed(1) + " km" : Math.round(remainingMeters) + " m",
                duration: Math.ceil(remainingSeconds / 60) + " min"
            });
            updateETA(Math.ceil(remainingSeconds / 60) + " min");

            if (currentIndex >= totalPoints - 1) {
                currentIndex = totalPoints - 1;
                updateLocation(routePath[currentIndex].lat, routePath[currentIndex].lng, 0);
                addToHistory({
                    id: emergencyState.id,
                    date: new Date().toLocaleString(),
                    type: 'Medical Emergency',
                    duration: tripStats.duration,
                    outcome: 'Patient Delivered'
                });
                clearInterval(interval);
                endEmergency();
                setViewMode('IDLE');
                setRoutePath([]);
                setDirections(null);
                setDestination(null);
            } else {
                const pos = routePath[currentIndex];
                let heading = 0;
                if (currentIndex < totalPoints - 1) {
                    const next = routePath[currentIndex + 1];
                    heading = computeHeading(pos.lat, pos.lng, next.lat, next.lng);
                } else if (prevIndex < currentIndex) {
                    const prev = routePath[prevIndex];
                    heading = computeHeading(prev.lat, prev.lng, pos.lat, pos.lng);
                }
                updateLocation(pos.lat, pos.lng, heading);
            }
        }, intervalTime);

        return () => clearInterval(interval);
    }, [emergencyState.isActive, routePath, directions, viewMode]);

    if (loadError) return <div style={styles.centeredPageContainer}>Error loading maps.</div>;
    if (!isLoaded) return <div style={styles.centeredPageContainer}><FaSpinner className="fa-spin" size={40} color="var(--primary-blue)" /></div>;

    // --- RENDER: SEARCHING MODE (Emergency Tab) ---
    if (activeTab === 'emergency' && viewMode === 'SEARCHING') {
        return (
            <div style={styles.centeredPageContainer}>
                <div style={{ ...styles.card, maxWidth: '600px', width: '90%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={styles.heading}>Select Emergency Destination</h2>
                        <button onClick={() => setViewMode('IDLE')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><FaTimes size={20} /></button>
                    </div>

                    {(isSearching || searchStatus.includes('Error') || searchStatus.includes('Warning') || searchStatus.includes('⚠️')) && (
                        <div style={{ textAlign: 'center', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            {isSearching && <FaSpinner className="fa-spin" size={20} color="var(--primary-blue)" />}
                            <span style={{ color: searchStatus.includes('Error') || searchStatus.includes('⚠️') ? 'var(--accent-red)' : 'var(--text-secondary)', fontSize: '14px' }}>
                                {searchStatus}
                            </span>
                        </div>
                    )}

                    <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {hospitals.map(h => (
                            <div
                                key={h.id}
                                onClick={() => handleSelectHospital(h)}
                                style={{
                                    padding: '15px', marginBottom: '10px', borderRadius: '12px',
                                    backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px'
                                }}
                            >
                                <div style={{ padding: '10px', borderRadius: '50%', backgroundColor: 'rgba(41, 121, 255, 0.2)' }}>
                                    <FaHospital color="var(--primary-blue)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <h4 style={{ margin: 0, color: 'white' }}>{h.name}</h4>
                                        <span style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: 'bold' }}>
                                            {h.distance ? h.distance.toFixed(1) + ' km' : ''}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        {h.address || "Address unavailable"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: HISTORY TAB ---
    if (activeTab === 'history') {
        const displayHistory = history.length > 0 ? history : [
            // Fallback Mock Data if no history found
            { id: 1, date: '2023-10-25', dropoffLocation: { name: 'Manipal Hospital' }, pickupLocation: { address: 'MG Road' }, status: 'Completed' },
            { id: 2, date: '2023-10-24', dropoffLocation: { name: 'Ramesh Hospital' }, pickupLocation: { address: 'Benz Circle' }, status: 'Completed' },
        ];

        return (
            <div style={styles.centeredPageContainer}>
                <div style={{ ...styles.card, width: '90%', maxWidth: '800px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={styles.heading}>Ride History</h2>
                        <button onClick={() => setActiveTab('emergency')} style={{ background: 'none', border: 'none', color: 'white' }}>Back</button>
                    </div>
                    {displayHistory.map((ride, idx) => (
                        <div key={ride._id || idx} style={{
                            padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <h4 style={{ margin: 0, color: 'white' }}>{ride.dropoffLocation?.name || "Unknown Dest"}</h4>
                                <p style={{ margin: '5px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>From: {ride.pickupLocation?.address || "Unknown"} • {new Date(ride.date).toLocaleDateString()}</p>
                            </div>
                            <span style={{
                                padding: '5px 10px', borderRadius: '15px', fontSize: '12px',
                                backgroundColor: 'rgba(46, 204, 113, 0.2)', color: 'var(--accent-green)'
                            }}>{ride.status}</span>
                        </div>
                    ))}
                </div>
                <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
        );
    }

    // --- RENDER: IDLE MODE (Emergency Tab Default) ---
    if (viewMode === 'IDLE' && activeTab === 'emergency') {
        return (
            <div style={styles.centeredPageContainer}>
                {/* Background Map Placeholder */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.3, zIndex: 0 }}>
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={{ lat: MAP_CENTER[0], lng: MAP_CENTER[1] }}
                        zoom={13}
                        options={{ disableDefaultUI: true, styles: [{ stylers: [{ saturation: -100 }] }] }}
                    />
                </div>

                <div style={{ zIndex: 1, textAlign: 'center' }}>
                    <div style={{
                        width: '200px', height: '200px', borderRadius: '50%',
                        backgroundColor: 'rgba(255, 61, 0, 0.15)', border: '2px solid var(--accent-red)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 50px rgba(255, 61, 0, 0.3)',
                        animation: 'pulse 2s infinite',
                        margin: '0 auto 30px auto',
                        cursor: 'pointer'
                    }} onClick={handleStartEmergencyClick}>
                        <div style={{
                            width: '160px', height: '160px', borderRadius: '50%',
                            backgroundColor: 'var(--accent-red)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                        }}>
                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '24px', textAlign: 'center', lineHeight: '1.2' }}>START<br />EMERGENCY</span>
                        </div>
                    </div>
                    <h2 style={{ fontSize: '24px', textShadow: '0 2px 10px black' }}>Driver is Offline</h2>
                    <p style={{ color: 'var(--text-secondary)', textShadow: '0 1px 5px black' }}>Tap the button above when an emergency is reported.</p>
                </div>

                <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
        );
    }

    // --- RENDER: NAVIGATING MODE (Existing Dashboard UI) ---
    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
            {/* Top Status Panel */}
            <div style={{
                position: 'absolute', top: '20px', left: '20px', right: '20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10, pointerEvents: 'none'
            }}>
                <div style={{
                    backgroundColor: 'rgba(5, 5, 5, 0.85)', backdropFilter: 'blur(12px)', padding: '20px',
                    borderRadius: '16px', border: emergencyState.greenCorridor ? '2px solid var(--accent-green)' : '1px solid rgba(255,255,255,0.1)',
                    pointerEvents: 'auto',
                    boxShadow: emergencyState.greenCorridor ? '0 0 40px rgba(46, 204, 113, 0.4)' : 'none',
                    transition: 'all 0.5s'
                }}>
                    {emergencyState.greenCorridor && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <div style={{
                                width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--accent-green)',
                                boxShadow: '0 0 10px var(--accent-green)', animation: 'pulse 1.5s infinite'
                            }} />
                            <span style={{ color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px' }}>GREEN CORRIDOR ACTIVE</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '25px' }}>
                        <div>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><FaClock /> EST. TIME</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: 'white' }}>{tripStats.duration}</p>
                        </div>
                        <div style={{ width: '1px', backgroundColor: '#333' }}></div>
                        <div>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><FaRoad /> DISTANCE</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: 'white' }}>{tripStats.distance}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div style={{
                position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
                zIndex: 10, backgroundColor: 'rgba(20, 20, 20, 0.9)', backdropFilter: 'blur(16px)',
                padding: '16px 24px', borderRadius: '24px', border: 'var(--glass-border)',
                display: 'flex', alignItems: 'center', gap: '30px', boxShadow: 'var(--glass-shadow)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingRight: '20px', borderRight: '1px solid #444' }}>
                    <FaBroadcastTower className="fa-fade" color="var(--primary-blue)" />
                    <div>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Live Link</p>
                        <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '14px', color: 'var(--primary-blue)' }}>TRANSMITTING</p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaHeartbeat /> PATIENT:
                    </p>
                    {Object.keys(SEVERITY_LEVELS).map(level => (
                        <button
                            key={level}
                            onClick={() => updateSeverity(level)}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '10px',
                                border: 'none',
                                fontWeight: 'bold',
                                fontSize: '13px',
                                cursor: 'pointer',
                                backgroundColor: emergencyState.severity === level ? SEVERITY_LEVELS[level].color : 'rgba(255,255,255,0.05)',
                                color: emergencyState.severity === level ? 'black' : 'var(--text-secondary)',
                                transition: 'all 0.2s',
                                boxShadow: emergencyState.severity === level ? `0 0 15px ${SEVERITY_LEVELS[level].color}` : 'none'
                            }}
                        >
                            {SEVERITY_LEVELS[level].label}
                        </button>
                    ))}
                    <button onClick={() => {
                        if (confirm("End Emergency Protocol?")) {
                            endEmergency();
                            setViewMode('IDLE');
                            setRoutePath([]);
                            setDestination(null);
                        }
                    }} style={{ marginLeft: '10px', background: 'none', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}>
                        <FaTimes />
                    </button>
                </div>
            </div>

            {directions && (
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={{ lat: directions.routes[0].legs[0].start_location.lat(), lng: directions.routes[0].legs[0].start_location.lng() }}
                    zoom={18}
                    onLoad={map => setMap(map)}
                    options={{
                        disableDefaultUI: true,
                        heading: 0,
                        tilt: 45,
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
                    <DirectionsRenderer
                        directions={directions}
                        options={{
                            polylineOptions: {
                                strokeColor: '#40C4FF',
                                strokeOpacity: 1.0,
                                strokeWeight: 8
                            },
                            suppressMarkers: true
                        }}
                    />

                    {emergencyState.isActive && emergencyState.currentLocation && (
                        <MarkerF
                            position={emergencyState.currentLocation}
                            icon={{
                                path: "M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z",
                                scale: 1.5,
                                fillColor: '#2979FF',
                                fillOpacity: 1,
                                strokeColor: 'white',
                                strokeWeight: 2,
                                anchor: new window.google.maps.Point(12, 12),
                                rotation: emergencyState.currentLocation.heading || 0
                            }}
                            zIndex={1000}
                        />
                    )}
                </GoogleMap>
            )}
        </div>
    );
}

export default DriverDashboard;