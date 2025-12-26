import { useState, useEffect } from 'react';

const STORAGE_KEY = 'marg_ai_simulation_state';

const DEFAULT_STATE = {
    isActive: false,
    id: null,
    vehicle: null,
    severity: 'MEDIUM',
    destination: null, // { name, value, lat, lng }
    greenCorridor: false,
    eta: '--',
    startTime: null,
    currentLocation: null, // { lat, lng }
    history: [] // Array of completed emergencies
};

export const useSimulation = () => {
    const [emergencyState, setEmergencyState] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_STATE;
    });

    // Listen for storage events (updates from other tabs)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === STORAGE_KEY) {
                setEmergencyState(JSON.parse(e.newValue));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Helper to update state and broadcast to other tabs
    const updateState = (newState) => {
        const updated = { ...emergencyState, ...newState };
        setEmergencyState(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        // Manually trigger storage event for current tab updates (storage event only fires for other tabs)
        window.dispatchEvent(new Event("storage"));
    };

    const startEmergency = (details) => {
        updateState({
            isActive: true,
            id: `EMG-${Math.floor(Math.random() * 1000)}`,
            startTime: Date.now(),
            greenCorridor: false,
            currentLocation: null,
            ...details
        });
    };

    const updateSeverity = (severity) => {
        updateState({ severity });
    };

    const toggleGreenCorridor = (status) => {
        updateState({ greenCorridor: status });
    };

    const updateETA = (eta) => {
        if (eta !== emergencyState.eta) {
            updateState({ eta });
        }
    };

    const updateLocation = (lat, lng, heading = 0) => {
        updateState({ currentLocation: { lat, lng, heading } });
    };

    const addToHistory = (log) => {
        const newHistory = [log, ...emergencyState.history];
        updateState({ history: newHistory });
    };

    const endEmergency = () => {
        // Preserve history when resetting
        const currentHistory = emergencyState.history;
        const resetState = { ...DEFAULT_STATE, history: currentHistory };
        setEmergencyState(resetState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resetState));
        window.dispatchEvent(new Event("storage"));
    };

    return {
        emergencyState,
        startEmergency,
        updateSeverity,
        toggleGreenCorridor,
        updateETA,
        updateLocation,
        addToHistory,
        endEmergency
    };
};
