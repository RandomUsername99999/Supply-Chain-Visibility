import CustomCard from "../UIComponents/Card";
import { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, setDoc, doc, getDocs, updateDoc, query, where, onSnapshot, addDoc, deleteDoc } from "firebase/firestore";
import { db, firebaseConfig } from "../Config/firebase";

export default function Dashboard() {
    const [activePopup, setActivePopup] = useState(null);

    return (<>
        <div className="flex justify-between">
            <p className="text-2xl font-bold">System Administrator Centralized Dashboard</p>
            <div className="pr-5 space-x-4">
                <button
                    className="bg-amber-900 text-white px-3 py-1 rounded shadow-md text-sm transition-colors"
                    onClick={() => setActivePopup('CREATE_USER')}
                >
                    Create User Account
                </button>
                <button
                    className="bg-amber-900 text-white px-3 py-1 rounded shadow-md text-sm transition-colors"
                    onClick={() => setActivePopup('ASSIGN_ROLES')}
                >
                    Assign Roles
                </button>
                <button
                    className="bg-amber-900 text-white px-3 py-1 rounded shadow-md text-sm transition-colors"
                    onClick={() => setActivePopup('DEACTIVATE_USER')}
                >
                    Deactivate User
                </button>
            </div>
        </div>
        <div className="flex flex-row">
            <CustomCard title="Active Users" value="12,450" info="1.5% this week" width={300} height={80} />
            <CustomCard title="Admins" value="350" info="2.8% of total" width={300} height={80} />
            <CustomCard title="Deactivated Accounts" value="115" info="-5 this month" width={300} height={80} />
        </div>
        <div>
            <VehicleManagementCard />
        </div>

        {activePopup === 'CREATE_USER' && <CreateUserPopup onClose={() => setActivePopup(null)} />}
        {activePopup === 'ASSIGN_ROLES' && <AssignRolesPopup onClose={() => setActivePopup(null)} />}
        {activePopup === 'DEACTIVATE_USER' && <DeactivateUserPopup onClose={() => setActivePopup(null)} />}
    </>)
}

function CreateUserPopup({ onClose }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("driver");
    const [location, setLocation] = useState("");
    const [licenseId, setLicenseId] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let secondaryApp;
            if (!getApps().length || !getApps().find(app => app.name === 'SecondaryApp')) {
                secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
            } else {
                secondaryApp = getApps().find(app => app.name === 'SecondaryApp');
            }
            const secondaryAuth = getAuth(secondaryApp);

            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
            const userData = {
                email,
                username,
                role: role,
                status: 'active'
            };
            if (role === 'retailer') userData.location = location;
            if (role === 'driver') userData.licenseId = licenseId;

            await setDoc(doc(db, "users", userCredential.user.uid), userData);
            alert("User created successfully!");
            onClose();
        } catch (error) {
            alert("Error creating user: " + error.message);
        }
        setLoading(false);
    };

    return (<>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Create User Account</h2>
                <form onSubmit={handleCreate}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Username</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Role</label>
                        <select value={role} onChange={e => {
                            setRole(e.target.value);
                            setLocation("");
                            setLicenseId("");
                        }} className="w-full border rounded px-3 py-2">
                            <option value="admin">Admin</option>
                            <option value="dispatcher">Dispatcher</option>
                            <option value="driver">Driver</option>
                            <option value="retailer">Retailer</option>
                        </select>
                    </div>
                    {role === 'retailer' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Location</label>
                            <input type="text" value={location} onChange={e => setLocation(e.target.value)} required className="w-full border rounded px-3 py-2" />
                        </div>
                    )}
                    {role === 'driver' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">License ID</label>
                            <input type="text" value={licenseId} onChange={e => setLicenseId(e.target.value)} required className="w-full border rounded px-3 py-2" />
                        </div>
                    )}
                    <div className="flex justify-end">
                        <button type="button" onClick={onClose} className="mr-2 px-4 py-2 border rounded">Cancel</button>
                        <button type="submit" disabled={loading} className="bg-amber-900 text-white px-4 py-2 rounded">
                            {loading ? "Creating..." : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </>)
}

