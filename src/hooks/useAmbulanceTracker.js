// src/hooks/useAmbulanceTracker.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import * as geolib from 'geolib';

const PROXIMITY_THRESHOLD_METERS = 500;
const SIMULATION_SPEED_MS = 1000; // Determines how often the ambulance position updates

export const useAmbulanceTracker = (initialSignals, activeRoutePath) => {
    // Memoize the junctions that lie on the active route to avoid recalculating on every render
    const junctionsOnRoute = useMemo(() => {
        if (!activeRoutePath || activeRoutePath.length === 0) return [];
        return initialSignals.filter(junction =>
            activeRoutePath.some(pathPoint =>
                geolib.getDistance({ latitude: junction.lat, longitude: junction.lng }, { latitude: pathPoint[0], longitude: pathPoint[1] }) < 50
            )
        );
    }, [initialSignals, activeRoutePath]);

    const [signals, setSignals] = useState(junctionsOnRoute);
    const [ambulancePos, setAmbulancePos] = useState({
        lat: activeRoutePath ? activeRoutePath[0][0] : 0,
        lng: activeRoutePath ? activeRoutePath[0][1] : 0,
        isActive: false,
        routeIndex: 0,
    });

    const routeLength = activeRoutePath ? activeRoutePath.length : 0;

    // This effect is responsible for moving the ambulance along the path
    useEffect(() => {
        if (!ambulancePos.isActive || !activeRoutePath || routeLength === 0) return;

        const intervalId = setInterval(() => {
            // Use the functional form of setState to get the latest state
            setAmbulancePos(prevPos => {
                if (prevPos.routeIndex >= routeLength - 1) {
                    return { ...prevPos, isActive: false }; // Stop at the end
                }
                const nextIndex = prevPos.routeIndex + 1;
                const [newLat, newLng] = activeRoutePath[nextIndex];
                return { ...prevPos, lat: newLat, lng: newLng, routeIndex: nextIndex };
            });
        }, SIMULATION_SPEED_MS);

        return () => clearInterval(intervalId); // Cleanup on dismount or when isActive changes
    }, [ambulancePos.isActive, routeLength, activeRoutePath]);

    // This effect is responsible for turning signals green as the ambulance approaches
    useEffect(() => {
        if (!ambulancePos.isActive || routeLength === 0) return;

        let nextJunctionToClear = null;
        // Find the next junction on the path that isn't already green or manually forced red
        for (const junction of signals) {
             if (junction.status !== 'Green' && junction.status !== 'Red-Forced') {
                const distanceToRouteEnd = geolib.getDistance({ latitude: junction.lat, longitude: junction.lng }, { latitude: activeRoutePath[routeLength-1][0], longitude: activeRoutePath[routeLength-1][1] });
                const distanceAmbulanceToRouteEnd = geolib.getDistance({ latitude: ambulancePos.lat, longitude: ambulancePos.lng }, { latitude: activeRoutePath[routeLength-1][0], longitude: activeRoutePath[routeLength-1][1] });
                // Check if the junction is ahead of the ambulance
                if (distanceToRouteEnd < distanceAmbulanceToRouteEnd) {
                    nextJunctionToClear = junction;
                    break; // Exit after finding the very next one
                }
             }
        }

        if (nextJunctionToClear) {
            const distanceToJunction = geolib.getDistance(
                { latitude: ambulancePos.lat, longitude: ambulancePos.lng },
                { latitude: nextJunctionToClear.lat, longitude: nextJunctionToClear.lng }
            );
            // If the ambulance is within the threshold, turn the light green
            if (distanceToJunction < PROXIMITY_THRESHOLD_METERS) {
                setSignals(prevSignals => prevSignals.map(s =>
                    s.id === nextJunctionToClear.id && s.status !== 'Red-Forced' ? { ...s, status: 'Green' } : s
                ));
            }
        }
    }, [ambulancePos.lat, ambulancePos.lng, ambulancePos.isActive, routeLength, signals, activeRoutePath]); // Dependencies for this effect

    const toggleManualOverride = useCallback((junctionId) => {
        setSignals(prevSignals => prevSignals.map(s => {
            if (s.id === junctionId) {
                // Toggle between Red-Forced and its previous state (or Red)
                return { ...s, status: s.status === 'Red-Forced' ? 'Red' : 'Red-Forced' };
            }
            return s;
        }));
    }, []);

    const startSimulation = useCallback(() => {
        setSignals(junctionsOnRoute.map(j => ({...j, status: 'Red'}))); // Reset all signals to Red
        setAmbulancePos({
            lat: activeRoutePath[0][0],
            lng: activeRoutePath[0][1],
            isActive: true,
            routeIndex: 0,
        });
    }, [junctionsOnRoute, activeRoutePath]);

    const resetSimulation = useCallback(() => {
        setSignals(junctionsOnRoute); // Reset signals to their initial state
        setAmbulancePos({
            lat: activeRoutePath[0][0],
            lng: activeRoutePath[0][1],
            isActive: false,
            routeIndex: 0,
        });
    }, [junctionsOnRoute, activeRoutePath]);

    return { signals, ambulancePos, toggleManualOverride, startSimulation, resetSimulation };
};