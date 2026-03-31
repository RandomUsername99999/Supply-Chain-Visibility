import { useState, useEffect } from "react";
import { db } from "../Config/firebase";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, orderBy } from "firebase/firestore";
import { BiPlus, BiPencil, BiTrash, BiPackage } from "react-icons/bi";
import { GiBoxUnpacking } from "react-icons/gi";

// --- Validation Helpers ---
function validateRequired(val) {
    return val && val.trim().length > 0;
}

function FieldError({ msg }) {
    if (!msg) return null;
    return <p className="text-red-500 text-[11px] mt-1 font-semibold">{msg}</p>;
}

// --- Order Form Fields ---
function OrderFormFields({ state, setState, errors, setErrors }) {
    const { customerName, deliveryAddress, itemsSummary, capacityKg, deliveryDate } = state;

    const set = (key, val) => setState(prev => ({ ...prev, [key]: val }));
    const clearErr = (key) => setErrors(prev => ({ ...prev, [key]: '' }));

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
                <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">Customer Name</label>
                <input
                    type="text"
                    value={customerName}
                    onChange={e => { set('customerName', e.target.value); clearErr('customerName'); }}
                    required
                    placeholder="Enter customer name"
                    className={`w-full bg-[#FCF9F6] border ${errors.customerName ? 'border-red-400' : 'border-[#EAE3D9]'} rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] font-bold text-[#3E2723] outline-none`}
                />
                <FieldError msg={errors.customerName} />
            </div>
            <div className="col-span-2">
                <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">Delivery Address</label>
                <textarea
                    value={deliveryAddress}
                    onChange={e => { set('deliveryAddress', e.target.value); clearErr('deliveryAddress'); }}
                    required
                    placeholder="Enter full delivery address"
                    rows="2"
                    className={`w-full bg-[#FCF9F6] border ${errors.deliveryAddress ? 'border-red-400' : 'border-[#EAE3D9]'} rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] font-bold text-[#3E2723] outline-none`}
                />
                <FieldError msg={errors.deliveryAddress} />
            </div>
            <div className="col-span-2">
                <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">Items Summary</label>
                <input
                    type="text"
                    value={itemsSummary}
                    onChange={e => { set('itemsSummary', e.target.value); clearErr('itemsSummary'); }}
                    required
                    placeholder="e.g. 5 Boxes of electronics"
                    className={`w-full bg-[#FCF9F6] border ${errors.itemsSummary ? 'border-red-400' : 'border-[#EAE3D9]'} rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] font-bold text-[#3E2723] outline-none`}
                />
                <FieldError msg={errors.itemsSummary} />
            </div>
            <div className="col-span-2 sm:col-span-1">
                <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">Capacity (KG)</label>
                <input
                    type="number"
                    step="0.01"
                    value={capacityKg}
                    onChange={e => { set('capacityKg', e.target.value); clearErr('capacityKg'); }}
                    required
                    className={`w-full bg-[#FCF9F6] border ${errors.capacityKg ? 'border-red-400' : 'border-[#EAE3D9]'} rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] outline-none`}
                />
                <FieldError msg={errors.capacityKg} />
            </div>
            <div className="col-span-2 sm:col-span-1">
                <label className="block text-[12px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wide">Expected Delivery</label>
                <input
                    type="date"
                    value={deliveryDate}
                    onChange={e => { set('deliveryDate', e.target.value); clearErr('deliveryDate'); }}
                    required
                    className={`w-full bg-[#FCF9F6] border ${errors.deliveryDate ? 'border-red-400' : 'border-[#EAE3D9]'} rounded-xl px-4 py-2 text-sm focus:border-[#8D6E63] outline-none`}
                />
                <FieldError msg={errors.deliveryDate} />
            </div>
        </div>
    );
}

function validateOrderForm(state) {
    const errors = {};
    if (!validateRequired(state.customerName)) errors.customerName = "Customer name is required.";
    if (!validateRequired(state.deliveryAddress)) errors.deliveryAddress = "Delivery address is required.";
    if (!validateRequired(state.itemsSummary)) errors.itemsSummary = "Items summary is required.";
    if (!state.capacityKg || parseFloat(state.capacityKg) <= 0) errors.capacityKg = "Capacity must be greater than 0.";
    if (!validateRequired(state.deliveryDate)) errors.deliveryDate = "Delivery date is required.";
    return errors;
}

