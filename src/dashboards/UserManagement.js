import { useState, useEffect } from "react";
import api from "../api";
import { BiUser, BiPlus, BiPencil, BiTrash } from "react-icons/bi";

function CreateUserPopup({ onClose }) {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("driver");
    
    // Universal Employee fields
    const [fullName, setFullName] = useState("");
    const [nationalId, setNationalId] = useState("");
    const [contact, setContact] = useState("");
    const [empAddress, setEmpAddress] = useState("");
    const [dob, setDob] = useState("");

    // Driver conditional fields
    const [licenseId, setLicenseId] = useState("");
    const [licenseExpiry, setLicenseExpiry] = useState("");
    const [licenseType, setLicenseType] = useState("heavy_vehicle");
    const [experienceYears, setExperienceYears] = useState("0");
    
    // Customer conditional fields
    const [businessName, setBusinessName] = useState("");
    const [contactPerson, setContactPerson] = useState("");
    const [taxId, setTaxId] = useState("");
    
    const [loading, setLoading] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { email, username, password, role };
            
            if (role === 'customer') {
                payload.customer = {
                    business_name: businessName,
                    contact_person_name: contactPerson,
                    phone_number: contact,
                    address: empAddress,
                    tax_id: taxId
                };
            } else {
                payload.employee = {
                    full_name: fullName,
                    national_id: nationalId,
                    contact_number: contact,
                    address: empAddress,
                    date_of_birth: dob
                };
                if (role === 'driver') {
                    payload.driver_profile = {
                        license_number: licenseId,
                        license_expiry_date: licenseExpiry,
                        license_type: licenseType,
                        experience_years: parseFloat(experienceYears) || 0
                    };
                }
            }
            await api.post('users/', payload);
            alert("Authority Created Successfully!");
            onClose();
        } catch (error) {
            alert("Error creating user: " + (error?.response?.data?.detail || JSON.stringify(error?.response?.data) || error.message));
        }
        setLoading(false);
    };

    return (<>
        <div className="fixed inset-0 bg-[#3E2723]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-7 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-xl border border-[#F0EBE1] animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-5 text-[#3E2723]">Register New Asset</h2>
                <form onSubmit={handleCreate}>
                    <div className="mb-5">
                        <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Role Assignment</label>
                        <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm focus:border-[#8D6E63] focus:ring-4 focus:ring-[#8D6E63]/20 outline-none transition-all font-semibold text-[#5D4037]">
                            <option value="admin">Administrator</option>
                            <option value="manager">Manager</option>
                            <option value="dispatcher">Dispatcher</option>
                            <option value="driver">Driver</option>
                            <option value="customer">Customer</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Username</label>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" />
                        </div>
                    </div>

                    {role === 'customer' ? (
                        <>
                            <h3 className="text-sm font-bold text-[#5D4037] border-b border-[#F0EBE1] pb-2 mb-4 mt-6">Customer Profile</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Business Name</label>
                                    <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Contact Person</label>
                                    <input type="text" value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Phone Number</label>
                                    <input type="text" value={contact} onChange={e => setContact(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Tax ID (Optional)</label>
                                    <input type="text" value={taxId} onChange={e => setTaxId(e.target.value)} className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Billing Address</label>
                                    <input type="text" value={empAddress} onChange={e => setEmpAddress(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-sm font-bold text-[#5D4037] border-b border-[#F0EBE1] pb-2 mb-4 mt-6">Employee Records</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="col-span-2">
                                    <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Full Name</label>
                                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">National ID</label>
                                    <input type="text" value={nationalId} onChange={e => setNationalId(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Contact Number</label>
                                    <input type="text" value={contact} onChange={e => setContact(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Home Address</label>
                                    <input type="text" value={empAddress} onChange={e => setEmpAddress(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Date of Birth</label>
                                    <input type="date" value={dob} onChange={e => setDob(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" />
                                </div>
                            </div>
                        </>
                    )}

                    {role === 'driver' && (
                        <>
                            <h3 className="text-sm font-bold text-[#5D4037] border-b border-[#F0EBE1] pb-2 mb-4 mt-6">Driver Authorizations</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">License ID</label>
                                    <input type="text" value={licenseId} onChange={e => setLicenseId(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">License Expiry</label>
                                    <input type="date" value={licenseExpiry} onChange={e => setLicenseExpiry(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">License Type</label>
                                    <select value={licenseType} onChange={e => setLicenseType(e.target.value)} className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none">
                                        <option value="heavy_vehicle">Heavy Vehicle</option>
                                        <option value="light_vehicle">Light Vehicle</option>
                                        <option value="trailer">Trailer</option>
                                    </select>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Experience (Years)</label>
                                    <input type="number" step="0.5" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" />
                                </div>
                            </div>
                        </>
                    )}
                    <div className="flex justify-end pt-2">
                        <button type="button" onClick={onClose} className="mr-3 px-5 py-2.5 text-sm font-bold text-[#8C7A70] hover:bg-[#F5F0EB] rounded-xl transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="bg-[#5D4037] hover:bg-[#4E342E] text-white px-6 py-2.5 rounded-xl shadow-md text-sm font-bold transition-all focus:ring-4 focus:ring-[#8D6E63]/30 disabled:opacity-70">
                            {loading ? "Processing..." : "Create Authority"}
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
            const res = await api.get('users/');
            const users = res.data;
            const match = users.find(u => u.email === identifier || u.username === identifier);
            if (match) {
                setUserDoc(match);
                setNewRole(match.role);
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
            await api.patch(`users/${userDoc.id}/`, { role: newRole });
            alert("Role updated successfully!");
            onClose();
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#3E2723]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-7 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-md border border-[#F0EBE1] animate-fade-in-up">
                <h2 className="text-xl font-bold mb-5 text-[#3E2723]">Manage Role Authorities</h2>
                {!userDoc ? (
                    <form onSubmit={handleSearch}>
                        <div className="mb-6">
                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Search Identity (Email/Username)</label>
                            <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm focus:border-[#8D6E63] focus:ring-4 focus:ring-[#8D6E63]/20 outline-none transition-all" />
                        </div>
                        <div className="flex justify-end">
                            <button type="button" onClick={onClose} className="mr-3 px-5 py-2.5 text-sm font-bold text-[#8C7A70] hover:bg-[#F5F0EB] rounded-xl transition-colors">Cancel</button>
                            <button type="submit" disabled={loading} className="bg-[#5D4037] hover:bg-[#4E342E] text-white px-6 py-2.5 rounded-xl shadow-md text-sm font-bold transition-all focus:ring-4 focus:ring-[#8D6E63]/30">Fetch User</button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleAssign}>
                        <div className="bg-[#F5F0EB] p-4 rounded-xl mb-5 space-y-1 border border-[#EAE3D9]">
                           <p className="text-[13px]"><strong className="text-[#3E2723]">User:</strong> <span className="text-[#5D4037]">{userDoc.username}</span></p>
                           <p className="text-[13px]"><strong className="text-[#3E2723]">Email:</strong> <span className="text-[#5D4037]">{userDoc.email}</span></p>
                           <p className="text-[13px]"><strong className="text-[#3E2723]">Current Role:</strong> <span className="uppercase text-[#8D6E63] font-bold text-[11px] ml-1">{userDoc.role}</span></p>
                        </div>
                        <div className="mb-6">
                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Elevate to Role</label>
                            <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm focus:border-[#8D6E63] focus:ring-4 focus:ring-[#8D6E63]/20 outline-none transition-all font-bold text-[#5D4037]">
                                <option value="admin">Administrator</option>
                                <option value="manager">Manager</option>
                                <option value="dispatcher">Dispatcher</option>
                                <option value="driver">Driver</option>
                                <option value="customer">Customer</option>
                            </select>
                        </div>
                        <div className="flex justify-end">
                            <button type="button" onClick={() => setUserDoc(null)} className="mr-3 px-5 py-2.5 text-sm font-bold text-[#8C7A70] hover:bg-[#F5F0EB] rounded-xl transition-colors">Back</button>
                            <button type="submit" className="bg-[#5D4037] hover:bg-[#4E342E] text-white px-6 py-2.5 rounded-xl shadow-md text-sm font-bold transition-all focus:ring-4 focus:ring-[#8D6E63]/30">Apply Policy</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [activeAction, setActiveAction] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editTab, setEditTab] = useState('account'); // 'account' | 'personnel'

    const fetchUsers = async () => {
        try {
            const res = await api.get('users/');
            setUsers(res.data);
        } catch(e) { console.error(e); }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header Title Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-[#F0EBE1]">
                <div>
                    <p className="text-2xl font-extrabold text-[#3E2723] tracking-tight">User Management</p>
                    <p className="text-sm text-[#8C7A70] mt-1">Control access scopes, authorities, and personnel records.</p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                    <button
                        className="bg-[#5D4037] hover:bg-[#4E342E] hover:-translate-y-0.5 text-white px-4 py-2.5 rounded-[10px] shadow-[0_4px_12px_rgba(93,64,55,0.2)] text-[13px] font-bold transition-all focus:ring-4 focus:ring-[#8D6E63]/30 flex items-center"
                        onClick={() => setActiveAction('CREATE_USER')}
                    >
                        <BiPlus className="mr-1.5 text-lg" /> Invite User
                    </button>
                    <button
                        className="bg-white hover:bg-[#F5F0EB] text-[#5D4037] border border-[#D7CCC8] px-4 py-2.5 rounded-[10px] shadow-sm text-[13px] font-bold transition-colors flex items-center"
                        onClick={() => setActiveAction('ASSIGN_ROLES')}
                    >
                        <BiUser className="mr-1.5 text-lg" /> Manage Roles
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#F0EBE1] flex flex-col mt-6 overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-[#F0EBE1] flex flex-col sm:flex-row sm:items-center justify-between bg-[#FCF9F6]/50">
                    <h3 className="text-lg font-bold text-[#3E2723] flex items-center mb-4 sm:mb-0"><BiUser className="mr-2 text-[#8D6E63] text-2xl"/> Personnel Directory</h3>
                </div>
                
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-[#F0EBE1] text-[#8C7A70] text-[11px] uppercase tracking-wider">
                                <th className="py-4 px-6 font-bold">User Identity</th>
                                <th className="py-4 px-6 font-bold">Contact</th>
                                <th className="py-4 px-6 font-bold">Role</th>
                                <th className="py-4 px-6 font-bold">Status</th>
                                <th className="py-4 px-6 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F5F0EB]">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-[#FCF9F6] transition-colors group">
                                    <td className="py-4 px-6">
                                        <div>
                                            <p className="text-[13px] font-bold text-[#3E2723]">{u.username}</p>
                                            <p className="text-[11px] text-[#A1887F] font-semibold">ID: #{u.id}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="text-[13px] font-bold text-[#5D4037]">{u.email}</p>
                                        {u.driver_profile?.phone && <p className="text-[11px] text-[#A1887F]">📞 {u.driver_profile.phone}</p>}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="bg-[#F5F0EB] text-[#5D4037] text-[10px] font-bold px-2 py-1 rounded-md border border-[#D7CCC8] uppercase tracking-wider">
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={u.status === 'active' ? "bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md border border-green-100 uppercase tracking-wider flex w-max items-center" : "bg-red-50 text-red-700 text-[10px] font-bold px-2 py-1 rounded-md border border-red-100 uppercase tracking-wider flex w-max items-center"}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-green-500' : 'bg-red-500'} mr-1.5`}></span> {u.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button 
                                                onClick={() => { setSelectedUser(JSON.parse(JSON.stringify(u))); setEditTab('account'); setActiveAction('EDIT_ACCT'); }}
                                                className="text-[#8D6E63] hover:text-[#5D4037] bg-white border border-[#EAE3D9] hover:bg-[#F5F0EB] p-2 rounded-lg transition-colors shadow-sm"
                                            >
                                                <BiPencil />
                                            </button>
                                            <button 
                                                onClick={async () => {
                                                    if(window.confirm(`Are you sure you want to delete ${u.username}?`)) {
                                                        await api.delete(`users/${u.id}/`);
                                                        fetchUsers();
                                                    }
                                                }}
                                                className="text-[#D32F2F] bg-white border border-[#FFCDD2] hover:bg-[#FFF8F8] p-2 rounded-lg transition-colors shadow-sm"
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

                {activeAction === 'EDIT_ACCT' && selectedUser && (
                    <div className="fixed inset-0 bg-[#3E2723]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-7 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-lg border border-[#F0EBE1] animate-fade-in-up">
                            <h2 className="text-xl font-bold mb-4 text-[#3E2723]">Edit Identity Data</h2>
                            
                            <div className="flex space-x-2 border-b border-[#F0EBE1] mb-5">
                                <button type="button" onClick={() => setEditTab('account')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${editTab === 'account' ? 'border-[#5D4037] text-[#5D4037]' : 'border-transparent text-[#8C7A70] hover:text-[#5D4037]'}`}>Account Details</button>
                                <button type="button" onClick={() => setEditTab('personnel')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${editTab === 'personnel' ? 'border-[#5D4037] text-[#5D4037]' : 'border-transparent text-[#8C7A70] hover:text-[#5D4037]'}`}>Personnel Records</button>
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const payload = {
                                        email: selectedUser.email,
                                        username: selectedUser.username,
                                        is_active: selectedUser.status === 'active'
                                    };
                                    if (selectedUser.employee) {
                                        payload.employee = selectedUser.employee;
                                    }
                                    await api.patch(`users/${selectedUser.id}/`, payload);
                                    fetchUsers();
                                    setActiveAction(null);
                                } catch(err) {
                                    alert("Failed to update user.");
                                }
                            }}>
                                {editTab === 'account' ? (
                                    <>
                                        <div className="mb-4">
                                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Username</label>
                                            <input type="text" value={selectedUser.username || ""} onChange={e => setSelectedUser({...selectedUser, username: e.target.value})} className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" required />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Email</label>
                                            <input type="email" value={selectedUser.email || ""} onChange={e => setSelectedUser({...selectedUser, email: e.target.value})} className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" required />
                                        </div>
                                        <div className="mb-4 flex items-center">
                                            <input type="checkbox" id="isActive" checked={selectedUser.status === 'active'} onChange={e => setSelectedUser({...selectedUser, status: e.target.checked ? 'active' : 'inactive'})} className="mr-2" />
                                            <label htmlFor="isActive" className="text-[13px] font-bold text-[#3E2723]">Active System Access</label>
                                        </div>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Full Name</label>
                                            <input type="text" value={selectedUser.employee?.full_name || ""} onChange={e => setSelectedUser({...selectedUser, employee: {...(selectedUser.employee||{}), full_name: e.target.value}})} className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" required />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">National ID</label>
                                            <input type="text" value={selectedUser.employee?.national_id || ""} onChange={e => setSelectedUser({...selectedUser, employee: {...(selectedUser.employee||{}), national_id: e.target.value}})} className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" required />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Contact No.</label>
                                            <input type="text" value={selectedUser.employee?.contact_number || ""} onChange={e => setSelectedUser({...selectedUser, employee: {...(selectedUser.employee||{}), contact_number: e.target.value}})} className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" required />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Address</label>
                                            <input type="text" value={selectedUser.employee?.address || ""} onChange={e => setSelectedUser({...selectedUser, employee: {...(selectedUser.employee||{}), address: e.target.value}})} className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" required />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Date of Birth</label>
                                            <input type="date" value={selectedUser.employee?.date_of_birth || ""} onChange={e => setSelectedUser({...selectedUser, employee: {...(selectedUser.employee||{}), date_of_birth: e.target.value}})} className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" required />
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-end pt-5 mt-2">
                                    <button type="button" onClick={() => setActiveAction(null)} className="mr-3 px-5 py-2.5 text-sm font-bold text-[#8C7A70] hover:bg-[#F5F0EB] rounded-xl transition-colors">Cancel</button>
                                    <button type="submit" className="bg-[#5D4037] hover:bg-[#4E342E] text-white px-6 py-2.5 rounded-xl shadow-md text-sm font-bold">Save Record</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            
            {activeAction === 'CREATE_USER' && <CreateUserPopup onClose={() => { setActiveAction(null); fetchUsers(); }} />}
            {activeAction === 'ASSIGN_ROLES' && <AssignRolesPopup onClose={() => { setActiveAction(null); fetchUsers(); }} />}
        </div>
    );
}
