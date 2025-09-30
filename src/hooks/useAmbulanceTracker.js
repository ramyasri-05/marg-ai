// src/hooks/useAmbulanceTracker.js

import { useState, useEffect } from 'react';
import { JUNCTIONS } from '../data/mockCity';
import * as geolib from 'geolib';

// Constants for simulation tuning
const PROXIMITY_THRESHOLD_METERS = 600; 
const SIMULATION_SPEED_MS = 300; 

export const useAmbulanceTracker = (initialSignals, activeRoutePath) => {
    
    const [signals, setSignals] = useState(initialSignals);
    
    // Initial position set to the start of the route
    const [ambulancePos, setAmbulancePos] = useState({
        lat: activeRoutePath[0][0], 
        lng: activeRoutePath[0][1],
        isActive: false,
        routeIndex: 0,
    });

    const routeLength = activeRoutePath ? activeRoutePath.length : 0;

    // --- LOGIC 1: THE GPS EMITTER (MOVEMENT) ---
    useEffect(() => {
        if (!ambulancePos.isActive || routeLength === 0) return;

        const intervalId = setInterval(() => {
            setAmbulancePos(prevPos => {
                const nextIndex = prevPos.routeIndex + 1;
                
                if (nextIndex >= routeLength) {
                    clearInterval(intervalId);
                    return { ...prevPos, isActive: false }; 
                }
                
                const [newLat, newLng] = activeRoutePath[nextIndex];

                return {
                    ...prevPos,
                    lat: newLat,
                    lng: newLng,
                    routeIndex: nextIndex,
                };
            });
        }, SIMULATION_SPEED_MS);

        return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ambulancePos.isActive, activeRoutePath, routeLength]); 


    // --- LOGIC 2: THE GREEN CORRIDOR INTELLIGENCE (Signal Clearing) ---
    useEffect(() => {
        if (!ambulancePos.isActive || routeLength === 0) return;

        let nextJunction = null;
        for (let i = 0; i < JUNCTIONS.length; i++) {
            const junction = signals.find(s => s.id === JUNCTIONS[i].id);
            if (junction && junction.status !== 'Green' && junction.status !== 'Red-Forced') {
                nextJunction = junction;
                break;
            }
        }

        if (nextJunction) {
            const distance = geolib.getDistance(
                { latitude: ambulancePos.lat, longitude: ambulancePos.lng },
                { latitude: nextJunction.lat, longitude: nextJunction.lng }
            );

            if (distance < PROXIMITY_THRESHOLD_METERS) {
                setSignals(prevSignals => prevSignals.map(s => 
                    s.id === nextJunction.id && s.status !== 'Red-Forced' ? { ...s, status: 'Green' } : s
                ));
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ambulancePos.lat, ambulancePos.lng, ambulancePos.isActive, routeLength]);

    
    // --- LOGIC 3: MANUAL OVERRIDE FUNCTION and Controls ---
    const toggleManualOverride = (junctionId) => {
        setSignals(prevSignals => prevSignals.map(s => {
            if (s.id === junctionId) {
                const newStatus = s.status === 'Red-Forced' ? 'Red' : 'Red-Forced'; 
                return { ...s, status: newStatus };
            }
            return s;
        }));
    };

    const startSimulation = () => {
        setSignals(JUNCTIONS); 
        setAmbulancePos({
            lat: activeRoutePath[0][0],
            lng: activeRoutePath[0][1],
            isActive: true,
            routeIndex: 0
        });
    };
    
    const resetSimulation = () => {
        setSignals(JUNCTIONS);
        setAmbulancePos({
            lat: activeRoutePath[0][0],
            lng: activeRoutePath[0][1],
            isActive: false,
            routeIndex: 0,
        });
    };

    return { signals, ambulancePos, toggleManualOverride, startSimulation, resetSimulation };
};