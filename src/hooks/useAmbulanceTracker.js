// src/hooks/useAmbulanceTracker.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import * as geolib from 'geolib';

const PROXIMITY_THRESHOLD_METERS = 500;
const SIMULATION_SPEED_MS = 1000;

export const useAmbulanceTracker = (initialSignals, activeRoutePath) => {
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
                return { ...prevPos, lat: newLat, lng: newLng, routeIndex: nextIndex };
            });
        }, SIMULATION_SPEED_MS);
        return () => clearInterval(intervalId);
    }, [ambulancePos.isActive, routeLength, activeRoutePath]);

    useEffect(() => {
        if (!ambulancePos.isActive || routeLength === 0) return;
        let nextJunctionToClear = null;
        for (const junction of signals) {
             if (junction.status !== 'Green' && junction.status !== 'Red-Forced') {
                const distanceToRouteEnd = geolib.getDistance({ latitude: junction.lat, longitude: junction.lng }, { latitude: activeRoutePath[routeLength-1][0], longitude: activeRoutePath[routeLength-1][1] });
                const distanceAmbulanceToRouteEnd = geolib.getDistance({ latitude: ambulancePos.lat, longitude: ambulancePos.lng }, { latitude: activeRoutePath[routeLength-1][0], longitude: activeRoutePath[routeLength-1][1] });
                if (distanceToRouteEnd < distanceAmbulanceToRouteEnd) {
                    nextJunctionToClear = junction;
                    break;
                }
             }
        }
        if (nextJunctionToClear) {
            const distance = geolib.getDistance({ latitude: ambulancePos.lat, longitude: ambulancePos.lng }, { latitude: nextJunctionToClear.lat, longitude: nextJunctionToClear.lng });
            if (distance < PROXIMITY_THRESHOLD_METERS) {
                setSignals(prevSignals => prevSignals.map(s =>
                    s.id === nextJunctionToClear.id && s.status !== 'Red-Forced' ? { ...s, status: 'Green' } : s
                ));
            }
        }
    }, [ambulancePos.lat, ambulancePos.lng, ambulancePos.isActive, routeLength, signals, activeRoutePath]);

    const toggleManualOverride = (junctionId) => {
        setSignals(prevSignals => prevSignals.map(s => {
            if (s.id === junctionId) {
                return { ...s, status: s.status === 'Red-Forced' ? 'Red' : 'Red-Forced' };
            }
            return s;
        }));
    };

    const startSimulation = useCallback(() => {
        if (activeRoutePath && activeRoutePath.length > 0) {
            setSignals(junctionsOnRoute);
            setAmbulancePos({ lat: activeRoutePath[0][0], lng: activeRoutePath[0][1], isActive: true, routeIndex: 0 });
        }
    }, [activeRoutePath, junctionsOnRoute]);

    const resetSimulation = useCallback(() => {
        if (activeRoutePath && activeRoutePath.length > 0) {
            setSignals(junctionsOnRoute);
            setAmbulancePos({ lat: activeRoutePath[0][0], lng: activeRoutePath[0][1], isActive: false, routeIndex: 0 });
        }
    }, [activeRoutePath, junctionsOnRoute]);

    return { signals, ambulancePos, toggleManualOverride, startSimulation, resetSimulation };
};