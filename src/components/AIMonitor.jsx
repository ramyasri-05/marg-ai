// src/components/AIMonitor.jsx
import React, { useState, useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const cameraFeedUrl = 'https://i.imgur.com/v8tY5aW.png';
const detectedFeedUrl = 'https://i.imgur.com/kP8c50r.png';

function AIMonitor({ onDetect, isSimulationActive }) {
    const [isDetected, setIsDetected] = useState(false);

    useEffect(() => {
        if (!isSimulationActive) {
            setIsDetected(false);
        }
    }, [isSimulationActive]);

    const handleAITrigger = () => {
        setIsDetected(true);
        setTimeout(() => {
            onDetect();
        }, 800);
    };

    return (
        <div style={styles.container}>
            <div style={styles.feedBox}>
                <img
                    src={isDetected ? detectedFeedUrl : cameraFeedUrl}
                    alt="Simulated Camera Feed"
                    style={styles.feedImage}
                />
                {isDetected ? (
                    <div style={styles.overlayDetected}>
                        <FaCheckCircle style={{ marginRight: '8px' }} />
                        AMBULANCE DETECTED
                    </div>
                ) : (
                    <div style={styles.overlaySearching}>
                        SCANNING...
                    </div>
                )}
            </div>
            <button
                onClick={handleAITrigger}
                disabled={isDetected || isSimulationActive}
                style={styles.triggerButton(isDetected || isSimulationActive)}
            >
                {isDetected ? 'AI SIGNAL SENT' : 'SIMULATE AI DETECTION'}
            </button>
        </div>
    );
}

const styles = {
    container: { backgroundColor: 'var(--dark-card)', padding: '15px', borderRadius: '10px', border: '1px solid #333', textAlign: 'center' },
    feedBox: { position: 'relative', width: '100%', height: '180px', overflow: 'hidden', border: '2px solid #444', borderRadius: '8px', marginBottom: '15px', },
    feedImage: { width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(30%)', },
    overlaySearching: { position: 'absolute', bottom: '10px', left: '10px', padding: '5px 10px', borderRadius: '5px', color: 'var(--accent-yellow)', fontSize: '12px', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.7)', letterSpacing: '1px' },
    overlayDetected: { position: 'absolute', top: 0, width: '100%', textAlign: 'center', color: 'var(--accent-green)', fontSize: '1.1em', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.7)', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', },
    triggerButton: (isDisabled) => ({ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 'bold', color: 'white', backgroundColor: isDisabled ? 'var(--secondary-gray)' : 'var(--accent-red)', border: 'none', borderRadius: '8px', cursor: isDisabled ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s', opacity: isDisabled ? 0.6 : 1, })
};

export default AIMonitor;