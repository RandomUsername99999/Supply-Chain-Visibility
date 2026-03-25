import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import CustomCard from '../UIComponents/Card';

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
  const vehicles = [
  { id: 1, lat: 6.91, lng: 79.9, name: 'Cold Truck', type: 'AC Truck' },
  { id: 2, lat: 6.909603, lng: 79.885671, name: 'Big Truck', type: 'truck' },
  // ... more vehicles
];


  return (
    <MapContainer center={initialCenter} zoom={initialZoom} style={{ height: "200px", width: "40%" }}>
      <TileLayer
        attribution='&copy; [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {vehicles.map((vehicle) => (
        <Marker
          key={vehicle.id}
          position={[vehicle.lat, vehicle.lng]}
        >
          <Popup>
            {vehicle.name} <br /> {vehicle.type}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
