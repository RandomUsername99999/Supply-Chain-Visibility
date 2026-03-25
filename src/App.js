import logo from './assets/images/logo.png';
import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import AdminTemplate from './AdminTemplate';
import DriverDashboard from './dashboards/driver';
import DispatcherDashboard from './dashboards/dispatcher';
import AdminDashboard from './dashboards/admin';


import { auth, db } from "./Config/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const roleRoutes = {
    dashboard: {
      warehouse: <DriverDashboard />,
      dispatcher: <DispatcherDashboard />,
      admin: <AdminDashboard />
    }
  };

  const getRoleFromLogin = (data) => {
    setRole(data);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          } else {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", currentUser.email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              setRole(querySnapshot.docs[0].data().role);
            } else {
              setRole("admin"); // extreme fallback if they aren't in DB but logged in
            }
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        setRole(null);
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <h1>Loading</h1>;

  return (
    <>
      <Routes>
        <Route path='/' element={
          <div className="flex flex-col h-screen justify-start items-center bg-gray-100">
            <div className="w-full text-start py-4 text-amber-900 flex flex-row items-end shadow-lg">
              <img className="w-30 h-10" src={logo} alt='Logo'></img>
              <p className="text-amber-950 pl-5 text-end">Enterprise Access Portal</p>
            </div>
            <LoginCard sendDataToParent={getRoleFromLogin} />
          </div>
        } />
        <Route element={<AdminTemplate userRole={role} />}>
          <Route path='/admin/dashboard' element={user ? (roleRoutes.dashboard[role] || (
            <div className="p-8 text-center mt-20">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Dashboard Unavailable</h2>
              <p>Your role ({role || 'None'}) is not authorized for a dashboard view.</p>
              <button onClick={() => {auth.signOut(); window.location.href='/';}} className="mt-4 bg-amber-900 text-white px-4 py-2 rounded">Log Out</button>
            </div>
          )) : <Navigate to='/' />} />
          <Route path='/admin/userManagement' element={<p>User Management</p>} />
          <Route path='/admin/userRole' element={<p>User Role</p>} />
          <Route path='/admin/auditLog' element={<p>Audit Logs</p>} />
          <Route path='/admin/notifications' element={<p>Notifications!</p>} />
          <Route path='/admin/settings' element={<p>Settings</p>} />
        </Route>

      </Routes>
    </>
  );
}

function LoginCard({ sendDataToParent }) {
  const [identifier, setIdentifier] = useState(""); //Can be a username or email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isEmail = (input) => /\S+@\S+\.\S+/.test(input);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let emailToUse = identifier;
      let role = null;

      // If it's not an email, treat it as a username and look up the email
      if (!isEmail(identifier)) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", identifier));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          throw new Error("Username not found");
        }

        emailToUse = querySnapshot.docs[0].data().email;
        role = querySnapshot.docs[0].data().role;
        sendDataToParent(role);
      }
      // Sign in with email and password
      await signInWithEmailAndPassword(auth, emailToUse, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="flex flex-col flex-1 items-center justify-center">
        <div className="bg-white p-3 rounded-lg shadow-lg text-center w-96 h-80 flex flex-col items-start hover:shadow-amber-950;shadow-2xl transition-all duration-500 ease-out hover:shadow-amber-950">
          <p className="mx-auto text-2xl text-amber-900">Secure Login</p>
          <p className="mx-auto text-1xl text-amber-800">Role: System Administrator</p>
          <p className="mx-0 text-1xl">Username/Email</p>
          <Input value={identifier} onValueChange={setIdentifier} inputType="text" placeholder="Username/Email" />
          <p className="mx-0 text-1xl">Password</p>
          <Input value={password} onValueChange={setPassword} inputType="password" placeholder="Password" />
          <a className='ml-auto pb-5 text-amber-800'>Forgot Password?</a>
          <button
            className="mx-auto bg-amber-900 w-full text-white h-8 rounded-sm"
            onClick={handleLogin}
          >Secure Login</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <p class="mx-auto text-0xl text-amber-900">Authorized Use Only</p>
          <p class="mx-auto text-1xl text-amber-800">Access is monitored and recorded</p>
        </div>
      </div>
    </>
  )
}

function Input({ value, onValueChange, inputType, placeholder }) {
  return (
    <>
      <input
        value={value}
        onChange={e => onValueChange(e.target.value)}
        type={inputType}
        placeholder={placeholder}
        className="w-full border"
      />
    </>
  )
}

export default App;
