import { useState, useEffect } from "react";
import { db, authSecondary } from "../Config/firebase";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { BiUser, BiPlus, BiPencil, BiTrash } from "react-icons/bi";

// --- Shared Validation Helpers ---
function validateNationalId(id) {
    // Old format: 9 digits + 'V' or 'v'
    // New format: exactly 12 digits
    const oldFormat = /^\d{9}[Vv]$/;
    const newFormat = /^\d{12}$/;
    return oldFormat.test(id) || newFormat.test(id);
}

function validatePhone(phone) {
    // At least 10 digits (strip non-digit chars first for flexibility)
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10;
}

function validateAge(dob) {
    // User must be at least 18 years old
    if (!dob) return false;
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    const actualAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;
    return actualAge >= 18;
}

function validateLicenseId(licenseId) {
    // Must be at least 5 characters and not trivially short (e.g. "123")
    return licenseId && licenseId.trim().length >= 5;
}

function validateLicenseExpiry(expiryDate) {
    // Must be strictly in the future
    if (!expiryDate) return false;
    return new Date(expiryDate) > new Date();
}

// Reusable inline error message component
function FieldError({ msg }) {
    if (!msg) return null;
    return <p className="text-red-500 text-[11px] mt-1 font-semibold">{msg}</p>;
}

