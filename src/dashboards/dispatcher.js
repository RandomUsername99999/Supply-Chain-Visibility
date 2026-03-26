import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import CustomCard from '../UIComponents/Card';
import { useState, useEffect } from 'react';
import { db } from "../Config/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import L from 'leaflet';

// Fix typical Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function auditLogs(){
    return <>
        <div className='flex flex-row'>
        <CustomCard title={"Active Deliveries"} value={458} info={"+3.2% this week"} />
        <CustomCard title = "Assigned Drivers" value = {25} info = "+3.1% this week" />
        <CustomCard title={"Predicted Delays"} value={25} info={"+15 min avg"} />
        <CustomCard title = "Unassigned Tasks" value = {3} info = {3} />
        </div>  
        <VehicleMap />
    </>
}

const VehicleMap = () => {
  const initialCenter = [6.9271, 79.8612];
  const initialZoom = 13;
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "tracking_locations"));
        
        if (querySnapshot.empty) {
          // Seed initial tracking locations if database is completely empty
          const initialLocations = [
            { driver_id: "DRV-1001", vehicle_id: "TRK-9821", lat: 6.9271, lng: 79.8612, status: "in_transit", timestamp: new Date().toISOString() },
            { driver_id: "DRV-1002", vehicle_id: "VAN-4432", lat: 6.8649, lng: 79.8997, status: "idle", timestamp: new Date().toISOString() },
            { driver_id: "DRV-1003", vehicle_id: "TRL-1122", lat: 6.9016, lng: 79.8588, status: "in_transit", timestamp: new Date().toISOString() }
          ];
          
          for (const loc of initialLocations) {
            await addDoc(collection(db, "tracking_locations"), loc);
          }
          
          const newSnapshot = await getDocs(collection(db, "tracking_locations"));
          const newLocationsData = newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setVehicles(newLocationsData);
        } else {
          const locationsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setVehicles(locationsData);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
    // Poll every 3 seconds
    const interval = setInterval(fetchLocations, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MapContainer center={initialCenter} zoom={initialZoom} style={{ height: "400px", width: "100%", marginTop: '20px', borderRadius: '10px' }}>
      <TileLayer
        attribution='&copy; [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {vehicles.map((vehicle) => (
        <Marker
          key={vehicle.driver_id}
          position={[vehicle.lat || 0, vehicle.lng || 0]}
        >
          <Popup>
            <strong>Driver:</strong> {vehicle.driver_id} <br />
            <strong>Vehicle:</strong> {vehicle.vehicle_id} <br />
            <strong>Status:</strong> {vehicle.status} <br />
            <strong>Updated:</strong> {new Date(vehicle.timestamp).toLocaleTimeString()}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

