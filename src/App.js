import logo from './assets/images/logo.svg';
import { useEffect, useState, useRef } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import AdminTemplate from './AdminTemplate';
import DriverDashboard from './dashboards/driver';
import DispatcherDashboard from './dashboards/dispatcher';
import AdminDashboard from './dashboards/admin';
import UserManagement from './dashboards/UserManagement';
import VehicleManagement from './dashboards/VehicleManagement';
import VehicleAssignments from './dashboards/VehicleAssignments';
import LiveTracker from './dashboards/LiveTracker';
import LogAudit from './dashboards/LogAudit';
import { BiLockAlt, BiShieldQuarter, BiHide, BiShow, BiLoaderAlt, BiCheckShield, BiCube, BiEnvelope } from 'react-icons/bi';


import { auth, db } from "./Config/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const roleRoutes = {
    dashboard: {
      driver: <DriverDashboard />,
      dispatcher: <DispatcherDashboard />,
      admin: <AdminDashboard />,
      manager: <AdminDashboard />,
      customer: <div className="p-8"><h1 className="text-2xl font-bold text-slate-800">Customer Dashboard</h1><p>Welcome to your logistics portal tracking.</p></div>
    }
  };

  const getRoleFromLogin = (data) => {
    setRole(data);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", currentUser.email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setRole(querySnapshot.docs[0].data().role);
          } else {
            setRole('customer');
          }
        } catch (error) {
          console.error("Error fetching role:", error);
          setRole('customer');
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#FDFBF7]">
      <BiLoaderAlt className="animate-spin text-[#5D4037] text-5xl" />
    </div>
  );

  return (
    <>
      <Routes>
        <Route path='/' element={
          <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden">
            {/* Subtle radial gradient layer for depth */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(141,110,99,0.05),transparent_50%)] pointer-events-none"></div>

            <div className="w-full max-w-[1000px] bg-white rounded-[14px] shadow-[0_12px_44px_rgba(0,0,0,0.06)] flex overflow-hidden min-h-[580px] relative z-10 border border-[#F0EBE1]">

              {/* Left Side: Branding & Illustration */}
              <div className="hidden md:flex md:w-5/12 bg-[#F5F0EB] relative flex-col items-center justify-center p-10 overflow-hidden text-center border-r border-[#EAE3D9]">
                <div className="absolute inset-0 opacity-[0.15] mix-blend-multiply pointer-events-none" style={{ backgroundImage: "radial-gradient(#8D6E63 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }}></div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EBE5DE] mb-6 flex items-center justify-center">
                    <img src={logo} alt="Nestle Logo" className="w-48 h-auto object-contain" />
                  </div>
                  <h1 className="text-2xl font-bold text-[#3E2723] mb-3 tracking-tight">Logistics Portal</h1>
                  <p className="text-[#795548] text-sm leading-relaxed max-w-[250px]">
                    Streamline your global supply chain with real-time enterprise visibility.
                  </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white rounded-full opacity-[0.3] mix-blend-overlay filter blur-[40px]"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#8D6E63] rounded-full opacity-[0.05] mix-blend-overlay filter blur-[40px]"></div>
              </div>

              {/* Right Side: Login Form */}
              <div className="w-full md:w-7/12 p-8 sm:p-14 flex flex-col justify-center bg-white relative">
                <LoginCard sendDataToParent={getRoleFromLogin} />
              </div>
            </div>
          </div>
        } />
        <Route element={<AdminTemplate userRole={role} />}>
          <Route path='/admin/dashboard' element={user ? roleRoutes.dashboard[role] : <Navigate to='/' />} />
          <Route path='/admin/livetracker' element={<LiveTracker />} />
          <Route path='/admin/users' element={role === 'admin' ? <UserManagement /> : <Navigate to='/admin/dashboard' />} />
          <Route path='/admin/vehicles' element={role === 'admin' ? <VehicleManagement /> : <Navigate to='/admin/dashboard' />} />
          <Route path='/admin/assignments' element={<VehicleAssignments />} />
          <Route path='/admin/audit-logs' element={role === 'admin' ? <LogAudit /> : <Navigate to='/admin/dashboard' />} />
          <Route path='/admin/reports' element={<p>Reports</p>} />
          <Route path='/admin/profile' element={<p>Profile</p>} />
          <Route path='/admin/settings' element={<p>Settings</p>} />
        </Route>

      </Routes>
    </>
  );
}

