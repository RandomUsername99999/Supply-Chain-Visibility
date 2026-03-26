import { useState, useEffect } from "react";
import { db } from "../Config/firebase";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { BiPlus, BiPencil, BiTrash } from "react-icons/bi";
import { GiTruck } from "react-icons/gi";

function AddVehiclePopup({ onSuccess, onClose }) {
    const [plateNumber, setPlateNumber] = useState("");
    const [vehicleType, setVehicleType] = useState("Truck");
    const [makeModel, setMakeModel] = useState("");
    const [manufacturer, setManufacturer] = useState("");
    const [year, setYear] = useState(new Date().getFullYear());
    const [capacity, setCapacity] = useState("");
    const [volume, setVolume] = useState("");
    const [registrationExpiry, setRegistrationExpiry] = useState("");
    const [insuranceExpiry, setInsuranceExpiry] = useState("");
    const [isRefrigerated, setIsRefrigerated] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, "vehicles"), {
                plate_number: plateNumber,
                vehicle_type: vehicleType,
                make_model: makeModel,
                manufacturer: manufacturer,
                year: parseInt(year),
                capacity_kg: parseFloat(capacity),
                capacity_volume: volume ? parseFloat(volume) : null,
                registration_expiry: registrationExpiry,
                insurance_expiry: insuranceExpiry,
                is_refrigerated: isRefrigerated,
                status: 'available',
                created_at: new Date().toISOString()
            });
            onSuccess();
        } catch (error) {
            alert("Error registering vehicle: " + error.message);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-[#3E2723]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-7 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-2xl border border-[#F0EBE1] animate-fade-in-up">
                <h2 className="text-xl font-bold mb-5 text-[#3E2723] flex items-center"><GiTruck className="mr-2 text-[#8D6E63] text-2xl" /> Register Logistics Unit</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">License Plate</label>
                        <input type="text" value={plateNumber} onChange={e => setPlateNumber(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] font-bold text-[#3E2723] uppercase outline-none" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">Classification</label>
                        <select value={vehicleType} onChange={e => setVehicleType(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] font-bold text-[#5D4037] outline-none">
                            <option value="Truck">Heavy Duty Truck</option>
                            <option value="Van">Cargo Van</option>
                            <option value="Car">Sedan / Small Courier</option>
                            <option value="Motorcycle">Two-Wheeler</option>
                        </select>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">Make & Model</label>
                        <input type="text" value={makeModel} onChange={e => setMakeModel(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] outline-none" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">Manufacturer</label>
                        <input type="text" value={manufacturer} onChange={e => setManufacturer(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] outline-none" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">Year</label>
                        <input type="number" value={year} onChange={e => setYear(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] outline-none" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">Capacity (KG)</label>
                        <input type="number" step="0.01" value={capacity} onChange={e => setCapacity(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] outline-none" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">Volume (m³)</label>
                        <input type="number" step="0.01" value={volume} onChange={e => setVolume(e.target.value)} className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] outline-none" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">Reg Expiry</label>
                        <input type="date" value={registrationExpiry} onChange={e => setRegistrationExpiry(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] outline-none" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">Ins Expiry</label>
                        <input type="date" value={insuranceExpiry} onChange={e => setInsuranceExpiry(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] outline-none" />
                    </div>
                    <div className="col-span-2 flex items-center mt-2 bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-3">
                        <input type="checkbox" id="addRefrigerated" checked={isRefrigerated} onChange={e => setIsRefrigerated(e.target.checked)} className="mr-3 w-4 h-4 text-[#5D4037] focus:ring-[#8D6E63] rounded" />
                        <label htmlFor="addRefrigerated" className="text-[13px] font-bold text-[#3E2723]">Climate Controlled (Refrigerated) Unit</label>
                    </div>
                    <div className="col-span-2 flex justify-end mt-4">
                        <button type="button" onClick={onClose} className="mr-3 px-5 py-2.5 text-sm font-bold text-[#8C7A70] hover:bg-[#F5F0EB] rounded-xl transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="bg-[#5D4037] hover:bg-[#4E342E] text-white px-6 py-2.5 rounded-xl shadow-md text-sm font-bold transition-all disabled:opacity-70">Add Fleet Unit</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function EditVehiclePopup({ vehicle, onSuccess, onClose }) {
    const [plateNumber, setPlateNumber] = useState(vehicle.plate_number || "");
    const [vehicleType, setVehicleType] = useState(vehicle.vehicle_type || "Truck");
    const [makeModel, setMakeModel] = useState(vehicle.make_model || "");
    const [manufacturer, setManufacturer] = useState(vehicle.manufacturer || "");
    const [year, setYear] = useState(vehicle.year || new Date().getFullYear());
    const [capacity, setCapacity] = useState(vehicle.capacity_kg || "");
    const [volume, setVolume] = useState(vehicle.capacity_volume || "");
    const [registrationExpiry, setRegistrationExpiry] = useState(vehicle.registration_expiry || "");
    const [insuranceExpiry, setInsuranceExpiry] = useState(vehicle.insurance_expiry || "");
    const [isRefrigerated, setIsRefrigerated] = useState(vehicle.is_refrigerated || false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const vehicleRef = doc(db, "vehicles", vehicle.id);
            await updateDoc(vehicleRef, {
                plate_number: plateNumber,
                vehicle_type: vehicleType,
                make_model: makeModel,
                manufacturer: manufacturer,
                year: parseInt(year),
                capacity_kg: parseFloat(capacity),
                capacity_volume: volume ? parseFloat(volume) : null,
                registration_expiry: registrationExpiry,
                insurance_expiry: insuranceExpiry,
                is_refrigerated: isRefrigerated,
                updated_at: new Date().toISOString()
            });
            onSuccess();
        } catch (error) {
            alert("Error updating vehicle: " + error.message);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-[#3E2723]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white p-7 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-2xl border border-[#F0EBE1] transform scale-100 transition-transform">
                <h2 className="text-xl font-bold mb-5 text-[#3E2723] flex items-center"><BiPencil className="mr-2 text-[#8D6E63] text-2xl" /> Edit Logistics Unit</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">License Plate</label>
                        <input type="text" value={plateNumber} onChange={e => setPlateNumber(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] font-bold text-[#3E2723] uppercase outline-none" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">Classification</label>
                        <select value={vehicleType} onChange={e => setVehicleType(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] font-bold text-[#5D4037] outline-none">
                            <option value="Truck">Heavy Duty Truck</option>
                            <option value="Van">Cargo Van</option>
                            <option value="Car">Sedan / Small Courier</option>
                            <option value="Motorcycle">Two-Wheeler</option>
                        </select>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">Make & Model</label>
                        <input type="text" value={makeModel} onChange={e => setMakeModel(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] outline-none" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">Manufacturer</label>
                        <input type="text" value={manufacturer} onChange={e => setManufacturer(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] outline-none" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">Year</label>
                        <input type="number" value={year} onChange={e => setYear(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] outline-none" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">Capacity (KG)</label>
                        <input type="number" step="0.01" value={capacity} onChange={e => setCapacity(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] outline-none" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">Volume (m³)</label>
                        <input type="number" step="0.01" value={volume} onChange={e => setVolume(e.target.value)} className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] outline-none" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">Reg Expiry</label>
                        <input type="date" value={registrationExpiry} onChange={e => setRegistrationExpiry(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] outline-none" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">Ins Expiry</label>
                        <input type="date" value={insuranceExpiry} onChange={e => setInsuranceExpiry(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] outline-none" />
                    </div>
                    <div className="col-span-2 flex items-center mt-2 bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-3">
                        <input type="checkbox" id="editRefrigerated" checked={isRefrigerated} onChange={e => setIsRefrigerated(e.target.checked)} className="mr-3 w-4 h-4 text-[#5D4037] focus:ring-[#8D6E63] rounded" />
                        <label htmlFor="editRefrigerated" className="text-[13px] font-bold text-[#3E2723]">Climate Controlled (Refrigerated) Unit</label>
                    </div>
                    <div className="col-span-2 flex justify-end mt-4">
                        <button type="button" onClick={onClose} className="mr-3 px-5 py-2.5 text-sm font-bold text-[#8C7A70] hover:bg-[#F5F0EB] rounded-xl transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="bg-[#5D4037] hover:bg-[#4E342E] text-white px-6 py-2.5 rounded-xl shadow-md text-sm font-bold transition-all disabled:opacity-70">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function VehicleManagement() {
    const [vehicles, setVehicles] = useState([]);
    const [activeAction, setActiveAction] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    const fetchVehicles = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "vehicles"));
            const vehicleList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setVehicles(vehicleList);
        } catch(e) { console.error(e); }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const filteredVehicles = vehicles.filter(v => 
        (v.plate_number || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
        (v.vehicle_type || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-[#F0EBE1]">
                <div>
                    <p className="text-2xl font-extrabold text-[#3E2723] tracking-tight">Vehicle Management</p>
                    <p className="text-sm text-[#8C7A70] mt-1">Register and maintain the logistics fleet repository.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button
                        className="bg-[#5D4037] hover:bg-[#4E342E] text-white px-5 py-2.5 rounded-[10px] shadow-[0_4px_12px_rgba(93,64,55,0.2)] text-[13px] font-bold transition-all flex items-center"
                        onClick={() => setActiveAction('ADD')}
                    >
                        <BiPlus className="mr-1.5 text-lg" /> Register Vehicle
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#F0EBE1] flex flex-col mt-6 overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-[#F0EBE1] flex flex-col sm:flex-row sm:items-center justify-between bg-[#FCF9F6]/50">
                    <h3 className="text-lg font-bold text-[#3E2723] flex items-center mb-4 sm:mb-0"><GiTruck className="mr-2 text-[#8D6E63] text-2xl"/> Fleet Database</h3>
                    <input 
                        type="text" 
                        placeholder="Search plate or type..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-white border border-[#EAE3D9] rounded-[10px] px-4 py-2 text-[13px] w-64 focus:outline-none focus:border-[#8D6E63]"
                    />
                </div>
                
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-[#F0EBE1] text-[#8C7A70] text-[11px] uppercase tracking-wider">
                                <th className="py-4 px-6 font-bold">Plate Number</th>
                                <th className="py-4 px-6 font-bold">Classification</th>
                                <th className="py-4 px-6 font-bold">Details</th>
                                <th className="py-4 px-6 font-bold">Status</th>
                                <th className="py-4 px-6 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F5F0EB]">
                            {filteredVehicles.map(v => (
                                <tr key={v.id} className="hover:bg-[#FCF9F6] transition-colors">
                                    <td className="py-4 px-6 font-extrabold text-[#3E2723] uppercase tracking-widest">{v.plate_number}</td>
                                    <td className="py-4 px-6 font-bold text-[#8C7A70]">
                                        {v.vehicle_type}
                                        {v.is_refrigerated && <div className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 inline-block ml-2 uppercase tracking-wide">❄️ Cold</div>}
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="text-[12px] font-semibold text-[#5D4037]">{v.make_model} ({v.year})</p>
                                        <p className="text-[11px] text-[#A1887F]">Cap: {v.capacity_kg}kg | Vol: {v.capacity_volume}m³</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={v.status === 'Assigned' || v.status === 'In Use' ? "bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-md border border-indigo-100 uppercase tracking-wider" : "bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md border border-green-100 uppercase tracking-wider"}>
                                            {v.status || "Unassigned"}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button 
                                                onClick={() => { setSelectedVehicle(v); setActiveAction('EDIT'); }}
                                                className="text-[#8D6E63] hover:text-[#5D4037] bg-white border border-[#EAE3D9] hover:bg-[#F5F0EB] p-2 rounded-lg transition-colors shadow-sm" 
                                                title="Edit Vehicle"
                                            >
                                                <BiPencil />
                                            </button>
                                            <button 
                                                onClick={async () => {
                                                    if(window.confirm(`Delete vehicle ${v.plate_number}? This cannot be undone.`)) {
                                                        try {
                                                            await deleteDoc(doc(db, "vehicles", v.id));
                                                            fetchVehicles();
                                                        } catch(e) { alert("Failed to delete vehicle."); }
                                                    }
                                                }}
                                                className="text-[#D32F2F] hover:bg-[#FFF8F8] bg-white border border-[#FFCDD2] p-2 rounded-lg"
                                            >
                                                <BiTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {activeAction === 'ADD' && <AddVehiclePopup onSuccess={() => { setActiveAction(null); fetchVehicles(); }} onClose={() => setActiveAction(null)} />}
            {activeAction === 'EDIT' && selectedVehicle && <EditVehiclePopup vehicle={selectedVehicle} onSuccess={() => { setActiveAction(null); setSelectedVehicle(null); fetchVehicles(); }} onClose={() => { setActiveAction(null); setSelectedVehicle(null); }} />}
        </div>
    );
}
