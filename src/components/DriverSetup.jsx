// src/components/DriverSetup.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import { HOSPITAL_OPTIONS } from '../data/mockCity'; // Fallback
import { globalStyles, formStyles } from '../Styles/AppStyles';
import MARGAILogo from './MARGAILogo';
import { FaSpinner, FaMapMarkerAlt, FaHospital } from 'react-icons/fa';

const LIBRARIES = ['places']; // Load Places library

// Helper to calculate distance (Haversine) - strictly for sorting fallback or double checking
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

function DriverSetup() {
    const [hospitals, setHospitals] = useState([]);
    const [selectedHospitalId, setSelectedHospitalId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState('Initializing...');
    const mapRef = useRef(null); // Hidden map div for PlacesService
    const navigate = useNavigate();

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES
    });

    useEffect(() => {
        if (!isLoaded) return;

        setStatusMessage('Acquiring User Location...');

        // Optimize for Speed: disable high accuracy to get a quicker lock
        const geoOptions = {
            enableHighAccuracy: false, // User requested faster speed
            timeout: 7000,
            maximumAge: 60000 // Accept cached location from 1 minute ago
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const userLoc = new window.google.maps.LatLng(latitude, longitude);

                setStatusMessage('Searching for Nearby Hospitals...');

                // Create a PlacesService instance
                const service = new window.google.maps.places.PlacesService(document.createElement('div'));

                const request = {
                    location: userLoc,
                    radius: '5000', // 5km radius
                    type: ['hospital']
                };

                service.nearbySearch(request, (results, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && results.length > 0) {

                        const formattedHospitals = results.map(place => {
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
                                distance: dist,
                                isReal: true
                            };
                        });

                        // Sort by distance (nearest first)
                        formattedHospitals.sort((a, b) => a.distance - b.distance);

                        setHospitals(formattedHospitals);
                        setSelectedHospitalId(formattedHospitals[0].id);
                        setIsLoading(false);

                    } else {
                        console.warn("Places API returned no results or failed: ", status);
                        // Fallback to static list
                        fallbackToStaticList(latitude, longitude);
                    }
                });
            },
            (error) => {
                console.error("Location error:", error);
                setStatusMessage('Location slow/denied. Using Default List.');
                fallbackToStaticList(null, null); // Use default coords defined in mockCity or ignore distance
            },
            geoOptions
        );

    }, [isLoaded]);

    const fallbackToStaticList = (lat, lng) => {
        let sorted = [...HOSPITAL_OPTIONS];
        if (lat && lng) {
            const userLoc = { lat, lng };
            sorted = sorted.map(h => ({
                ...h,
                id: h.value, // Map value to id for consistency
                distance: getDistance(userLoc, h),
                isReal: false
            })).sort((a, b) => a.distance - b.distance);
        } else {
            // Just map value to id and set default distances
            sorted = sorted.map(h => ({ ...h, id: h.value, isReal: false }));
        }

        setHospitals(sorted);
        setSelectedHospitalId(sorted[0].id);
        setIsLoading(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const selected = hospitals.find(h => h.id === selectedHospitalId);
        if (selected) {
            if (selected.isReal) {
                // Pass full details for real places
                navigate(`/driver/navigation?dest=custom&name=${encodeURIComponent(selected.name)}&lat=${selected.lat}&lng=${selected.lng}`);
            } else {
                // Use key for static options
                navigate(`/driver/navigation?dest=${selected.value}`); // value was mapped to id in fallback
            }
        }
    };

    return (
        <div style={globalStyles.centeredPageContainer}>
            <div style={{ ...formStyles.formContainer, maxWidth: '600px' }}>
                <MARGAILogo />
                <h2 style={formStyles.header}>Select Destination</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    <FaMapMarkerAlt />
                    <p style={{ margin: 0, fontSize: '14px' }}>Locating nearby emergency centers...</p>
                </div>

                {isLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--primary-blue)' }}>
                        <FaSpinner className="fa-spin" size={30} />
                        <p style={{ marginTop: '15px' }}>{statusMessage}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px', marginBottom: '20px' }}>
                            {hospitals.map((hospital) => (
                                <div
                                    key={hospital.id}
                                    onClick={() => setSelectedHospitalId(hospital.id)}
                                    style={{
                                        padding: '15px',
                                        marginBottom: '10px',
                                        borderRadius: '12px',
                                        backgroundColor: selectedHospitalId === hospital.id ? 'rgba(41, 121, 255, 0.2)' : 'rgba(255,255,255,0.05)',
                                        border: selectedHospitalId === hospital.id ? '1px solid var(--primary-blue)' : '1px solid rgba(255,255,255,0.1)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '15px'
                                    }}
                                >
                                    <div style={{
                                        backgroundColor: selectedHospitalId === hospital.id ? 'var(--primary-blue)' : 'rgba(255,255,255,0.1)',
                                        padding: '10px', borderRadius: '50%', display: 'flex'
                                    }}>
                                        <FaHospital color={selectedHospitalId === hospital.id ? 'white' : 'var(--text-secondary)'} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <h4 style={{ margin: 0, color: 'white' }}>{hospital.name}</h4>
                                            {hospital.distance && (
                                                <span style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: 'bold' }}>
                                                    {hospital.distance.toFixed(1)} km
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                                            {hospital.address || "Address unavailable"}
                                        </p>
                                        {hospital.rating && (
                                            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#FFD700' }}>
                                                ★ {hospital.rating} <span style={{ color: '#666' }}>({hospital.userRatingsTotal})</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="submit" style={globalStyles.primaryButton}>
                            Start Emergency Route
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default DriverSetup;