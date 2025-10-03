// src/data/mockCity.js
export const MAP_CENTER = [16.51625, 80.61597];
export const ZOOM_LEVEL = 14;

export const HOSPITAL_OPTIONS = [
    { name: "Manipal Hospital", address: "Tadepalle", value: "manipal_hosp", lat: 16.50500, lng: 80.65000 },
    { name: "Ramesh Hospitals", address: "MG Road, Labbipet", value: "ramesh_hosp", lat: 16.513, lng: 80.645 },
    { name: "Vijaya Super Speciality Hospital", address: "Suryarao Pet", value: "vijaya_hosp", lat: 16.518, lng: 80.630 },
];

export const JUNCTIONS = [
    { id: 'J1', name: 'City Center (Start)', lat: 16.51625, lng: 80.61597, status: 'Red' },
    { id: 'J2', name: 'Varadhi Bridge Cross', lat: 16.52822, lng: 80.59123, status: 'Red' },
    { id: 'J3', name: 'Labbipet Junction', lat: 16.52861, lng: 80.63836, status: 'Red' },
    { id: 'J4', name: 'MG Road Near Capital Hospital', lat: 16.52403, lng: 80.67743, status: 'Red' },
    { id: 'J5', name: 'Manipal Destination', lat: 16.50500, lng: 80.65000, status: 'Red' },
];

const ROUTE_TO_MANIPAL_HOSPITAL_MAIN = [ [16.51625, 80.61597], [16.51800, 80.61000], [16.52000, 80.60500], [16.52822, 80.59123], [16.52900, 80.60000], [16.52861, 80.63836], [16.52700, 80.65000], [16.52403, 80.67743], [16.51500, 80.66500], [16.50500, 80.65000] ];
const ROUTE_TO_MANIPAL_HOSPITAL_SHORT = [ [16.51625, 80.61597], [16.51400, 80.61800], [16.51200, 80.62200], [16.51000, 80.62800], [16.50800, 80.63500], [16.50700, 80.64200], [16.50600, 80.64800], [16.50500, 80.65000] ];
const ROUTE_TO_RAMESH_HOSPITAL_MAIN = [ [16.51625, 80.61597], [16.517, 80.625], [16.515, 80.635], [16.513, 80.645] ];
const ROUTE_TO_RAMESH_HOSPITAL_ALT = [ [16.51625, 80.61597], [16.52822, 80.59123], [16.52861, 80.63836], [16.513, 80.645] ];
const ROUTE_TO_VIJAYA_HOSPITAL_MAIN = [ [16.51625, 80.61597], [16.518, 80.620], [16.520, 80.625], [16.518, 80.630] ];
const ROUTE_TO_VIJAYA_HOSPITAL_ALT = [ [16.51625, 80.61597], [16.52861, 80.63836], [16.518, 80.630] ];

export const ROUTES_MOCK = {
    manipal_hosp: {
        main: { path: ROUTE_TO_MANIPAL_HOSPITAL_MAIN, name: 'AI Optimized (Wide Roads)', time: '8 min', timeInMinutes: 8, distance: '6.5' },
        short: { path: ROUTE_TO_MANIPAL_HOSPITAL_SHORT, name: 'Shortest Distance', time: '12 min', timeInMinutes: 12, distance: '5.9' },
    },
    ramesh_hosp: {
        main: { path: ROUTE_TO_RAMESH_HOSPITAL_MAIN, name: 'City Main Route', time: '6 min', timeInMinutes: 6, distance: '4.2' },
        alt: { path: ROUTE_TO_RAMESH_HOSPITAL_ALT, name: 'Highway Bypass', time: '9 min', timeInMinutes: 9, distance: '5.8' },
    },
    vijaya_hosp: {
        main: { path: ROUTE_TO_VIJAYA_HOSPITAL_MAIN, name: 'Direct Route', time: '5 min', timeInMinutes: 5, distance: '3.1' },
        alt: { path: ROUTE_TO_VIJAYA_HOSPITAL_ALT, name: 'Junction J3 Route', time: '7 min', timeInMinutes: 7, distance: '3.9' },
    }
};