function AddOrderPopup({ onSuccess, onClose }) {
    const [formState, setFormState] = useState({
        customerName: "",
        deliveryAddress: "",
        itemsSummary: "",
        capacityKg: "",
        deliveryDate: new Date().toISOString().split('T')[0]
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateOrderForm(formState);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setLoading(true);
        try {
            const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
            await addDoc(collection(db, "orders"), {
                order_number: orderNumber,
                customer_name: formState.customerName,
                delivery_address: formState.deliveryAddress,
                items_summary: formState.itemsSummary,
                capacity_kg: parseFloat(formState.capacityKg),
                delivery_date: formState.deliveryDate,
                status: 'Pending',
                vehicle_id: null,
                driver_id: null,
                created_at: new Date().toISOString()
            });
            onSuccess();
        } catch (error) {
            alert("Error creating order: " + error.message);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-[#3E2723]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-7 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-lg border border-[#F0EBE1] animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-5 text-[#3E2723] flex items-center"><BiPackage className="mr-2 text-[#8D6E63] text-2xl" /> Create New Order</h2>
                <form onSubmit={handleSubmit}>
                    <OrderFormFields state={formState} setState={setFormState} errors={errors} setErrors={setErrors} />
                    <div className="flex justify-end mt-6">
                        <button type="button" onClick={onClose} className="mr-3 px-5 py-2.5 text-sm font-bold text-[#8C7A70] hover:bg-[#F5F0EB] rounded-xl transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="bg-[#5D4037] hover:bg-[#4E342E] text-white px-6 py-2.5 rounded-xl shadow-md text-sm font-bold transition-all disabled:opacity-70">Create Order</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function EditOrderPopup({ order, onSuccess, onClose }) {
    const [formState, setFormState] = useState({
        customerName: order.customer_name || "",
        deliveryAddress: order.delivery_address || "",
        itemsSummary: order.items_summary || "",
        capacityKg: order.capacity_kg || "",
        deliveryDate: order.delivery_date || ""
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateOrderForm(formState);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setLoading(true);
        try {
            const orderRef = doc(db, "orders", order.id);
            await updateDoc(orderRef, {
                customer_name: formState.customerName,
                delivery_address: formState.deliveryAddress,
                items_summary: formState.itemsSummary,
                capacity_kg: parseFloat(formState.capacityKg),
                delivery_date: formState.deliveryDate,
                updated_at: new Date().toISOString()
            });
            onSuccess();
        } catch (error) {
            alert("Error updating order: " + error.message);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-[#3E2723]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white p-7 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-lg border border-[#F0EBE1] max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-5 text-[#3E2723] flex items-center"><BiPencil className="mr-2 text-[#8D6E63] text-2xl" /> Edit Order Details</h2>
                <form onSubmit={handleSubmit}>
                    <OrderFormFields state={formState} setState={setFormState} errors={errors} setErrors={setErrors} />
                    <div className="flex justify-end mt-6">
                        <button type="button" onClick={onClose} className="mr-3 px-5 py-2.5 text-sm font-bold text-[#8C7A70] hover:bg-[#F5F0EB] rounded-xl transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="bg-[#5D4037] hover:bg-[#4E342E] text-white px-6 py-2.5 rounded-xl shadow-md text-sm font-bold transition-all disabled:opacity-70">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [activeAction, setActiveAction] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        try {
            const q = query(collection(db, "orders"), orderBy("created_at", "desc"));
            const querySnapshot = await getDocs(q);
            const orderList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrders(orderList);
        } catch(e) { console.error(e); }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const lowerQuery = searchQuery.toLowerCase();
    const filteredOrders = orders.filter(o =>
        (o.order_number || "").toLowerCase().includes(lowerQuery) ||
        (o.customer_name || "").toLowerCase().includes(lowerQuery) ||
        (o.delivery_address || "").toLowerCase().includes(lowerQuery)
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'Assigned': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'In Transit': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'Delivered': return 'bg-green-50 text-green-700 border-green-100';
            case 'Cancelled': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-[#F0EBE1]">
                <div>
                    <p className="text-2xl font-extrabold text-[#3E2723] tracking-tight">Order Management</p>
                    <p className="text-sm text-[#8C7A70] mt-1">Manage customer orders and delivery requirements.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button
                        className="bg-[#5D4037] hover:bg-[#4E342E] text-white px-5 py-2.5 rounded-[10px] shadow-[0_4px_12px_rgba(93,64,55,0.2)] text-[13px] font-bold transition-all flex items-center"
                        onClick={() => setActiveAction('ADD')}
                    >
                        <BiPlus className="mr-1.5 text-lg" /> Create Order
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#F0EBE1] flex flex-col mt-6 overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-[#F0EBE1] flex flex-col sm:flex-row sm:items-center justify-between bg-[#FCF9F6]/50">
                    <h3 className="text-lg font-bold text-[#3E2723] flex items-center mb-4 sm:mb-0"><GiBoxUnpacking className="mr-2 text-[#8D6E63] text-2xl"/> Orders Repository</h3>
                    <input 
                        type="text" 
                        placeholder="Search order #, customer, or address..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-white border border-[#EAE3D9] rounded-[10px] px-4 py-2 text-[13px] w-64 focus:outline-none focus:border-[#8D6E63]"
                    />
                </div>
                
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-[#F0EBE1] text-[#8C7A70] text-[11px] uppercase tracking-wider">
                                <th className="py-4 px-6 font-bold">Order #</th>
                                <th className="py-4 px-6 font-bold">Customer</th>
                                <th className="py-4 px-6 font-bold">Address</th>
                                <th className="py-4 px-6 font-bold">Requirement</th>
                                <th className="py-4 px-6 font-bold">Status</th>
                                <th className="py-4 px-6 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F5F0EB]">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-10 text-center text-[#8C7A70] font-semibold">No orders found matching your search.</td>
                                </tr>
                            ) : filteredOrders.map(o => (
                                <tr key={o.id} className="hover:bg-[#FCF9F6] transition-colors">
                                    <td className="py-4 px-6 font-extrabold text-[#3E2723] uppercase tracking-wider">{o.order_number}</td>
                                    <td className="py-4 px-6 font-bold text-[#5D4037]">{o.customer_name}</td>
                                    <td className="py-4 px-6 text-[12px] text-[#8C7A70] max-w-[200px] truncate" title={o.delivery_address}>{o.delivery_address}</td>
                                    <td className="py-4 px-6">
                                        <p className="text-[12px] font-semibold text-[#5D4037]">{o.items_summary}</p>
                                        <p className="text-[11px] text-[#A1887F]">{o.capacity_kg}kg | Due: {o.delivery_date}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${getStatusColor(o.status)}`}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button 
                                                onClick={() => { setSelectedOrder(o); setActiveAction('EDIT'); }}
                                                className="text-[#8D6E63] hover:text-[#5D4037] bg-white border border-[#EAE3D9] hover:bg-[#F5F0EB] p-2 rounded-lg transition-colors shadow-sm" 
                                                title="Edit Order"
                                            >
                                                <BiPencil />
                                            </button>
                                            <button 
                                                onClick={async () => {
                                                    if(window.confirm(`Delete order ${o.order_number}? This cannot be undone.`)) {
                                                        try {
                                                            await deleteDoc(doc(db, "orders", o.id));
                                                            fetchOrders();
                                                        } catch(e) { alert("Failed to delete order."); }
                                                    }
                                                }}
                                                className="text-[#D32F2F] hover:bg-[#FFF8F8] bg-white border border-[#FFCDD2] p-2 rounded-lg"
                                                title="Delete Order"
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

            {activeAction === 'ADD' && <AddOrderPopup onSuccess={() => { setActiveAction(null); fetchOrders(); }} onClose={() => setActiveAction(null)} />}
            {activeAction === 'EDIT' && selectedOrder && <EditOrderPopup order={selectedOrder} onSuccess={() => { setActiveAction(null); setSelectedOrder(null); fetchOrders(); }} onClose={() => { setActiveAction(null); setSelectedOrder(null); }} />}
        </div>
    );
}
