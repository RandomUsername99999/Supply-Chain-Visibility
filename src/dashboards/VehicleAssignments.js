import { useState, useEffect } from "react";
import { db } from "../Config/firebase";
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from "firebase/firestore";
import { GiPathDistance } from "react-icons/gi";
import { BiHistory, BiTransferAlt, BiDetail, BiXCircle } from "react-icons/bi";

export function AssignmentHistoryPopup({ vehicleId, onClose }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
             try {
                 const q = query(
                     collection(db, "assignments"), 
                     where("vehicle_id", "==", vehicleId)
                 );
                 const querySnapshot = await getDocs(q);
                 const historyData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                 historyData.sort((a,b) => new Date(b.assignment_start_date) - new Date(a.assignment_start_date));
                 setHistory(historyData);
             } catch(e) {
                 console.error("Failed to fetch history");
             }
             setLoading(false);
        };
        fetchHistory();
    }, [vehicleId]);

    return (
        <div className="fixed inset-0 bg-[#3E2723]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-7 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-2xl border border-[#F0EBE1] animate-fade-in-up flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center mb-5 border-b border-[#F0EBE1] pb-3">
                    <h2 className="text-xl font-bold text-[#3E2723] flex items-center"><BiHistory className="mr-2 text-[#8D6E63] text-2xl"/> Asset Audit Trail</h2>
                    <button onClick={onClose} className="text-[#8C7A70] hover:text-[#5D4037] font-bold p-1"><BiXCircle className="text-2xl"/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <p className="text-center text-[#8C7A70] py-8 font-semibold">Retrieving secure logs...</p>
                    ) : history.length === 0 ? (
                        <div className="text-center py-10 bg-[#FCF9F6] rounded-xl border border-dashed border-[#EAE3D9]">
                            <p className="text-[#8C7A70] font-bold">No assignment history found for this vehicle.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map(record => (
                                <div key={record.id} className={`p-4 rounded-xl border ${record.status === 'Active' ? 'bg-[#FDFBF7] border-amber-200 shadow-sm' : 'bg-white border-[#EAE3D9]'} flex flex-col sm:flex-row justify-between sm:items-center`}>
                                    <div>
                                        <p className="text-[13px] font-bold text-[#3E2723] mb-1">Assigned Identity: <span className="text-[#5D4037]">{record.driver_username}</span></p>
                                        <p className="text-[11px] text-[#A1887F] font-semibold"><BiDetail className="inline mr-1"/> Date: {new Date(record.assignment_start_date).toLocaleString()}</p>
                                        {record.assignment_end_date && <p className="text-[11px] text-[#A1887F] font-semibold"><BiDetail className="inline mr-1"/> Rescinded: {new Date(record.assignment_end_date).toLocaleString()}</p>}
                                    </div>
                                    <div className="mt-3 sm:mt-0 text-right">
                                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${record.status === 'Active' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-[#FCF9F6] text-[#8C7A70] border-[#EAE3D9]'}`}>
                                            {record.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VehicleAssignments() {
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [activePopup, setActivePopup] = useState(null);
    const [assignmentFormType, setAssignmentFormType] = useState('ASSIGN');
    const [selectedVehicleId, setSelectedVehicleId] = useState("");
    const [selectedDriverId, setSelectedDriverId] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            const [vehSnapshot, usrSnapshot] = await Promise.all([
                getDocs(collection(db, "vehicles")),
                getDocs(collection(db, "users"))
            ]);
            const vehData = vehSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const usrData = usrSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            setVehicles(vehData);
            setDrivers(usrData.filter(u => u.role === 'driver'));
        } catch(e) { console.error(e); }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter available vs assigned
    const unassignedVehicles = vehicles.filter(v => !v.assignedDriver);
    const assignedVehicles = vehicles.filter(v => v.assignedDriver);
    const assignedDriverIds = vehicles.map(v => v.assignedDriver).filter(id => id !== null && id !== undefined);
    const availableDrivers = drivers.filter(d => !assignedDriverIds.includes(d.id));

    const handleAssignmentUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if(!selectedVehicleId || (!selectedDriverId && assignmentFormType !== 'REVOKE')) {
                throw new Error("Please select valid fields.");
            }
            
            const driverInfo = drivers.find(d => d.id === selectedDriverId);
            
            // 1. Update vehicle assigned driver
            const vehicleRef = doc(db, "vehicles", selectedVehicleId);
            await updateDoc(vehicleRef, {
                assignedDriver: selectedDriverId ? selectedDriverId : null,
                status: selectedDriverId ? 'Assigned' : 'Unassigned',
                updated_at: new Date().toISOString()
            });
            
            // 2. Add an assignment log
            if (selectedDriverId) {
                await addDoc(collection(db, "assignments"), {
                    vehicle_id: selectedVehicleId,
                    driver_id: selectedDriverId,
                    driver_username: driverInfo ? driverInfo.username : 'Unknown',
                    assignment_start_date: new Date().toISOString(),
                    assignment_end_date: null,
                    status: 'Active'
                });
            }
            
            alert(assignmentFormType === 'REVOKE' ? "Assignment revoked!" : "Assignment successful!");
            setActivePopup(null);
            fetchData();
        } catch(err) {
            alert(err.message || "Failed to update assignment constraints.");
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-[#F0EBE1]">
                <div>
                    <p className="text-2xl font-extrabold text-[#3E2723] tracking-tight">Assignment Control</p>
                    <p className="text-sm text-[#8C7A70] mt-1">Strict one-to-one driver and vehicle pairing system.</p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                    <button
                        className="bg-[#5D4037] hover:bg-[#4E342E] text-white px-5 py-2.5 rounded-[10px] shadow-[0_4px_12px_rgba(93,64,55,0.2)] text-[13px] font-bold transition-all flex items-center"
                        onClick={() => {
                            setAssignmentFormType('ASSIGN');
                            setSelectedVehicleId("");
                            setSelectedDriverId("");
                            setActivePopup('ASSIGNMENT_FORM');
                        }}
                    >
                        <GiPathDistance className="mr-1.5 text-lg" /> Assign Vehicle
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Assignments List */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#F0EBE1] flex flex-col p-5 sm:p-6 min-h-[400px]">
                    <h3 className="text-lg font-bold text-[#3E2723] mb-4 flex items-center"><BiTransferAlt className="mr-2 text-[#8D6E63] text-2xl"/> Active Connections</h3>
                    <div className="overflow-y-auto flex-1 custom-scrollbar pr-2">
                        {assignedVehicles.length === 0 ? (
                            <p className="text-sm font-semibold text-[#8C7A70] text-center mt-10">No active assignments found.</p>
                        ) : assignedVehicles.map(v => {
                            const drv = drivers.find(d => d.id === v.assignedDriver);
                            const isRefrigerated = v.is_refrigerated;
                            return (
                                <div key={v.id} className="bg-[#FCF9F6] border border-[#EAE3D9] p-4 rounded-xl mb-3 flex flex-col group hover:bg-[#F5F0EB] transition-colors">
                                    <div className="flex justify-between w-full mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[13px] font-extrabold text-[#3E2723] uppercase">{v.plate_number}</span>
                                            {isRefrigerated && (
                                                <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-wide font-bold">❄️ Cold</span>
                                            )}
                                        </div>
                                        <span className="text-[12px] font-bold text-[#8D6E63]">{drv ? drv.username : `Driver #${v.assignedDriver}`}</span>
                                    </div>
                                    <div className="flex justify-between w-full items-center">
                                        <div className="text-[11px] text-[#A1887F] font-semibold">
                                            <span>{v.vehicle_type} · {v.make_model}</span>
                                            <span className="ml-2">Cap: {v.capacity_kg ?? '—'}kg | Vol: {v.capacity_volume ?? '—'}m³</span>
                                        </div>
                                        <div className="flex space-x-2 mt-2 sm:mt-0">
                                            <button onClick={() => setActivePopup(v.id)} className="text-[10px] bg-white border border-[#D7CCC8] px-2 py-1 rounded text-[#5D4037] font-bold hover:bg-[#EAE3D9] transition-colors">Audit</button>
                                            <button 
                                                onClick={async () => {
                                                    if(window.confirm(`Revoke assignment for ${v.plate_number}?`)) {
                                                        try {
                                                            await updateDoc(doc(db, "vehicles", v.id), { 
                                                                assignedDriver: null,
                                                                status: 'Unassigned',
                                                                updated_at: new Date().toISOString()
                                                            });
                                                            const q = query(collection(db, "assignments"), where("vehicle_id", "==", v.id), where("status", "==", "Active"));
                                                            const activeAssignments = await getDocs(q);
                                                            for (const docSnap of activeAssignments.docs) {
                                                                await updateDoc(doc(db, "assignments", docSnap.id), {
                                                                    status: 'Revoked',
                                                                    assignment_end_date: new Date().toISOString()
                                                                });
                                                            }
                                                            fetchData();
                                                        } catch (err) {
                                                            alert("Failed to revoke assignment");
                                                        }
                                                    }
                                                }}
                                                className="text-[10px] bg-[#FFF8F8] border border-[#FFCDD2] px-2 py-1 rounded text-[#D32F2F] font-bold hover:bg-[#FFEBEE] transition-colors">Revoke</button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Available Assets Panel */}
                <div className="bg-[#FDFBF7] rounded-2xl shadow-inner border border-[#F0EBE1] flex flex-col p-5 sm:p-6 min-h-[400px]">
                    <h3 className="text-lg font-bold text-[#3E2723] mb-4 flex items-center"><GiPathDistance className="mr-2 text-[#8D6E63] text-2xl"/> Available Capacity</h3>
                    <div className="grid grid-cols-2 gap-4 h-full">
                        <div className="bg-white border border-[#EAE3D9] rounded-xl p-4 shadow-sm overflow-y-auto custom-scrollbar h-[350px]">
                            <h4 className="text-[12px] font-bold text-[#A1887F] uppercase tracking-wider mb-3">Unassigned Vehicles ({unassignedVehicles.length})</h4>
                            {unassignedVehicles.map(v => (
                                <div key={v.id} className="text-[12px] font-bold text-[#5D4037] bg-[#FCF9F6] p-2 rounded mb-2 border border-[#F0EBE1] uppercase">
                                    <div className="flex items-center gap-1.5">
                                        {v.plate_number}
                                        {v.is_refrigerated && <span className="text-[9px] text-blue-600 bg-blue-50 px-1 py-0.5 rounded border border-blue-100 uppercase tracking-wide font-bold">❄️</span>}
                                    </div>
                                    <span className="text-[10px] font-normal lowercase text-[#8C7A70] block">({v.vehicle_type}) {v.capacity_kg}kg | {v.capacity_volume ?? '—'}m³</span>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white border border-[#EAE3D9] rounded-xl p-4 shadow-sm overflow-y-auto custom-scrollbar h-[350px]">
                            <h4 className="text-[12px] font-bold text-[#A1887F] uppercase tracking-wider mb-3">Idle Drivers ({availableDrivers.length})</h4>
                            {availableDrivers.map(d => (
                                <div key={d.id} className="text-[12px] font-bold text-[#5D4037] bg-[#FCF9F6] p-2 rounded mb-2 border border-[#EAE3D9]">
                                    {d.username} <span className="text-[10px] font-normal text-[#8C7A70]">({d.email})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Assignment form popup */}
            {activePopup === 'ASSIGNMENT_FORM' && (
                <div className="fixed inset-0 bg-[#3E2723]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-7 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-md border border-[#F0EBE1] animate-fade-in-up">
                        <h2 className="text-xl font-bold mb-5 text-[#3E2723] flex items-center"><GiPathDistance className="mr-2 text-[#8D6E63] text-2xl" /> Create Secure Binding</h2>
                        <form onSubmit={handleAssignmentUpdate}>
                            <div className="mb-4">
                                <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Select Available Vehicle</label>
                                <select value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm focus:border-[#8D6E63] font-bold text-[#5D4037] outline-none">
                                    <option value="" disabled>-- Select Vehicle --</option>
                                    {unassignedVehicles.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.plate_number} · {v.vehicle_type}{v.is_refrigerated ? ' ❄️' : ''} · {v.capacity_kg}kg{v.capacity_volume ? ` / ${v.capacity_volume}m³` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-5">
                                <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Select Available Driver</label>
                                <select value={selectedDriverId} onChange={e => setSelectedDriverId(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm focus:border-[#8D6E63] font-bold text-[#5D4037] outline-none">
                                    <option value="" disabled>-- Select Driver --</option>
                                    {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.username}</option>)}
                                </select>
                            </div>
                            <p className="text-[11px] text-[#8C7A70] mb-5 p-3 bg-[#F5F0EB] rounded-lg border border-[#EAE3D9]">
                                <strong>System Note:</strong> Creating this mapping will initiate a tracking sequence log.
                            </p>
                            <div className="flex justify-end pt-2">
                                <button type="button" onClick={() => setActivePopup(null)} className="mr-3 px-5 py-2.5 text-sm font-bold text-[#8C7A70] hover:bg-[#F5F0EB] rounded-xl transition-colors">Abort</button>
                                <button type="submit" disabled={loading} className="bg-[#5D4037] hover:bg-[#4E342E] text-white px-6 py-2.5 rounded-xl shadow-md text-sm font-bold transition-all disabled:opacity-70">Initialize Binding</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* History Popup via ID check */}
            {activePopup && activePopup !== 'ASSIGNMENT_FORM' && <AssignmentHistoryPopup vehicleId={activePopup} onClose={() => setActivePopup(null)} />}
        </div>
    );
}