function CreateUserPopup({ onClose }) {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
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
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        
        if (role !== 'customer') {
            if (!validateNationalId(nationalId)) {
                newErrors.nationalId = "National ID must be 9 digits + V (old) or 12 digits (new). e.g. 123456789V or 123456789012";
            }
            if (!validatePhone(contact)) {
                newErrors.contact = "Contact number must have at least 10 digits.";
            }
            if (!validateAge(dob)) {
                newErrors.dob = "User must be at least 18 years old.";
            }
        } else {
            if (!validatePhone(contact)) {
                newErrors.contact = "Phone number must have at least 10 digits.";
            }
        }

        if (role === 'driver') {
            if (!validateLicenseId(licenseId)) {
                newErrors.licenseId = "License ID must be at least 5 characters (e.g. B1234567).";
            }
            if (!validateLicenseExpiry(licenseExpiry)) {
                newErrors.licenseExpiry = "License expiry date must be in the future. An expired license cannot be accepted.";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setErrors(prev => ({ ...prev, password: "Passwords do not match." }));
            return;
        }
        if (password.length < 6) {
            setErrors(prev => ({ ...prev, password: "Password must be at least 6 characters." }));
            return;
        }
        if (!validate()) return;
        setLoading(true);
        try {
            // 1. Create Firebase Auth account using secondary instance
            //    (so the admin's own session is NOT affected)
            const userCredential = await createUserWithEmailAndPassword(authSecondary, email, password);
            const newUid = userCredential.user.uid;
            // Sign out the secondary instance immediately after creation
            await signOut(authSecondary);

            // 2. Save profile to Firestore — NO password stored
            const payload = { email, username, role, uid: newUid };
            
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
            payload.status = 'active';
            payload.created_at = new Date().toISOString();
            
            await addDoc(collection(db, "users"), payload);
            alert("Authority Created Successfully!");
            onClose();
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                alert("Error: This email is already registered in the system.");
            } else if (error.code === 'auth/weak-password') {
                alert("Error: Password is too weak. Use at least 6 characters.");
            } else if (error.code === 'auth/invalid-email') {
                alert("Error: The email address is invalid.");
            } else {
                alert("Error creating user: " + error.message);
            }
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
                        <select value={role} onChange={e => { setRole(e.target.value); setErrors({}); }} className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm focus:border-[#8D6E63] focus:ring-4 focus:ring-[#8D6E63]/20 outline-none transition-all font-semibold text-[#5D4037]">
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
                            <input type="password" value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: ''})); }} required minLength={6} placeholder="Min. 6 characters" className={`w-full bg-[#FCF9F6] border ${errors.password ? 'border-red-400' : 'border-[#EAE3D9]'} rounded-xl px-4 py-2.5 text-sm outline-none`} />
                            <FieldError msg={errors.password} />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Confirm Password</label>
                            <input type="password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({...p, password: ''})); }} required placeholder="Re-enter password" className={`w-full bg-[#FCF9F6] border ${errors.password ? 'border-red-400' : 'border-[#EAE3D9]'} rounded-xl px-4 py-2.5 text-sm outline-none`} />
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
                                    <input type="text" value={contact} onChange={e => { setContact(e.target.value); setErrors(p => ({...p, contact: ''})); }} required className={`w-full bg-[#FCF9F6] border ${errors.contact ? 'border-red-400' : 'border-[#EAE3D9]'} rounded-xl px-4 py-2.5 text-sm outline-none`} />
                                    <FieldError msg={errors.contact} />
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
                                    <input type="text" value={nationalId} onChange={e => { setNationalId(e.target.value); setErrors(p => ({...p, nationalId: ''})); }} required placeholder="e.g. 123456789V or 123456789012" className={`w-full bg-[#FCF9F6] border ${errors.nationalId ? 'border-red-400' : 'border-[#EAE3D9]'} rounded-xl px-4 py-2.5 text-sm outline-none`} />
                                    <FieldError msg={errors.nationalId} />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Contact Number</label>
                                    <input type="text" value={contact} onChange={e => { setContact(e.target.value); setErrors(p => ({...p, contact: ''})); }} required placeholder="e.g. 0712345678" className={`w-full bg-[#FCF9F6] border ${errors.contact ? 'border-red-400' : 'border-[#EAE3D9]'} rounded-xl px-4 py-2.5 text-sm outline-none`} />
                                    <FieldError msg={errors.contact} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Home Address</label>
                                    <input type="text" value={empAddress} onChange={e => setEmpAddress(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Date of Birth</label>
                                    <input type="date" value={dob} onChange={e => { setDob(e.target.value); setErrors(p => ({...p, dob: ''})); }} required className={`w-full bg-[#FCF9F6] border ${errors.dob ? 'border-red-400' : 'border-[#EAE3D9]'} rounded-xl px-4 py-2.5 text-sm outline-none`} />
                                    <FieldError msg={errors.dob} />
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
                                    <input type="text" value={licenseId} onChange={e => { setLicenseId(e.target.value); setErrors(p => ({...p, licenseId: ''})); }} required placeholder="e.g. B1234567" className={`w-full bg-[#FCF9F6] border ${errors.licenseId ? 'border-red-400' : 'border-[#EAE3D9]'} rounded-xl px-4 py-2.5 text-sm outline-none`} />
                                    <FieldError msg={errors.licenseId} />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">License Expiry</label>
                                    <input type="date" value={licenseExpiry} onChange={e => { setLicenseExpiry(e.target.value); setErrors(p => ({...p, licenseExpiry: ''})); }} required className={`w-full bg-[#FCF9F6] border ${errors.licenseExpiry ? 'border-red-400' : 'border-[#EAE3D9]'} rounded-xl px-4 py-2.5 text-sm outline-none`} />
                                    <FieldError msg={errors.licenseExpiry} />
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
                                    <input type="number" step="0.5" min="0" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} required className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" />
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
            const querySnapshot = await getDocs(collection(db, "users"));
            const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Case-insensitive search
            const lowerIdentifier = identifier.toLowerCase();
            const match = usersList.find(u =>
                (u.email || "").toLowerCase() === lowerIdentifier ||
                (u.username || "").toLowerCase() === lowerIdentifier
            );
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
            const userRef = doc(db, "users", userDoc.id);
            await updateDoc(userRef, { role: newRole, updated_at: new Date().toISOString() });
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
                            <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} required placeholder="Case-insensitive search" className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm focus:border-[#8D6E63] focus:ring-4 focus:ring-[#8D6E63]/20 outline-none transition-all" />
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
    const [editTab, setEditTab] = useState('account');
    const [editErrors, setEditErrors] = useState({});

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersList);
        } catch(e) { console.error(e); }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const validateEdit = () => {
        if (!selectedUser) return true;
        const newErrors = {};
        const isEmployee = selectedUser.role !== 'customer';

        if (isEmployee) {
            const empNid = selectedUser.employee?.national_id || "";
            if (!validateNationalId(empNid)) {
                newErrors.nationalId = "National ID must be 9 digits + V (old) or 12 digits (new).";
            }
            const empContact = selectedUser.employee?.contact_number || "";
            if (!validatePhone(empContact)) {
                newErrors.contact = "Contact number must have at least 10 digits.";
            }
            const empDob = selectedUser.employee?.date_of_birth || "";
            if (!validateAge(empDob)) {
                newErrors.dob = "User must be at least 18 years old.";
            }
        }

        if (selectedUser.role === 'driver') {
            const licNum = selectedUser.driver_profile?.license_number || "";
            if (!validateLicenseId(licNum)) {
                newErrors.licenseId = "License ID must be at least 5 characters.";
            }
            const licExp = selectedUser.driver_profile?.license_expiry_date || "";
            if (!validateLicenseExpiry(licExp)) {
                newErrors.licenseExpiry = "License expiry must be in the future.";
            }
        }

        setEditErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

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
                                        {u.employee?.contact_number && <p className="text-[11px] text-[#A1887F]">📞 {u.employee.contact_number}</p>}
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
                                                onClick={() => { setSelectedUser(JSON.parse(JSON.stringify(u))); setEditTab('account'); setEditErrors({}); setActiveAction('EDIT_ACCT'); }}
                                                className="text-[#8D6E63] hover:text-[#5D4037] bg-white border border-[#EAE3D9] hover:bg-[#F5F0EB] p-2 rounded-lg transition-colors shadow-sm"
                                            >
                                                <BiPencil />
                                            </button>
                                            <button 
                                                onClick={async () => {
                                                    if(window.confirm(`Are you sure you want to delete ${u.username}?`)) {
                                                        try {
                                                            await deleteDoc(doc(db, "users", u.id));
                                                            fetchUsers();
                                                        } catch(e) { alert("Failed to delete user"); }
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
                        <div className="bg-white p-7 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-lg border border-[#F0EBE1] animate-fade-in-up max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4 text-[#3E2723]">Edit Identity Data</h2>
                            
                            <div className="flex space-x-2 border-b border-[#F0EBE1] mb-5">
                                <button type="button" onClick={() => setEditTab('account')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${editTab === 'account' ? 'border-[#5D4037] text-[#5D4037]' : 'border-transparent text-[#8C7A70] hover:text-[#5D4037]'}`}>Account Details</button>
                                <button type="button" onClick={() => setEditTab('personnel')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${editTab === 'personnel' ? 'border-[#5D4037] text-[#5D4037]' : 'border-transparent text-[#8C7A70] hover:text-[#5D4037]'}`}>Personnel Records</button>
                                {selectedUser.role === 'driver' && (
                                    <button type="button" onClick={() => setEditTab('driver')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${editTab === 'driver' ? 'border-[#5D4037] text-[#5D4037]' : 'border-transparent text-[#8C7A70] hover:text-[#5D4037]'}`}>Driver Details</button>
                                )}
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (!validateEdit()) return;
                                try {
                                    const payload = {
                                        email: selectedUser.email,
                                        username: selectedUser.username,
                                        is_active: selectedUser.status === 'active'
                                    };
                                    if (selectedUser.employee) {
                                        payload.employee = selectedUser.employee;
                                    }
                                    if (selectedUser.driver_profile) {
                                        payload.driver_profile = selectedUser.driver_profile;
                                    }
                                    payload.updated_at = new Date().toISOString();
                                    const userRef = doc(db, "users", selectedUser.id);
                                    await updateDoc(userRef, payload);
                                    fetchUsers();
                                    setActiveAction(null);
                                } catch(err) {
                                    alert("Failed to update user: " + err.message);
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
                                ) : editTab === 'personnel' ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Full Name</label>
                                            <input type="text" value={selectedUser.employee?.full_name || ""} onChange={e => setSelectedUser({...selectedUser, employee: {...(selectedUser.employee||{}), full_name: e.target.value}})} className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" required />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">National ID</label>
                                            <input type="text" placeholder="e.g. 123456789V or 123456789012" value={selectedUser.employee?.national_id || ""} onChange={e => { setSelectedUser({...selectedUser, employee: {...(selectedUser.employee||{}), national_id: e.target.value}}); setEditErrors(p => ({...p, nationalId: ''})); }} className={`w-full bg-[#FCF9F6] border ${editErrors.nationalId ? 'border-red-400' : 'border-[#EAE3D9]'} rounded-xl px-4 py-2.5 text-sm outline-none`} required />
                                            <FieldError msg={editErrors.nationalId} />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Contact No.</label>
                                            <input type="text" placeholder="e.g. 0712345678" value={selectedUser.employee?.contact_number || ""} onChange={e => { setSelectedUser({...selectedUser, employee: {...(selectedUser.employee||{}), contact_number: e.target.value}}); setEditErrors(p => ({...p, contact: ''})); }} className={`w-full bg-[#FCF9F6] border ${editErrors.contact ? 'border-red-400' : 'border-[#EAE3D9]'} rounded-xl px-4 py-2.5 text-sm outline-none`} required />
                                            <FieldError msg={editErrors.contact} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Address</label>
                                            <input type="text" value={selectedUser.employee?.address || ""} onChange={e => setSelectedUser({...selectedUser, employee: {...(selectedUser.employee||{}), address: e.target.value}})} className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" required />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Date of Birth</label>
                                            <input type="date" value={selectedUser.employee?.date_of_birth || ""} onChange={e => { setSelectedUser({...selectedUser, employee: {...(selectedUser.employee||{}), date_of_birth: e.target.value}}); setEditErrors(p => ({...p, dob: ''})); }} className={`w-full bg-[#FCF9F6] border ${editErrors.dob ? 'border-red-400' : 'border-[#EAE3D9]'} rounded-xl px-4 py-2.5 text-sm outline-none`} required />
                                            <FieldError msg={editErrors.dob} />
                                        </div>
                                    </div>
                                ) : (
                                    // Driver details tab
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">License ID</label>
                                            <input type="text" placeholder="e.g. B1234567" value={selectedUser.driver_profile?.license_number || ""} onChange={e => { setSelectedUser({...selectedUser, driver_profile: {...(selectedUser.driver_profile||{}), license_number: e.target.value}}); setEditErrors(p => ({...p, licenseId: ''})); }} className={`w-full bg-[#FCF9F6] border ${editErrors.licenseId ? 'border-red-400' : 'border-[#EAE3D9]'} rounded-xl px-4 py-2.5 text-sm outline-none`} required />
                                            <FieldError msg={editErrors.licenseId} />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">License Expiry</label>
                                            <input type="date" value={selectedUser.driver_profile?.license_expiry_date || ""} onChange={e => { setSelectedUser({...selectedUser, driver_profile: {...(selectedUser.driver_profile||{}), license_expiry_date: e.target.value}}); setEditErrors(p => ({...p, licenseExpiry: ''})); }} className={`w-full bg-[#FCF9F6] border ${editErrors.licenseExpiry ? 'border-red-400' : 'border-[#EAE3D9]'} rounded-xl px-4 py-2.5 text-sm outline-none`} required />
                                            <FieldError msg={editErrors.licenseExpiry} />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">License Type</label>
                                            <select value={selectedUser.driver_profile?.license_type || "heavy_vehicle"} onChange={e => setSelectedUser({...selectedUser, driver_profile: {...(selectedUser.driver_profile||{}), license_type: e.target.value}})} className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none">
                                                <option value="heavy_vehicle">Heavy Vehicle</option>
                                                <option value="light_vehicle">Light Vehicle</option>
                                                <option value="trailer">Trailer</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-[13px] font-bold text-[#8C7A70] mb-1.5 uppercase tracking-wider">Experience (Years)</label>
                                            <input type="number" step="0.5" min="0" value={selectedUser.driver_profile?.experience_years || 0} onChange={e => setSelectedUser({...selectedUser, driver_profile: {...(selectedUser.driver_profile||{}), experience_years: parseFloat(e.target.value) || 0}})} className="w-full bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl px-4 py-2.5 text-sm outline-none" />
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
