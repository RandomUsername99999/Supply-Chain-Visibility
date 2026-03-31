import { useState, useEffect } from "react";
import { db } from "../Config/firebase";
import { collection, getDocs, updateDoc, doc, query, where, orderBy } from "firebase/firestore";
import { BiTransferAlt, BiPackage, BiXCircle, BiCheckCircle } from "react-icons/bi";
import { GiTruck } from "react-icons/gi";

export default function OrderAssignment() {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [assignedVehicles, setAssignedVehicles] = useState([]);
    const [vehiclesOrderCounts, setVehiclesOrderCounts] = useState({});
    const [selectedOrderId, setSelectedOrderId] = useState("");
    const [selectedVehicleId, setSelectedVehicleId] = useState("");
    const [loading, setLoading] = useState(false);
    const [viewingVehicleOrders, setViewingVehicleOrders] = useState(null);
    const [vehicleOrdersList, setVehicleOrdersList] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Pending Orders - Removed orderBy to avoid index requirement for new users
            try {
                const ordersQ = query(collection(db, "orders"), where("status", "==", "Pending"));
                const ordersSnapshot = await getDocs(ordersQ);
                const ordersData = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Sort manually in JS to avoid index requirement
                ordersData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setPendingOrders(ordersData);
            } catch (err) {
                console.error("Orders Fetch Error:", err);
            }

            // 2. Fetch Assigned Vehicles
            try {
                const vehiclesQ = query(collection(db, "vehicles"), where("status", "==", "Assigned"));
                const vehiclesSnapshot = await getDocs(vehiclesQ);
                setAssignedVehicles(vehiclesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                console.error("Vehicles Fetch Error:", err);
            }

            // 3. Fetch all assigned orders for counts
            try {
                const allAssignedOrdersQ = query(collection(db, "orders"), where("status", "==", "Assigned"));
                const allAssignedOrdersSnapshot = await getDocs(allAssignedOrdersQ);
                const counts = {};
                allAssignedOrdersSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.vehicle_id) {
                        counts[data.vehicle_id] = (counts[data.vehicle_id] || 0) + 1;
                    }
                });
                setVehiclesOrderCounts(counts);
            } catch (err) {
                console.error("Counts Fetch Error:", err);
            }

        } catch (e) {
            console.error("General Fetch Failure:", e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssignOrder = async (e) => {
        e.preventDefault();
        if (!selectedOrderId || !selectedVehicleId) return;

        setLoading(true);
        try {
            const orderRef = doc(db, "orders", selectedOrderId);
            const vehicle = assignedVehicles.find(v => v.id === selectedVehicleId);
            
            await updateDoc(orderRef, {
                vehicle_id: selectedVehicleId,
                driver_id: vehicle.assignedDriver || null,
                status: 'Assigned',
                assigned_at: new Date().toISOString()
            });

            alert("Order assigned successfully!");
            setSelectedOrderId("");
            setSelectedVehicleId("");
            fetchData();
        } catch (err) {
            alert("Failed to assign order: " + err.message);
        }
        setLoading(false);
    };

    const fetchVehicleOrders = async (vehicle) => {
        setViewingVehicleOrders(vehicle);
        try {
            const q = query(collection(db, "orders"), where("vehicle_id", "==", vehicle.id));
            const snapshot = await getDocs(q);
            setVehicleOrdersList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#F0EBE1]">
                <p className="text-2xl font-extrabold text-[#3E2723] tracking-tight">Dispatch Coordination</p>
                <p className="text-sm text-[#8C7A70] mt-1">Efficiently distribute pending orders across the active fleet.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Assignment Controls */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#F0EBE1] h-full">
                        <h3 className="text-lg font-bold text-[#3E2723] mb-5 flex items-center"><BiTransferAlt className="mr-2 text-[#8D6E63] text-2xl"/> Assign Order</h3>
                        <form onSubmit={handleAssignOrder} className="space-y-5">
                            <div>
                                <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Select Pending Order</label>
                                <select 
                                    value={selectedOrderId} 
                                    onChange={e => setSelectedOrderId(e.target.value)} 
                                    required 
                                    className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm focus:border-[#8D6E63] font-bold text-[#5D4037] outline-none"
                                >
                                    <option value="" disabled>-- Choose Order --</option>
                                    {pendingOrders.map(o => (
                                        <option key={o.id} value={o.id}>
                                            {o.order_number} · {o.customer_name} ({o.capacity_kg}kg)
                                        </option>
                                    ))}
                                </select>
                                {pendingOrders.length === 0 && <p className="text-[10px] text-amber-600 mt-1 font-semibold">No pending orders available.</p>}
                            </div>

                            <div>
                                <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Select Target Vehicle</label>
                                <select 
                                    value={selectedVehicleId} 
                                    onChange={e => setSelectedVehicleId(e.target.value)} 
                                    required 
                                    className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm focus:border-[#8D6E63] font-bold text-[#5D4037] outline-none"
                                >
                                    <option value="" disabled>-- Choose Vehicle --</option>
                                    {assignedVehicles.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.plate_number} · {v.vehicle_type} (Orders: {vehiclesOrderCounts[v.id] || 0})
                                        </option>
                                    ))}
                                </select>
                                {assignedVehicles.length === 0 && <p className="text-[10px] text-red-600 mt-1 font-semibold">No assigned vehicles (drivers) available.</p>}
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading || !selectedOrderId || !selectedVehicleId} 
                                className="w-full bg-[#5D4037] hover:bg-[#4E342E] text-white py-3 rounded-xl shadow-md text-[13px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                <BiCheckCircle className="mr-2 text-lg" /> Complete Assignment
                            </button>
                        </form>

                        <div className="mt-8 p-4 bg-[#FDFBF7] rounded-xl border border-[#F0EBE1]">
                            <p className="text-[11px] text-[#A1887F] leading-relaxed">
                                <strong className="text-[#8D6E63] block mb-1">Dispatch Intelligence:</strong>
                                Orders are assigned to vehicles that have an active driver binding. You can monitor load distribution via the order counts.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Lists */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Pending Orders List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#F0EBE1] p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-[#3E2723] flex items-center"><BiPackage className="mr-2 text-[#8D6E63] text-2xl"/> Unassigned Queue ({pendingOrders.length})</h3>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                            {pendingOrders.length === 0 ? (
                                <p className="text-center py-10 text-[#8C7A70] text-sm font-semibold">Queue is empty. Total efficiency achieved.</p>
                            ) : pendingOrders.map(o => (
                                <div key={o.id} className="bg-[#FCF9F6] border border-[#EAE3D9] p-4 rounded-xl flex justify-between items-center group hover:bg-[#F5F0EB] transition-colors">
                                    <div>
                                        <p className="text-[13px] font-extrabold text-[#3E2723] uppercase">{o.order_number} · <span className="text-[#8C7A70] font-bold">{o.customer_name}</span></p>
                                        <p className="text-[11px] text-[#A1887F] font-semibold mt-1">{o.items_summary} | {o.capacity_kg}kg</p>
                                        <p className="text-[10px] text-[#BCAAA4] mt-0.5">{o.delivery_address}</p>
                                    </div>
                                    <button 
                                        onClick={() => { setSelectedOrderId(o.id); document.querySelector('select').scrollIntoView({ behavior: 'smooth' }); }}
                                        className="text-[10px] bg-white border border-[#D7CCC8] px-3 py-1.5 rounded-lg text-[#5D4037] font-bold hover:bg-[#8D6E63] hover:text-white transition-all shadow-sm"
                                    >
                                        Select
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active Fleet Utilization */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#F0EBE1] p-6">
                        <h3 className="text-lg font-bold text-[#3E2723] mb-4 flex items-center"><GiTruck className="mr-2 text-[#8D6E63] text-2xl"/> Fleet Utilization</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {assignedVehicles.length === 0 ? (
                                <div className="col-span-2 text-center py-10 text-[#8C7A70] text-sm font-semibold bg-[#FCF9F6] rounded-xl border border-dashed border-[#EAE3D9]">
                                    No active vehicle-driver connections found.
                                </div>
                            ) : assignedVehicles.map(v => (
                                <div key={v.id} className="bg-[#FCF9F6] border border-[#EAE3D9] p-4 rounded-xl flex flex-col justify-between hover:border-[#8D6E63] transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-[13px] font-extrabold text-[#3E2723] uppercase">{v.plate_number}</p>
                                            <p className="text-[10px] text-[#8C7A70] font-bold">{v.vehicle_type} · {v.make_model}</p>
                                        </div>
                                        <div className="bg-white px-2 py-1 rounded-lg border border-[#EAE3D9] text-center min-w-[50px]">
                                            <p className="text-[14px] font-black text-[#5D4037] leading-tight">{vehiclesOrderCounts[v.id] || 0}</p>
                                            <p className="text-[8px] text-[#A1887F] font-bold uppercase tracking-tighter">Orders</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => fetchVehicleOrders(v)}
                                        className="w-full mt-2 text-[10px] bg-white border border-[#D7CCC8] py-1.5 rounded-lg text-[#5D4037] font-bold hover:bg-[#8D6E63] hover:text-white transition-all"
                                    >
                                        Inspect Manifest
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Vehicle Manifest Popup */}
            {viewingVehicleOrders && (
                <div className="fixed inset-0 bg-[#3E2723]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-7 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-2xl border border-[#F0EBE1] animate-fade-in-up flex flex-col max-h-[85vh]">
                        <div className="flex justify-between items-center mb-5 border-b border-[#F0EBE1] pb-3">
                            <div>
                                <h2 className="text-xl font-bold text-[#3E2723] flex items-center">
                                    <BiPackage className="mr-2 text-[#8D6E63] text-2xl"/> 
                                    Manifest: {viewingVehicleOrders.plate_number}
                                </h2>
                                <p className="text-[11px] text-[#8C7A70] font-semibold mt-0.5">Assigned Payload Details</p>
                            </div>
                            <button onClick={() => setViewingVehicleOrders(null)} className="text-[#8C7A70] hover:text-[#5D4037] font-bold p-1"><BiXCircle className="text-2xl"/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {vehicleOrdersList.length === 0 ? (
                                <div className="text-center py-10 bg-[#FCF9F6] rounded-xl border border-dashed border-[#EAE3D9]">
                                    <p className="text-[#8C7A70] font-bold">No orders currently assigned to this vehicle.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {vehicleOrdersList.map(order => (
                                        <div key={order.id} className="p-4 rounded-xl border border-[#EAE3D9] bg-white flex justify-between items-center">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[13px] font-bold text-[#3E2723]">{order.order_number}</span>
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                                                        order.status === 'Assigned' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                                        order.status === 'In Transit' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                                        'bg-green-50 text-green-700 border-green-100'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-[#5D4037] font-bold">{order.customer_name}</p>
                                                <p className="text-[10px] text-[#A1887F] font-semibold">{order.items_summary} | {order.capacity_kg}kg</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-[#8D6E63]">Due Date</p>
                                                <p className="text-[12px] font-black text-[#5D4037]">{order.delivery_date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