function SadDeniedScreen() {
  const [dots, setDots] = useState(0);
  const [tearDrop, setTearDrop] = useState(false);

  useEffect(() => {
    const dotsTimer = setInterval(() => setDots(d => (d + 1) % 4), 600);
    const tearTimer = setInterval(() => setTearDrop(t => !t), 1800);
    return () => { clearInterval(dotsTimer); clearInterval(tearTimer); };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 40%, #0f3460 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'sadFadeIn 0.8s ease forwards',
    }}>
      <style>{`
        @keyframes sadFadeIn { from { opacity: 0; filter: blur(12px); } to { opacity: 1; filter: blur(0); } }
        @keyframes sway { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
        @keyframes droop { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(8px); } }
        @keyframes tearFall { 0% { transform: translateY(0) scaleY(1); opacity: 1; } 100% { transform: translateY(60px) scaleY(1.4); opacity: 0; } }
        @keyframes pulseGlow { 0%,100% { text-shadow: 0 0 20px rgba(100,149,237,0.4); } 50% { text-shadow: 0 0 40px rgba(100,149,237,0.8), 0 0 80px rgba(100,149,237,0.3); } }
        @keyframes rainDrop { 0% { transform: translateY(-10px); opacity: 0; } 10% { opacity: 0.6; } 90% { opacity: 0.3; } 100% { transform: translateY(100vh); opacity: 0; } }
        @keyframes sob { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        .rain-drop { position: absolute; width: 1.5px; background: linear-gradient(to bottom, transparent, rgba(100,149,237,0.5)); border-radius: 2px; animation: rainDrop linear infinite; }
      `}</style>

      {/* Rain drops */}
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="rain-drop" style={{
          left: `${Math.random() * 100}%`,
          height: `${40 + Math.random() * 60}px`,
          animationDuration: `${0.8 + Math.random() * 1.2}s`,
          animationDelay: `${Math.random() * 2}s`,
        }} />
      ))}

      {/* Card */}
      <div style={{
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px',
        padding: '48px 56px', textAlign: 'center', maxWidth: '480px', width: '90%',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        animation: 'droop 3s ease-in-out infinite',
        position: 'relative', zIndex: 10,
      }}>

        {/* Crying face */}
        <div style={{ fontSize: '90px', lineHeight: 1, animation: 'sway 2.5s ease-in-out infinite', marginBottom: '12px', position: 'relative', display: 'inline-block' }}>
          😢
          {/* Tear drop */}
          {tearDrop && (
            <div style={{
              position: 'absolute', bottom: '-8px', left: '52%',
              width: '8px', height: '14px',
              background: 'rgba(100,149,237,0.9)', borderRadius: '0 0 50% 50%',
              animation: 'tearFall 1.6s ease-in forwards',
            }} />
          )}
        </div>

        <div style={{
          fontSize: '13px', fontWeight: 700, letterSpacing: '0.2em',
          color: 'rgba(100,149,237,0.7)', textTransform: 'uppercase', marginBottom: '16px',
        }}>Access Denied</div>

        <h2 style={{
          fontSize: '26px', fontWeight: 800, color: '#e8eaf6', marginBottom: '16px',
          animation: 'pulseGlow 2.5s ease-in-out infinite', lineHeight: 1.3,
        }}>
          Sorry, you can't access this{'.'.repeat(dots)}
        </h2>

        <p style={{
          color: 'rgba(200,200,230,0.65)', fontSize: '14px', lineHeight: 1.8,
          marginBottom: '28px', animation: 'sob 3s ease-in-out infinite',
        }}>
          This portal is reserved for <strong style={{ color: 'rgba(200,200,230,0.9)' }}>authorized administrators</strong> only.
          <br />Your account doesn't have the necessary permissions.
        </p>

        <div style={{
          background: 'rgba(100,149,237,0.08)', border: '1px solid rgba(100,149,237,0.2)',
          borderRadius: '12px', padding: '14px 20px',
          color: 'rgba(180,180,220,0.7)', fontSize: '13px', lineHeight: 1.6,
        }}>
          💙 Please contact your administrator if you believe<br />this is a mistake.
        </div>
      </div>

      <div style={{ marginTop: '28px', color: 'rgba(150,150,200,0.4)', fontSize: '12px', letterSpacing: '0.1em', zIndex: 10 }}>
        LOGISTICS PORTAL · RESTRICTED ACCESS
      </div>
    </div>
  );
}

