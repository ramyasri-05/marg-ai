# MARG-AI 🚑

An AI-powered Green Corridor Simulation for Emergency Vehicles, built with React and Vite.



## About The Project

MARG-AI is a web-based simulation demonstrating an intelligent traffic management system designed to create a "green corridor" for emergency vehicles. It addresses the critical issue of delays faced by ambulances in urban traffic by providing a suite of tools for different stakeholders (drivers, police, and hospitals) to monitor, manage, and navigate a cleared path in real-time.

The system simulates an AI that suggests optimal routes, automatically clears traffic signals, and allows for manual intervention from a central control panel.

---
## ✨ Key Features

* **Multi-Role Dashboards:** Separate, tailored interfaces for Ambulance Drivers, Police/Admin Controllers, and Hospital ER staff.
* **Real-Time Map Simulation:** Uses Leaflet to visualize the ambulance's movement, the planned route, and the live status of all relevant traffic signals.
* **Dynamic "Green Corridor" AI:** The core `useAmbulanceTracker` hook simulates an AI that automatically turns traffic signals green as the ambulance approaches.
* **Police/Admin Control Panel:** A command center view that allows for:
    * Monitoring live traffic levels (simulated).
    * Manually overriding traffic signals to force them red or green.
    * Viewing a real-time, timestamped log of all simulation events.
    * Triggering a simulation via a mock "AI Camera Feed".
* **AI Route Adaptation:** The driver's route selection screen demonstrates the AI adapting its suggestions based on simulated police interventions.

---
## 🛠️ Built With

This project was built using modern frontend technologies.

* [React.js](https://reactjs.org/) (v18)
* [Vite](https://vitejs.dev/)
* [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
* [Geolib](https://github.com/manuelbieh/geolib) for distance calculations

---
## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have Node.js and npm installed on your machine.
* npm
    ```sh
    npm install npm@latest -g
    ```

### Installation

1.  Clone the repo
    ```sh
    git clone [https://github.com/your_username/marg-ai.git](https://github.com/your_username/marg-ai.git)
    ```
2.  Navigate to the project directory
    ```sh
    cd marg-ai
    ```
3.  Install NPM packages
    ```sh
    npm install
    ```
4.  Run the development server
    ```sh
    npm run dev
    ```
The application will be available at `http://localhost:5173/` (or another port if 5173 is in use).

---
## 📖 Usage

1.  Start the application and select a role from the main menu.
2.  **As a Driver:** Log in, select a destination hospital, and choose from the AI-suggested routes. You can click "Re-Scan for Police Clearance" to see how the AI adapts to manual overrides.
3.  **As a Police/Admin:** Log in to the control dashboard. Here you can monitor all traffic signals and their simulated traffic levels. Use the "AI Camera Feed" to start a simulation and watch the event log update. During an active simulation, you can use the "OVERRIDE" buttons to manually control signals.
4.  **As a Hospital:** Log in to the hospital ER dashboard to see a dedicated view of the incoming ambulance, its live ETA, and simulated patient vitals.

---
## 📂 File Structure

The project follows a standard Vite + React structure.
/src
|-- /components/   # Reusable UI components (Logins, Dashboards, etc.)
|-- /data/         # Mock data for the simulation (mockCity.js)
|-- /hooks/        # Custom React hooks (like useAmbulanceTracker)
|-- /pages/        # Top-level page components for dashboards
|-- /Styles/       # CSS-in-JS style definitions (AppStyles.js)
|-- index.css      # Global CSS and variables
|-- main.jsx       # Main application entrypoint and router setup
---
## 📄 License

Distributed under the MIT License. See `LICENSE.txt` for more information.