function AssignRolesPopup({ onClose }) {
    const [identifier, setIdentifier] = useState("");
    const [userDoc, setUserDoc] = useState(null);
    const [newRole, setNewRole] = useState("driver");
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const usersRef = collection(db, "users");
            let q = query(usersRef, where("email", "==", identifier));
            let snapshot = await getDocs(q);
            if (snapshot.empty) {
                q = query(usersRef, where("username", "==", identifier));
                snapshot = await getDocs(q);
            }
            if (!snapshot.empty) {
                setUserDoc({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
                setNewRole(snapshot.docs[0].data().role);
            } else {
                alert("User not found");
                setUserDoc(null);
            }
        } catch (error) {
            alert(error.message);
        }
        setLoading(false);
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            if (!userDoc) return;
            await updateDoc(doc(db, "users", userDoc.id), { role: newRole });
            alert("Role updated successfully!");
            onClose();
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Assign Roles</h2>
                {!userDoc ? (
                    <form onSubmit={handleSearch}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Search User (Email or Username)</label>
                            <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} required className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="flex justify-end">
                            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 border rounded">Cancel</button>
                            <button type="submit" disabled={loading} className="bg-amber-900 text-white px-4 py-2 rounded">Search</button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleAssign}>
                        <p className="mb-2"><strong>User:</strong> {userDoc.username} ({userDoc.email})</p>
                        <p className="mb-4"><strong>Current Role:</strong> {userDoc.role}</p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">New Role</label>
                            <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full border rounded px-3 py-2">
                                <option value="admin">Admin</option>
                                <option value="dispatcher">Dispatcher</option>
                                <option value="driver">Driver</option>
                            </select>
                        </div>
                        <div className="flex justify-end">
                            <button type="button" onClick={() => setUserDoc(null)} className="mr-2 px-4 py-2 border rounded">Back</button>
                            <button type="submit" className="bg-amber-900 text-white px-4 py-2 rounded">Update Role</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

function DeactivateUserPopup({ onClose }) {
    const [identifier, setIdentifier] = useState("");
    const [userDoc, setUserDoc] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const usersRef = collection(db, "users");
            let q = query(usersRef, where("email", "==", identifier));
            let snapshot = await getDocs(q);
            if (snapshot.empty) {
                q = query(usersRef, where("username", "==", identifier));
                snapshot = await getDocs(q);
            }
            if (!snapshot.empty) {
                setUserDoc({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
            } else {
                alert("User not found");
                setUserDoc(null);
            }
        } catch (error) {
            alert(error.message);
        }
        setLoading(false);
    };

    const handleDeactivate = async (e) => {
        e.preventDefault();
        try {
            if (!userDoc) return;
            await updateDoc(doc(db, "users", userDoc.id), { status: 'deactivated' });
            alert("User deactivated successfully!");
            onClose();
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Deactivate User</h2>
                {!userDoc ? (
                    <form onSubmit={handleSearch}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Search User (Email or Username)</label>
                            <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} required className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="flex justify-end">
                            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 border rounded">Cancel</button>
                            <button type="submit" disabled={loading} className="bg-amber-900 text-white px-4 py-2 rounded">Search</button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleDeactivate}>
                        <p className="mb-2"><strong>User:</strong> {userDoc.username} ({userDoc.email})</p>
                        <p className="mb-4"><strong>Current Status:</strong> {userDoc.status || 'active'}</p>
                        <p className="mb-4 text-red-600">Are you sure you want to deactivate this user? They will no longer be able to access the system.</p>
                        <div className="flex justify-end">
                            <button type="button" onClick={() => setUserDoc(null)} className="mr-2 px-4 py-2 border rounded">Back</button>
                            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Deactivate</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

function VehicleManagementCard() {
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [showUnassigned, setShowUnassigned] = useState(true);
    const [activeAction, setActiveAction] = useState(null);

    useEffect(() => {
        const unsubVehicles = onSnapshot(collection(db, 'vehicles'), (snapshot) => {
            setVehicles(snapshot.docs.map(d => ({id: d.id, ...d.data()})));
        });
        const q = query(collection(db, 'users'), where("role", "==", "driver"));
        const unsubDrivers = onSnapshot(q, (snapshot) => {
            setDrivers(snapshot.docs.map(d => ({id: d.id, ...d.data()})));
        });
        return () => { unsubVehicles(); unsubDrivers(); };
    }, []);

    const displayedVehicles = vehicles.filter(v => showUnassigned ? !v.assignedDriverId : v.assignedDriverId);

    return (
        <CustomCard title={"Assign Drivers"} width={"600px"} height={"24rem"}>
            <div className="flex justify-between items-center mb-2 pr-4 pl-2">
                <div className="space-x-2">
                    <button onClick={() => setActiveAction('ADD')} className="bg-amber-900 text-white px-2 py-1 rounded shadow-sm text-sm transition-colors">Add</button>
                    <button onClick={() => setActiveAction('EDIT')} className="bg-amber-900 text-white px-2 py-1 rounded shadow-sm text-sm transition-colors">Edit</button>
                    <button onClick={() => setActiveAction('DELETE')} className="bg-amber-900 text-white px-2 py-1 rounded shadow-sm text-sm transition-colors">Delete</button>
                </div>
                <button onClick={() => setShowUnassigned(!showUnassigned)} className="border border-amber-900 text-amber-900 px-3 py-1 rounded shadow-sm text-sm font-semibold hover:bg-amber-50 transition-colors">
                    {showUnassigned ? "Show Assigned" : "Show Unassigned"}
                </button>
            </div>
            
            <div className="overflow-y-auto flex-1 px-2 border-t pt-2">
                {displayedVehicles.map(v => (
                    <div key={v.id} className="border-b py-2 flex justify-between items-center pr-2">
                        <div>
                            <p className="font-bold text-gray-800">{v.licensePlate} <span className="text-gray-500 font-normal">({v.model})</span></p>
                            <p className="text-sm text-gray-600">
                                {showUnassigned ? "Unassigned" : `Assigned to: ${drivers.find(d => d.id === v.assignedDriverId)?.username || 'Unknown Driver'}`}
                            </p>
                        </div>
                        {showUnassigned ? (
                            <select 
                                onChange={(e) => {
                                    if(e.target.value) {
                                        updateDoc(doc(db, 'vehicles', v.id), { assignedDriverId: e.target.value });
                                    }
                                }} 
                                className="border rounded px-2 py-1 text-sm bg-gray-50 cursor-pointer"
                                value={v.assignedDriverId || ""}
                            >
                                <option value="">Select Driver...</option>
                                {drivers.filter(d => !vehicles.some(vec => vec.assignedDriverId === d.id)).map(d => <option key={d.id} value={d.id}>{d.username}</option>)}
                            </select>
                        ) : (
                            <button 
                                onClick={() => updateDoc(doc(db, 'vehicles', v.id), { assignedDriverId: null })} 
                                className="text-red-600 border border-red-600 hover:bg-red-50 px-3 py-1 rounded text-sm transition-colors"
                            >
                                Unassign
                            </button>
                        )}
                    </div>
                ))}
                {displayedVehicles.length === 0 && <p className="text-sm text-gray-500 mt-4 text-center">No vehicles found in this category.</p>}
            </div>

            {activeAction === 'ADD' && <AddVehiclePopup onClose={() => setActiveAction(null)} />}
            {activeAction === 'EDIT' && <EditVehiclePopup vehicles={vehicles} onClose={() => setActiveAction(null)} />}
            {activeAction === 'DELETE' && <DeleteVehiclePopup vehicles={vehicles} onClose={() => setActiveAction(null)} />}
        </CustomCard>
    );
}

function AddVehiclePopup({ onClose }) {
    const [licensePlate, setLicensePlate] = useState("");
    const [model, setModel] = useState("");
    const [storageCapacity, setStorageCapacity] = useState("");
    const [volumeCapacity, setVolumeCapacity] = useState("");
    const [hasFridge, setHasFridge] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, "vehicles"), { licensePlate, model, storageCapacity, volumeCapacity, hasFridge, assignedDriverId: null });
            alert("Vehicle added!");
            onClose();
        } catch(err) { alert(err.message); }
        setLoading(false);
    }
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Add Vehicle</h2>
                <form onSubmit={handleAdd}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">License Plate</label>
                        <input type="text" value={licensePlate} onChange={e => setLicensePlate(e.target.value)} required className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Model</label>
                        <input type="text" value={model} onChange={e => setModel(e.target.value)} required className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="mb-4 flex space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">Storage (kg)</label>
                            <input type="number" value={storageCapacity} onChange={e => setStorageCapacity(e.target.value)} required className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">Volume (m³)</label>
                            <input type="number" value={volumeCapacity} onChange={e => setVolumeCapacity(e.target.value)} required className="w-full border rounded px-3 py-2" />
                        </div>
                    </div>
                    <div className="mb-4 flex items-center">
                        <input type="checkbox" checked={hasFridge} onChange={e => setHasFridge(e.target.checked)} id="hasFridgeAdd" className="mr-2" />
                        <label htmlFor="hasFridgeAdd" className="text-sm font-medium">Equipped with Fridge Unit</label>
                    </div>
                    <div className="flex justify-end mt-6">
                        <button type="button" onClick={onClose} className="mr-2 px-4 py-2 border rounded">Cancel</button>
                        <button type="submit" disabled={loading} className="bg-amber-900 text-white px-4 py-2 rounded">Add</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function EditVehiclePopup({ vehicles, onClose }) {
    const [selectedId, setSelectedId] = useState("");
    const [licensePlate, setLicensePlate] = useState("");
    const [model, setModel] = useState("");
    const [storageCapacity, setStorageCapacity] = useState("");
    const [volumeCapacity, setVolumeCapacity] = useState("");
    const [hasFridge, setHasFridge] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSelect = (e) => {
        const id = e.target.value;
        setSelectedId(id);
        const v = vehicles.find(vec => vec.id === id);
        if(v) {
            setLicensePlate(v.licensePlate);
            setModel(v.model);
            setStorageCapacity(v.storageCapacity || "");
            setVolumeCapacity(v.volumeCapacity || "");
            setHasFridge(v.hasFridge || false);
        } else {
            setLicensePlate("");
            setModel("");
            setStorageCapacity("");
            setVolumeCapacity("");
            setHasFridge(false);
        }
    }

    const handleEdit = async (e) => {
        e.preventDefault();
        if(!selectedId) return;
        setLoading(true);
        try {
            await updateDoc(doc(db, "vehicles", selectedId), { licensePlate, model, storageCapacity, volumeCapacity, hasFridge });
            alert("Vehicle updated!");
            onClose();
        } catch(err) { alert(err.message); }
        setLoading(false);
    }
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Edit Vehicle</h2>
                <form onSubmit={handleEdit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Select Vehicle</label>
                        <select value={selectedId} onChange={handleSelect} required className="w-full border rounded px-3 py-2">
                            <option value="">-- Choose a vehicle --</option>
                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.licensePlate} ({v.model})</option>)}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">License Plate</label>
                        <input type="text" value={licensePlate} onChange={e => setLicensePlate(e.target.value)} required className="w-full border rounded px-3 py-2" disabled={!selectedId} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Model</label>
                        <input type="text" value={model} onChange={e => setModel(e.target.value)} required className="w-full border rounded px-3 py-2" disabled={!selectedId} />
                    </div>
                    <div className="mb-4 flex space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">Storage (kg)</label>
                            <input type="number" value={storageCapacity} onChange={e => setStorageCapacity(e.target.value)} required className="w-full border rounded px-3 py-2" disabled={!selectedId} />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">Volume (m³)</label>
                            <input type="number" value={volumeCapacity} onChange={e => setVolumeCapacity(e.target.value)} required className="w-full border rounded px-3 py-2" disabled={!selectedId} />
                        </div>
                    </div>
                    <div className="mb-4 flex items-center">
                        <input type="checkbox" checked={hasFridge} onChange={e => setHasFridge(e.target.checked)} id="hasFridgeEdit" className="mr-2" disabled={!selectedId} />
                        <label htmlFor="hasFridgeEdit" className="text-sm font-medium">Equipped with Fridge Unit</label>
                    </div>
                    <div className="flex justify-end mt-6">
                        <button type="button" onClick={onClose} className="mr-2 px-4 py-2 border rounded">Cancel</button>
                        <button type="submit" disabled={!selectedId || loading} className="bg-amber-900 text-white px-4 py-2 rounded">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DeleteVehiclePopup({ vehicles, onClose }) {
    const [selectedId, setSelectedId] = useState("");
    const [loading, setLoading] = useState(false);

    const handleDelete = async (e) => {
        e.preventDefault();
        if(!selectedId) return;
        if(!window.confirm("Are you sure you want to delete this vehicle?")) return;
        
        setLoading(true);
        try {
            await deleteDoc(doc(db, "vehicles", selectedId));
            alert("Vehicle deleted!");
            onClose();
        } catch(err) { alert(err.message); }
        setLoading(false);
    }
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Delete Vehicle</h2>
                <form onSubmit={handleDelete}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Select Vehicle to Delete</label>
                        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} required className="w-full border rounded px-3 py-2">
                            <option value="">-- Choose a vehicle --</option>
                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.licensePlate} ({v.model})</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end mt-6">
                        <button type="button" onClick={onClose} className="mr-2 px-4 py-2 border rounded">Cancel</button>
                        <button type="submit" disabled={!selectedId || loading} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
                    </div>
                </form>
            </div>
        </div>
    );
}