function LoginCard({ sendDataToParent }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [denied, setDenied] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      // Determine if identifier is an email or a username
      const isEmail = identifier.includes("@");
      let loginEmail = identifier;
      let userRole = 'customer';

      if (!isEmail) {
        // Look up email by username (case-insensitive)
        const usersRef = collection(db, "users");
        const usersSnap = await getDocs(usersRef);
        const matchedUser = usersSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .find(u => (u.username || "").toLowerCase() === identifier.toLowerCase());

        if (!matchedUser) {
          setError("No account found with that username.");
          setIsLoading(false);
          return;
        }
        loginEmail = matchedUser.email;
        userRole = matchedUser.role || 'customer';
      }

      await signInWithEmailAndPassword(auth, loginEmail, password);

      // If logging in by email, still look up role
      if (isEmail) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", loginEmail));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          userRole = querySnapshot.docs[0].data().role;
        }
      }

      // Block drivers and retailers from accessing the portal
      if (userRole === 'driver' || userRole === 'retailer') {
        setDenied(true);
        setIsLoading(false);
        return;
      }

      sendDataToParent(userRole);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      if (
        err.code === 'auth/invalid-login-credentials' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        setError("Invalid credentials. Please check your password and try again.");
      } else {
        setError(err?.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (denied) return <SadDeniedScreen />;

  return (
    <div className="w-full max-w-[400px] mx-auto">

      {/* Mobile Logo (Visible only on small screens) */}
      <div className="md:hidden flex flex-col items-center mb-6">
        <div className="bg-[#F5F0EB] p-5 rounded-xl mb-3 border border-[#EAE3D9] flex items-center justify-center">
          <img src={logo} alt="Nestle Logo" className="w-32 h-auto object-contain" />
        </div>
        <h2 className="text-xl font-bold text-[#3E2723]">Logistics Portal</h2>
      </div>

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-1.5 mb-2">
          <BiCheckShield className="text-[#8D6E63] text-lg" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#A1887F]">Secure Access</span>
        </div>
        <h2 className="text-3xl font-extrabold text-[#333333] tracking-tight mb-2">Welcome back</h2>
        <p className="text-sm text-[#8C7A70]">Sign in to your corporate account to continue.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">

        {/* Username/Email Input */}
        <div>
          <label className="block text-sm font-semibold text-[#4A4A4A] mb-1.5 ml-0.5">Username or Email</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <BiEnvelope className={`text-[1.1rem] transition-colors duration-300 ${identifier ? 'text-[#5D4037]' : 'text-[#BCAAA4] group-focus-within:text-[#5D4037]'}`} />
            </div>
            <input
              type="text"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (error) setError("");
              }}
              className={`block w-full pl-10 pr-4 py-[0.8rem] bg-white border ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-[#EAE3D9] hover:border-[#D7CCC8] focus:border-[#8D6E63] focus:ring-[#8D6E63]/20'} rounded-[10px] text-sm text-[#333333] placeholder-[#BCAAA4] transition-all outline-none focus:ring-4`}
              placeholder="e.g. jdoe@company.com"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5 ml-0.5 pr-1">
            <label className="block text-sm font-semibold text-[#4A4A4A]">Password</label>
            <button type="button" className="text-xs font-semibold text-[#5D4037] hover:text-[#8D6E63] transition-colors focus:outline-none">Forgot Password?</button>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <BiLockAlt className={`text-[1.1rem] transition-colors duration-300 ${password ? 'text-[#5D4037]' : 'text-[#BCAAA4] group-focus-within:text-[#5D4037]'}`} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              className={`block w-full pl-10 pr-11 py-[0.8rem] bg-white border ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-[#EAE3D9] hover:border-[#D7CCC8] focus:border-[#8D6E63] focus:ring-[#8D6E63]/20'} rounded-[10px] text-sm text-[#333333] placeholder-[#BCAAA4] transition-all outline-none focus:ring-4`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A1887F] hover:text-[#5D4037] transition-colors focus:outline-none"
            >
              {showPassword ? <BiHide className="text-lg" /> : <BiShow className="text-lg" />}
            </button>
          </div>
        </div>

        {/* Remember Me & Error */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center group cursor-pointer">
            <div className="relative flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer w-4 h-4 text-[#5D4037] bg-white border-[#D7CCC8] rounded-[4px] focus:ring-[#8D6E63] focus:ring-2 cursor-pointer transition-all"
              />
            </div>
            <label htmlFor="remember-me" className="ml-2.5 text-sm text-[#795548] group-hover:text-[#4E342E] transition-colors cursor-pointer select-none">Remember me</label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#FFF8F8] text-[#D32F2F] text-[13px] font-medium p-3.5 rounded-[10px] border border-[#FFEBEE] flex items-center shadow-sm">
            <BiShieldQuarter className="mr-2 text-lg shrink-0 text-[#EF5350]" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-[0.85rem] px-4 border border-transparent rounded-[10px] shadow-[0_4px_14px_rgba(93,64,55,0.25)] text-[14px] font-bold text-white bg-[#5D4037] hover:bg-[#4E342E] hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(93,64,55,0.3)] focus:outline-none focus:ring-4 focus:ring-[#8D6E63]/30 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_14px_rgba(93,64,55,0.25)] disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? (
            <BiLoaderAlt className="animate-spin text-xl mr-2" />
          ) : null}
          {isLoading ? "Authenticating..." : "Secure Login"}
        </button>

      </form>

      {/* Footer INFO */}
      <div className="mt-8 pt-5 text-center">
        <p className="text-[12px] text-[#A1887F] leading-relaxed">
          All access is monitored securely.<br />
          Protected by Enterprise Gateway.
        </p>
      </div>
    </div>
  )
}

export default App;
