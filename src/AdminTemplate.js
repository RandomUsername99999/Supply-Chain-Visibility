import { SlSettings } from 'react-icons/sl';
import './App.css';
import { FaHome, FaUser, FaCog, FaEnvelope } from "react-icons/fa";
import { Profiler } from 'react';
import { BiUser } from 'react-icons/bi';
import { GrDashboard, GrDocumentNotes } from 'react-icons/gr';
import { BsBellFill, BsDash } from 'react-icons/bs';
import { PiRocketFill } from 'react-icons/pi';
import { GiRobotLeg } from 'react-icons/gi';
import { CgNotifications } from 'react-icons/cg';
import { MdAudiotrack, MdDashboard } from 'react-icons/md';
import { FcDocument } from 'react-icons/fc';
import { info } from 'autoprefixer';
import logo from './assets/images/logo.png';

function AdminTemplate() {
  return (
    <>
    <div className="flex flex-col h-auto justify-start items-center bg-orange-100">
        <div className="fixed w-full text-start py-4 text-white bg-amber-950 flex flex-row items-end z-10 shadow-md shadow-black">
        <img className="w-30 h-10" src={logo} alt='Logo'></img>
        <p className="text-white pl-5 text-end">Enterprise Access Portal</p>
        </div>
    
    <div className="flex w-full flex-col">
      <VerticalNavbar />
      <Dashboard />
    </div>
    </div>
    </>
  );
}

const navItems = [
  { label: "Dashboard", info: "View the dashboard of everything!", icon: <MdDashboard />, link: "#" },
  { label: "User Management", info: "Assign vehicles and shipments", icon: <BiUser />, link: "#" },
  { label: "Role And Permissions", info: "Give users role! Becareful about giving admin!", icon: <GiRobotLeg />, link: "#" },
  { label: "Audit Logs", info: "A centralized dashboard for deliveries!", icon: <GrDocumentNotes />, link: "#" },
  { label: "Notifications & Thresholds", info: "ooo annoying notifications!", icon: <BsBellFill />, link: "#" },
  { label: "System Settings", info: "Probably your own settings!", icon: <SlSettings />, link: "#" },
];

function VerticalNavbar() {
  return (
    <div className="fixed left-0 top-10 h-full w-60 bg-amber-950 flex flex-col items-start shadow-lg">
      {navItems.map((item, index) => (
        <a
          key={index}
          href={item.link}
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
        </a>
      ))}
    </div>
  );
}

function Dashboard(){
    return (
    <>
    <div className='ml-64 mt-24 h-auto w-auto min-w-max bg-orange-100'>
        <p className='ml-5 font-extrabold text-xl'>Warehouse Operations Centralized Dashboard</p>
        <div className='flex flex-row'>
            <SmallCard title={"Total Pallets Staged"} value={775} info={"+12.5% this week"} />
            <SmallCard title = "Inventory Accuracy" value = "99.8%" info = "On Target" />
            <SmallCard title={"Average Drivers"} value={"18 min"} info={"On Target"} />
            <SmallCard title = "Averaged Drivers" value = "18 min" info = "18 min vs avg" />
        </div>
        <div className='flex flex-row'>
            <div className='flex flex-col'>
                <CustomCard title={"Loading Bay Monitor"} />
                <CustomCard title={"Picker Performance"} />
            </div>
            <div className='flex flex-col'>
                <CustomCard2 title={"Inventory Alerts"} />
                <CustomCard2 title={"Cold Chain Warnings"} />
                <CustomCard2 title={"Route Progress"} />
            </div>
        </div>
    </div>
    </>
    )
}

function SmallCard({title, value, info}){
    return (<>
        <div className='bg-white border-amber-950 border-2 w-60 h-20 rounded-lg justify-start pl-2 m-4'>
            <p className=''>{title}</p>
            <p className='text-amber-900 font-bold text-xl'>{value}</p>
            <p className='text-gray-600 text-xs'>{info}</p>
        </div>
    </>)
}

function CustomCard({title}){
    return (<>
        <div className='bg-white border-amber-950 border-2 w-[600px] h-96 rounded-lg justify-start pl-2 m-4'>
            <p className=''>{title}</p>
        </div>
    </>)
}

function CustomCard2({title}){
    return (<>
        <div className='bg-white border-amber-950 border-2 w-[425px] h-52 rounded-lg justify-start pl-2 m-4'>
            <p className=''>{title}</p>
        </div>
    </>)
}

export default AdminTemplate;
