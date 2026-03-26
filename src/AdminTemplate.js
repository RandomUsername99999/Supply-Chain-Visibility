import { SlSettings } from 'react-icons/sl';
import { BiBell, BiUser, BiMenu, BiSearch, BiChevronDown, BiHistory } from 'react-icons/bi';
import { GiBoxUnpacking, GiTruck, GiPathDistance } from 'react-icons/gi';
import { MdDashboard, MdMap, MdLocationOn } from 'react-icons/md';
import logo from './assets/images/logo.svg';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useState } from 'react';

const navItems = [
  { label: "Dashboard", icon: <MdDashboard />, link: "/admin/dashboard" },
  { label: "Live Tracker", icon: <MdLocationOn />, link: "/admin/livetracker" },
  { label: "User Management", icon: <BiUser />, link: "/admin/users" },
  { label: "Vehicle Mgmt", icon: <GiTruck />, link: "/admin/vehicles" },
  { label: "Assignments", icon: <GiPathDistance />, link: "/admin/assignments" },
  { label: "Reports", icon: <MdMap />, link: "/admin/reports" },
  { label: "Audit Logs", icon: <BiHistory />, link: "/admin/audit-logs" },
  { label: "My Profile", icon: <SlSettings />, link: "/admin/profile" },
];

function AdminTemplate({ userRole, userName }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  const getWelcomeMessage = () => {
    switch (userRole) {
      case 'admin': return "Welcome back, Admin 🚀 System running smoothly.";
      case 'manager': return "Good to see you, Manager 📊 Here’s today’s overview.";
      case 'dispatcher': return "Let’s optimize deliveries 🚚 Ready to assign routes.";
      case 'driver': return "Your route is ready 🗺️ Check your deliveries.";
      default: return `Welcome, ${userName || 'User'}! 📦 Let's get shipping.`;
    }
  };

  return (
    <div className="flex h-screen bg-[#FDFBF7] font-sans overflow-hidden">

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#3E2723] text-white transition-all duration-300 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.15)] z-20`}>
        <div className="h-20 flex items-center justify-center border-b border-[#4E342E] p-4 shrink-0 shadow-sm">
          {sidebarOpen ? (
            <div className="flex items-center space-x-2">
              <div className="bg-white p-1.5 rounded-lg shadow-inner">
                <img className="w-8 h-8 object-contain" src={logo} alt='Logo' />
              </div>
              <span className="text-sm font-extrabold tracking-wide uppercase text-[#EFEBE9]">Portal</span>
            </div>
          ) : (
            <div className="bg-white p-1.5 rounded-lg shadow-inner">
              <img className="w-8 h-8 object-cover" src={logo} alt='Logo' />
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto py-5 custom-scrollbar">
          <VerticalNavbar sidebarOpen={sidebarOpen} userRole={userRole} />
        </div>

        {/* Footer Profile Mini */}
        {sidebarOpen && (
          <div className="p-4 border-t border-[#4E342E] m-3 bg-[#4E342E]/30 rounded-xl">
            <p className="text-[10px] text-[#A1887F] font-semibold uppercase mb-1">Server Status</p>
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
              <span className="text-xs text-[#EFEBE9]">All Systems Operational</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFBF7]">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-[#F0EBE1] flex items-center justify-between px-6 lg:px-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative z-40 shrink-0">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[#8C7A70] hover:text-[#5D4037] mr-5 p-2 rounded-full hover:bg-[#F5F0EB] transition-colors focus:outline-none">
              <BiMenu className="text-2xl" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-[15px] font-bold text-[#3E2723] tracking-tight">{getWelcomeMessage()}</h1>
              <p className="text-[12px] text-[#A1887F]">Thursday, Oct 12th, 2026</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative hidden lg:flex items-center text-[#8C7A70]">
              <BiSearch className="absolute left-4 text-lg text-[#BCAAA4]" />
              <input type="text" placeholder="Search orders, fleets..." className="bg-[#FCF9F6] border border-[#EAE3D9] rounded-[10px] pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-[#8D6E63]/20 focus:border-[#8D6E63] transition-all w-72 placeholder-[#BCAAA4] text-[#3E2723]" />
            </div>

            <button className="relative text-[#8C7A70] hover:text-[#5D4037] p-2 rounded-full hover:bg-[#F5F0EB] transition-colors">
              <BiBell className="text-[1.3rem]" />
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-[#EF5350] rounded-full ring-2 ring-white"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center space-x-3 focus:outline-none p-1.5 rounded-full hover:bg-[#F5F0EB] transition-colors border border-transparent hover:border-[#EAE3D9]">
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-[#3E2723] leading-none">{userName || 'Administrator'}</p>
                  <p className="text-[10px] text-[#8C7A70] uppercase font-semibold mt-1">{userRole || 'Admin'}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#F5F0EB] border border-[#D7CCC8] flex items-center justify-center overflow-hidden shadow-inner">
                  <span className="text-[#5D4037] font-extrabold text-sm tracking-tighter">
                    {(userName || userRole || 'A').substring(0, 2).toUpperCase()}
                  </span>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-[#F0EBE1] py-2 z-50 overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#F0EBE1] mb-1 bg-[#FCF9F6]">
                    <p className="text-sm font-bold text-[#3E2723]">{userName || 'Administrator'}</p>
                    <p className="text-[#8C7A70] text-xs">Logged in via Enterprise</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full text-left px-5 py-2.5 text-[13px] font-medium text-[#5D4037] hover:bg-[#F5F0EB] hover:text-[#3E2723] transition-colors flex items-center"><BiUser className="mr-2 text-lg" /> My Profile</button>
                    <button className="w-full text-left px-5 py-2.5 text-[13px] font-medium text-[#5D4037] hover:bg-[#F5F0EB] hover:text-[#3E2723] transition-colors flex items-center"><SlSettings className="mr-2 text-lg" /> Account Settings</button>
                  </div>
                  <div className="border-t border-[#F0EBE1] py-1 mt-1">
                    <button onClick={handleLogout} className="w-full text-left px-5 py-2.5 text-[13px] text-[#D32F2F] hover:bg-[#FFF8F8] font-bold transition-colors flex items-center"><span className="text-lg mr-2">🚪</span> Sign Out</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Outlet */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#FDFBF7] p-6 lg:p-8 custom-scrollbar relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(141,110,99,0.03),transparent_50%)] pointer-events-none sticky"></div>
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function VerticalNavbar({ sidebarOpen, userRole }) {
  const navigate = useNavigate();
  const location = useLocation();

  const filteredNavItems = navItems.filter(item => {
    if (item.label === "User Management" || item.label === "Vehicle Mgmt" || item.label === "Audit Logs") {
      return userRole === 'admin';
    }
    return true;
  });

  return (
    <div className="flex flex-col space-y-1.5 px-3">
      {filteredNavItems.map((item) => {
        // Active when exact map or dashboard
        const isActive = location.pathname.startsWith(item.link);
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.link)}
            className={`w-full flex items-center rounded-[10px] transition-all duration-200 group relative ${isActive
              ? 'bg-[#4E342E] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
              : 'hover:bg-[#4E342E]/40'
              }`}
          >
            {/* Accent Bar */}
            {isActive && <div className="absolute left-0 top-[20%] bottom-[20%] w-1 bg-[#D7CCC8] rounded-r-md shadow-[0_0_8px_rgba(215,204,200,0.5)]"></div>}

            <div className={`flex items-center w-full py-3.5 px-3.5`}>
              <div className={`text-[1.3rem] transition-colors ${isActive ? 'text-[#EFEBE9]' : 'text-[#A1887F] group-hover:text-[#D7CCC8]'}`}>{item.icon}</div>
              {sidebarOpen && <p className={`ml-4 text-[13px] font-semibold tracking-wide whitespace-nowrap transition-colors ${isActive ? 'text-white' : 'text-[#A1887F] group-hover:text-[#EFEBE9]'}`}>{item.label}</p>}
            </div>
          </button>
        )
      })}
    </div>
  );
}

export default AdminTemplate;