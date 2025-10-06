// src/components/DriverLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HOSPITAL_OPTIONS } from '../data/mockCity';
import { globalStyles as styles } from '../Styles/AppStyles.js';
import MARGAILogo from './MARGAILogo';
import { FaChevronDown } from 'react-icons/fa';

const internalStyles = {
    dropdownButton: { ...styles.input, textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', width: '100%', padding: '14px 20px' },
    dropdownMenu: { position: 'absolute', top: '105%', left: 0, width: '100%', maxHeight: '200px', overflowY: 'auto', backgroundColor: 'var(--dark-card)', border: '1px solid #444', borderRadius: '8px', zIndex: 100, backgroundColor: 'rgba(40, 40, 40, 0.8)', backdropFilter: 'blur(10px)', },
    dropdownItem: { padding: '12px 20px', color: 'var(--text-primary)', cursor: 'pointer', transition: 'background-color 0.2s' }
};

function DriverLogin() {
    const navigate = useNavigate();
    const [destination, setDestination] = useState('');
    const [id, setId] = useState('');
    const [pass, setPass] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLoginAndPlanRoute = () => {
        if (!id || !pass || !destination) {
            alert("Please enter ID, Password, and select a Destination.");
            return;
        }
        navigate(`/driver/setup?dest=${destination}`);
    };

    const handleAIBasedStart = () => {
        if (!id || !pass) {
            alert("Please enter ID and Password.");
            return;
        };
        navigate(`/driver/navigation?route=main&dest=manipal_hosp`);
    };

    const selectedHospital = HOSPITAL_OPTIONS.find(h => h.value === destination);

    const handleSelectOption = (value) => {
        setDestination(value);
        setIsDropdownOpen(false);
    };

    return (
        <div style={styles.centeredPageContainer}>
            <div style={styles.card}>
                <MARGAILogo />
                <h3 style={styles.heading}>Vehicle Driver Login</h3>
                <input type="text" placeholder="Driver ID" value={id} onChange={(e) => setId(e.target.value)} style={styles.input} />
                <input type="password" placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)} style={styles.input} />
                <div style={{ position: 'relative' }}>
                    <button style={internalStyles.dropdownButton} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                        {selectedHospital ? selectedHospital.name : '-- Select Destination Hospital --'}
                        <FaChevronDown style={{transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'}}/>
                    </button>
                    {isDropdownOpen && (
                        <div style={internalStyles.dropdownMenu}>
                            {HOSPITAL_OPTIONS.map(hospital => (
                                <div key={hospital.value} style={internalStyles.dropdownItem} onClick={() => handleSelectOption(hospital.value)} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-blue)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    {hospital.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button onClick={handleLoginAndPlanRoute} style={{...styles.primaryButton, marginTop: '20px'}} >
                    Login & Plan Route
                </button>
                <p style={{ margin: '20px 0', color: 'var(--text-secondary)' }}>— OR —</p>
                <button onClick={handleAIBasedStart} style={styles.secondaryButton}>
                    Simulate AI Detection Start
                </button>
            </div>
        </div>
    );
}

export default DriverLogin;