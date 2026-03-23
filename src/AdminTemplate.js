import { SlSettings } from 'react-icons/sl';
import './App.css';
import { BiUser } from 'react-icons/bi';
import { GrDocumentNotes } from 'react-icons/gr';
import { BsBellFill } from 'react-icons/bs';
import { GiRobotLeg } from 'react-icons/gi';
import {MdDashboard } from 'react-icons/md';
import logo from './assets/images/logo.png';
import { useNavigate, Outlet } from 'react-router-dom';

function AdminTemplate() {
  return (
    <>
    <div className="flex flex-col h-auto min-h-screen justify-start items-center bg-orange-100">
    <div className="fixed w-full text-start py-4 text-white bg-amber-950 flex flex-row items-end z-10 shadow-md shadow-black">
    <img className="w-30 h-10" src={logo} alt='Logo'></img>
    <p className="text-white pl-5 text-end">Enterprise Access Portal</p>
    </div>
    <div className="flex w-full flex-col">
    <VerticalNavbar />
    <div className='ml-64 mt-24 h-auto w-auto min-w-max bg-orange-100'>
        <Outlet />
    </div>
    </div> 
    </div>
    </>
  );
}



const navItems = [
  { label: "Dashboard", info: "View the dashboard of everything!", icon: <MdDashboard />, link: "/admin/dashboard" },
  { label: "User Management", info: "Assign vehicles and shipments", icon: <BiUser />, link: "/admin/userManagement" },
  { label: "Role And Permissions", info: "Give users role! Becareful about giving admin!", icon: <GiRobotLeg />, link: "/admin/userRole" },
  { label: "Audit Logs", info: "A centralized dashboard for deliveries!", icon: <GrDocumentNotes />, link: "/admin/auditLog" },
  { label: "Notifications & Thresholds", info: "ooo annoying notifications!", icon: <BsBellFill />, link: "/admin/notifications" },
  { label: "System Settings", info: "Probably your own settings!", icon: <SlSettings />, link: "/admin/settings" },
];

function VerticalNavbar() {
    const navigate = useNavigate();

    function handleClick(link){
        navigate(link)
    }
    return (
    <div className="fixed left-0 top-10 mt-8 h-full w-60 bg-amber-950 flex flex-col items-start shadow-lg">
      {navItems.map((item, index) => (
        <button
        onClick={() => handleClick(item.link)}
          className="group relative flex flex-col w-full h-12 items-center text-gray-400 hover:text-white transition-colors duration-300"
        >
        <div className='hover:bg-amber-800 w-full h-full flex flex-row items-center'>
          <div className="text-2xl pr-5">{item.icon}</div>
          <p>{item.label}</p>
        </div>
          {/* Hover label */}
          <span className="absolute left-20 top-10 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-sm px-3 py-1 rounded-md shadow-md transition-opacity duration-300 whitespace-nowrap">
            {item.info}
          </span>
        </button>
      ))}
    </div>
    );
}

export default AdminTemplate;
