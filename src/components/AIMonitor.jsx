// src/components/AIMonitor.jsx
import React, { useState } from 'react';

// You will need a simulated traffic camera image or video placeholder
// In the final demo, you can replace this with a short, looping video of a static road.
const cameraFeedUrl = 'https://i.imgur.com/v8tY5aW.png'; // Placeholder image URL
const detectedFeedUrl = 'https://i.imgur.com/kP8c50r.png'; // Placeholder image with a green box

function AIMonitor({ onDetect }) {
    const [isDetected, setIsDetected] = useState(false);

    const handleAITrigger = () => {
        setIsDetected(true);
        // After a small delay (simulating processing time), activate the main system
        setTimeout(() => {
            onDetect(); // Calls the function in the parent component (TrafficDashboard)
        }, 800); 
    };

    return (
        <div style={styles.container}>
            <h3>Live Camera Feed: Junction J1</h3>
            <div style={styles.feedBox}>
                <img 
                    src={isDetected ? detectedFeedUrl : cameraFeedUrl} 
                    alt="Simulated Camera Feed" 
                    style={styles.feedImage} 
                />
                
                {isDetected ? (
                    <div style={styles.overlayDetected}>
                        AMBULANCE DETECTED [YOLOv8: 98% Confidence]
                    </div>
                ) : (
                    <div style={styles.overlaySearching}>
                        AI SCANNING...
                    </div>
                )}
            </div>
            
            <button 
                onClick={handleAITrigger} 
                disabled={isDetected}
                style={styles.triggerButton(isDetected)}
            >
                {isDetected ? 'AI SIGNAL SENT' : 'SIMULATE REAL-TIME AI DETECTION'}
            </button>
        </div>
    );
}

const styles = {
    container: { padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' },
    feedBox: { position: 'relative', width: '100%', height: '200px', overflow: 'hidden', border: '2px solid #555' },
    feedImage: { width: '100%', filter: 'grayscale(50%) blur(1px)' },
    overlaySearching: { position: 'absolute', top: '50%', width: '100%', textAlign: 'center', color: '#fff', fontSize: '1.2em', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.5)' },
    overlayDetected: { position: 'absolute', top: '50%', width: '100%', textAlign: 'center', color: '#28a745', fontSize: '1.2em', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.7)', padding: '5px' },
    triggerButton: (isDetected) => ({
        marginTop: '15px', padding: '10px 15px', 
        backgroundColor: isDetected ? '#28a745' : '#dc3545', 
        color: 'white', border: 'none', borderRadius: '5px', 
        cursor: isDetected ? 'default' : 'pointer'
    })
};

export default AIMonitor;