// src/data/mockCity.js

// --- 1. MAP CONFIGURATION ---
export const MAP_CENTER = [16.51625, 80.61597]; 
export const ZOOM_LEVEL = 14; 

// --- 2. REAL-WORLD HOSPITAL OPTIONS (Comprehensive List) ---
export const HOSPITAL_OPTIONS = [
    { name: "Manipal Hospital", address: "Tadepalle", value: "manipal_hosp" },
    { name: "Ramesh Hospitals", address: "MG Road, Labbipet", value: "ramesh_hosp" },
    { name: "Vijaya Super Speciality Hospital", address: "Suryarao Pet", value: "vijaya_hosp" },
    { name: "INDLAS Hospitals", address: "Suryaraopet", value: "indlas_hosp" },
    { name: "SVR General Hospital", address: "One Town", value: "svr_hosp" },
    { name: "Prakasam Bridge Clinic", address: "Prakasam Road", value: "prakasam_clinic" },
    { name: "Other / Custom Address", address: "Enter GPS Manually", value: "custom_address" },
];


// --- 3. TRAFFIC JUNCTIONS (Fixed Points) ---
export const JUNCTIONS = [
    { id: 'J1', name: 'City Center (Start)', lat: 16.51625, lng: 80.61597, status: 'Red' },
    { id: 'J2', name: 'Varadhi Bridge Cross', lat: 16.52822, lng: 80.59123, status: 'Red' },
    { id: 'J3', name: 'Labbipet Junction', lat: 16.52861, lng: 80.63836, status: 'Red' },
    { id: 'J4', name: 'MG Road Near Capital Hospital', lat: 16.52403, lng: 80.67743, status: 'Red' },
    { id: 'J5', name: 'Hospital Destination', lat: 16.50500, lng: 80.65000, status: 'Red' },
];


// --- 4. PRE-CALCULATED ROUTES ---
export const ROUTE_HIGHWAY_PATH = [
    [16.51625, 80.61597], [16.51800, 80.61000], [16.52000, 80.60500], [16.52822, 80.59123],
    [16.52900, 80.60000], [16.52861, 80.63836], [16.52700, 80.65000], [16.52403, 80.67743],
    [16.51500, 80.66500], [16.50500, 80.65000] 
];

export const ROUTE_CITY_BLOCKS_PATH = [
    [16.51625, 80.61597], [16.51400, 80.61800], [16.51200, 80.62200], [16.51000, 80.62800],
    [16.50800, 80.63500], [16.50700, 80.64200], [16.50600, 80.64800], [16.50500, 80.65000] 
];

export const ROUTES_MOCK = {
    highway: { path: ROUTE_HIGHWAY_PATH, name: 'AI Optimized (Wide Roads)', time: '8 min', distance: '6.5 km', icon: 'highway' },
    city_blocks: { path: ROUTE_CITY_BLOCKS_PATH, name: 'Shortest Distance', time: '12 min', distance: '5.9 km', icon: 'city' },
};

export const AMBULANCE_ROUTE = ROUTES_MOCK.highway.path;