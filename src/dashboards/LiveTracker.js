import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { db } from "../Config/firebase";
import { collection, onSnapshot, query, getDocs, where } from "firebase/firestore";
import { BiCar, BiUser, BiRefresh, BiTime } from 'react-icons/bi';

// Fix typical Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component to dynamically recenter map if needed (optional use)
function RecenterAutomatically({lat, lng}) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function LiveTracker() {
  const initialCenter = [6.9271, 79.8612];
  const initialZoom = 12;
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [drivers, setDrivers] = useState({});
  const [vehicleDetails, setVehicleDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const STALE_THRESHOLD = 5 * 60 * 1000; // 5 minutes in ms

  // Definte a Stale Icon (Gray/Red version)
  const staleIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const activeIcon = new L.Icon.Default();

  // Periodic update to refresh staleness every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // 1 minute
    return () => clearInterval(timer);
  }, []);

  // Fetch enriched data (Assignments, Drivers, Vehicles) for mapping
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [assignSnapshot, userSnapshot, vehSnapshot] = await Promise.all([
          getDocs(query(collection(db, "assignments"), where("status", "==", "Active"))),
          getDocs(collection(db, "users")),
          getDocs(collection(db, "vehicles"))
        ]);

        const assignMap = {};
        assignSnapshot.docs.forEach(doc => {
          const data = doc.data();
          // Map by both driver_id and vehicle_id to handle various lookup needs
          if (data.driver_id) assignMap[data.driver_id] = data;
          if (data.driver_username) assignMap[data.driver_username] = data;
        });

        const driverMap = {};
        const uidToDocId = {};
        userSnapshot.docs.forEach(doc => {
          const data = doc.data();
          driverMap[doc.id] = data.username || "Unknown Driver";
          if (data.uid) {
              driverMap[data.uid] = data.username || "Unknown Driver";
              uidToDocId[data.uid] = doc.id;
          }
          if (data.email) driverMap[data.email] = data.username || "Unknown Driver";
        });

        const vehMap = {};
        vehSnapshot.docs.forEach(doc => {
          const data = doc.data();
          vehMap[doc.id] = data.vehicle_type || "Unknown Type";
          if (data.plate_number) vehMap[data.plate_number] = data.vehicle_type || "Unknown Type";
        });

        // Store mappings in state
        setAssignments(prev => {
            // Also index assignments by UID for direct lookup
            const enrichedAssignments = { ...assignMap };
            Object.entries(uidToDocId).forEach(([uid, docId]) => {
                if (assignMap[docId]) {
                    enrichedAssignments[uid] = assignMap[docId];
                }
            });
            return enrichedAssignments;
        });
        setDrivers(driverMap);
        setVehicleDetails(vehMap);
      } catch (err) {
        console.error("Error fetching metadata:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "tracking_locations"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const locationsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVehicles(locationsData);
      } else {
        setVehicles([]);
      }
    }, (error) => {
      console.error("Error listening to tracking locations:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleRefreshClick = () => {
    setCurrentTime(Date.now());
    console.log("Refresh button clicked. Current time updated.");
  };

  // Helper to get driver name, vehicle type, and staleness
  const getEnrichedData = (v) => {
    const rawDriverId = v.driver_id || v.id;
    
    // 1. Identify User (Username and Doc ID)
    let username = v.driver_id || "Unknown";
    let userDocId = null;

    // Search for user in the drivers map (which contains usernames)
    // and identify their firestore document ID if we have it
    for (const [key, val] of Object.entries(drivers)) {
        if (key === rawDriverId) {
            username = val;
            // If the key is a UID, we still need the Doc ID for assignments
            break;
        }
    }

    // We need to find the Firestore Doc ID to link to assignments
    // Let's assume the 'drivers' map keys include both UIDs and DocIDs.
    // However, assignments only know about DocIDs.
    // Let's build a more specific map in fetchMetadata if needed, but for now:
    userDocId = rawDriverId; // Fallback

    // 2. Identify Assignment
    // Try to find an assignment by the raw ID (which might be doc ID) or by username
    const assignment = assignments[rawDriverId] || assignments[username] || {};
    
    // 3. Identify Vehicle Type
    // The vehicle_id could be a doc ID in the tracking data or in the assignment
    let vehicleLookupKey = v.vehicle_id || assignment.vehicle_id;
    
    // Normalize if it looks like a plate number (uppercase, no spaces)
    if (vehicleLookupKey && typeof vehicleLookupKey === 'string') {
        const normalizedKey = vehicleLookupKey.toUpperCase().replace(/[-\s]/g, '');
        // Try the normalized key if the raw one fails
        vehicleLookupKey = vehicleDetails[vehicleLookupKey] ? vehicleLookupKey : normalizedKey;
    }
    
    const vehicleType = vehicleDetails[vehicleLookupKey] || "Vehicle";

    const lastUpdate = v.timestamp ? new Date(v.timestamp).getTime() : 0;
    const isStale = (currentTime - lastUpdate) > STALE_THRESHOLD;

    return {
      username,
      vehicleType,
      isStale
    };
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full gap-6">
      
      {/* Sidebar Info Panel */}
      <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#EAE3D9]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#3E2723]">Live Tracker</h2>
            <button onClick={handleRefreshClick} className="text-[#8D6E63] hover:text-[#5D4037] p-2 rounded-full hover:bg-[#F5F0EB] transition-colors" title="Force Refresh">
              <BiRefresh className="text-2xl" />
            </button>
          </div>
          <p className="text-sm text-[#795548] mb-4">Tracking {vehicles.length} active vehicles in real-time.</p>
          
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#5D4037] bg-[#F5F0EB] px-3 py-2 rounded-lg">
             <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
             <span>Live Connection Active</span>
          </div>
        </div>

        {/* Selected Vehicle Details */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#EAE3D9] flex-1 overflow-y-auto">
          <h3 className="text-lg font-bold text-[#3E2723] mb-4">Vehicle Details</h3>
          
          {selectedVehicle ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-[#F0EBE1]">
                <div className="bg-[#F5F0EB] p-3 rounded-full text-[#8D6E63]">
                  <BiUser className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-[#A1887F] font-semibold uppercase">Driver Username</p>
                  <p className="text-sm font-bold text-[#3E2723]">{getEnrichedData(selectedVehicle).username}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 pb-3 border-b border-[#F0EBE1]">
                <div className="bg-[#F5F0EB] p-3 rounded-full text-[#8D6E63]">
                  <BiCar className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-[#A1887F] font-semibold uppercase">Vehicle Type</p>
                  <p className="text-sm font-bold text-[#3E2723]">{getEnrichedData(selectedVehicle).vehicleType}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 pb-3 border-b border-[#F0EBE1]">
                <div className="bg-[#F5F0EB] p-3 rounded-full text-[#8D6E63]">
                  <BiTime className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-[#A1887F] font-semibold uppercase">Last Updated</p>
                  <p className={`text-sm font-bold ${getEnrichedData(selectedVehicle).isStale ? "text-red-600" : "text-[#3E2723]"}`}>
                    {new Date(selectedVehicle.timestamp).toLocaleTimeString()}
                    {getEnrichedData(selectedVehicle).isStale && <span className="ml-2 text-[10px] uppercase tracking-tighter">(Stale)</span>}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg">
                <p className="text-xs text-green-800 font-semibold mb-1">Status</p>
                <p className="text-sm font-bold text-green-700 capitalize">{selectedVehicle.status}</p>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
               <BiCar className="text-4xl text-[#D7CCC8] mb-3" />
               <p className="text-sm text-[#8C7A70]">Select a vehicle marker on the map to view real-time tracking details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Full Map Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-[#EAE3D9] overflow-hidden relative min-h-[500px]">
        <MapContainer center={initialCenter} zoom={initialZoom} style={{ height: "100%", width: "100%", zIndex: 1 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {vehicles.map((vehicle) => {
            const enriched = getEnrichedData(vehicle);
            return (
              <Marker
                key={vehicle.driver_id}
                position={[vehicle.lat || 0, vehicle.lng || 0]}
                icon={enriched.isStale ? staleIcon : activeIcon}
                eventHandlers={{
                  click: () => {
                    setSelectedVehicle(vehicle);
                  },
                }}
              >
                <Popup>
                  <div className="text-center">
                    <strong className={`block ${enriched.isStale ? "text-red-700" : "text-[#3E2723]"}`}>{enriched.username}</strong>
                    <span className="text-[#8D6E63] font-semibold text-xs">{enriched.vehicleType}</span>
                    {enriched.isStale && (
                      <div className="mt-1 text-[10px] font-bold text-red-600 uppercase border-t border-red-100 pt-1">
                        Connection Stale
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
          
          {selectedVehicle && (
             <RecenterAutomatically lat={selectedVehicle.lat} lng={selectedVehicle.lng} />
          )}

        </MapContainer>
      </div>

    </div>
  );
}
