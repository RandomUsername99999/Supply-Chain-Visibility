import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../api';
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

  const fetchLocations = async () => {
    try {
      const response = await api.get('tracking/locations/');
      setVehicles(response.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  useEffect(() => {
    fetchLocations();
    // Poll every 3 seconds for real-time tracking
    const interval = setInterval(fetchLocations, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-full w-full gap-6">
      
      {/* Sidebar Info Panel */}
      <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#EAE3D9]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#3E2723]">Live Tracker</h2>
            <button onClick={fetchLocations} className="text-[#8D6E63] hover:text-[#5D4037] p-2 rounded-full hover:bg-[#F5F0EB] transition-colors" title="Force Refresh">
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
                  <p className="text-xs text-[#A1887F] font-semibold uppercase">Driver ID</p>
                  <p className="text-sm font-bold text-[#3E2723]">{selectedVehicle.driver_id}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 pb-3 border-b border-[#F0EBE1]">
                <div className="bg-[#F5F0EB] p-3 rounded-full text-[#8D6E63]">
                  <BiCar className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-[#A1887F] font-semibold uppercase">Vehicle ID</p>
                  <p className="text-sm font-bold text-[#3E2723]">{selectedVehicle.vehicle_id}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 pb-3 border-b border-[#F0EBE1]">
                <div className="bg-[#F5F0EB] p-3 rounded-full text-[#8D6E63]">
                  <BiTime className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-[#A1887F] font-semibold uppercase">Last Updated</p>
                  <p className="text-sm font-bold text-[#3E2723]">{new Date(selectedVehicle.timestamp).toLocaleTimeString()}</p>
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

          {vehicles.map((vehicle) => (
            <Marker
              key={vehicle.driver_id}
              position={[vehicle.lat || 0, vehicle.lng || 0]}
              eventHandlers={{
                click: () => {
                  setSelectedVehicle(vehicle);
                },
              }}
            >
              <Popup>
                <div className="text-center">
                  <strong>{vehicle.driver_id}</strong><br/>
                  <span className="text-gray-500">{vehicle.vehicle_id}</span>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {selectedVehicle && (
             <RecenterAutomatically lat={selectedVehicle.lat} lng={selectedVehicle.lng} />
          )}

        </MapContainer>
      </div>

    </div>
  );
}
