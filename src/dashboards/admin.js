import CustomCard from "../UIComponents/Card";
import { MdLocalShipping, MdWarning, MdMap, MdOutlinePayments } from "react-icons/md";
import { GiBoxUnpacking, GiPathDistance } from "react-icons/gi";

export default function Dashboard() {
    return (<div className="space-y-8 animate-fade-in pb-10">
        
        {/* Header Title Area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-[#F0EBE1]">
            <div>
                <p className="text-2xl font-extrabold text-[#3E2723] tracking-tight">Operations Headquarters</p>
                <p className="text-sm text-[#8C7A70] mt-1">Real-time insights and live tracking.</p>
            </div>
        </div>

        {/* Improved KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <CustomCard title="Active Deliveries" value="1,248" info="12% vs last week" icon={<MdLocalShipping/>} trendPositive={true} />
            <CustomCard title="Fleet Efficiency" value="94.2%" info="2.1% improvement" icon={<GiPathDistance/>} trendPositive={true} />
            <CustomCard title="delayed shipments" value="14" info="Requires attention" icon={<MdWarning/>} trendPositive={false} />
            <CustomCard title="Total Revenue (Est)" value="$84.2k" info="4% vs yesterday" icon={<MdOutlinePayments/>} trendPositive={true} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Delivery Assignment Kanban Placeholders */}
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-[#F0EBE1] flex flex-col min-h-[400px]">
                <div className="p-5 border-b border-[#F0EBE1] flex justify-between items-center">
                    <h3 className="text-[16px] font-bold text-[#3E2723] flex items-center"><GiBoxUnpacking className="mr-2 text-[#8D6E63] text-xl"/> Active Routing Board</h3>
                    <button className="text-xs font-bold text-[#5D4037] hover:text-[#8D6E63]">View All Board →</button>
                </div>
                
                <div className="p-5 flex-1 overflow-x-auto">
                    <div className="flex gap-4 min-w-max h-full">
                        
                        {/* Column 1 */}
                        <div className="w-64 flex flex-col bg-[#FDFBF7] rounded-xl border border-[#F0EBE1] p-3">
                            <div className="flex justify-between items-center mb-3 px-1">
                                <span className="text-xs font-bold text-[#A1887F] uppercase tracking-wide">Pending (12)</span>
                                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-[#EAE3D9] mb-2 hover:shadow-md cursor-grab transition-shadow border-l-4 border-l-amber-400">
                                <p className="text-[10px] text-[#A1887F] font-bold mb-1">ORD-9482</p>
                                <p className="text-[13px] font-bold text-[#3E2723]">12 Pallets Electronics</p>
                                <p className="text-[11px] text-[#8C7A70] mt-2 flex items-center"><MdMap className="mr-1"/> To: Berlin HQ</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-[#EAE3D9] mb-2 hover:shadow-md cursor-grab transition-shadow border-l-4 border-l-amber-400">
                                <p className="text-[10px] text-[#A1887F] font-bold mb-1">ORD-9485</p>
                                <p className="text-[13px] font-bold text-[#3E2723]">Medical Supplies</p>
                                <p className="text-[11px] text-[#8C7A70] mt-2 flex items-center"><MdMap className="mr-1"/> To: Paris Clinic</p>
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="w-64 flex flex-col bg-[#FDFBF7] rounded-xl border border-[#F0EBE1] p-3">
                            <div className="flex justify-between items-center mb-3 px-1">
                                <span className="text-xs font-bold text-[#5D4037] uppercase tracking-wide">Assigned (5)</span>
                                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-[#EAE3D9] mb-2 hover:shadow-md cursor-grab transition-shadow border-l-4 border-l-blue-400">
                                <p className="text-[10px] text-[#A1887F] font-bold mb-1">ORD-9477</p>
                                <p className="text-[13px] font-bold text-[#3E2723]">Lumber & Steel</p>
                                <div className="mt-2 pt-2 border-t border-[#F0EBE1] flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-[#5D4037] bg-[#F5F0EB] px-2 py-0.5 rounded">T-800 Heavy</span>
                                    <div className="w-5 h-5 rounded-full bg-[#D7CCC8] flex items-center justify-center text-[8px] font-bold text-white">JD</div>
                                </div>
                            </div>
                        </div>

                        {/* Column 3 */}
                        <div className="w-64 flex flex-col bg-[#FDFBF7] rounded-xl border border-[#F0EBE1] p-3">
                            <div className="flex justify-between items-center mb-3 px-1">
                                <span className="text-xs font-bold text-[#3E2723] uppercase tracking-wide">In Transit (8)</span>
                                <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-[#EAE3D9] mb-2 hover:shadow-md cursor-grab transition-shadow border-l-4 border-l-indigo-400">
                                <p className="text-[10px] text-[#A1887F] font-bold mb-1">ORD-9450</p>
                                <p className="text-[13px] font-bold text-[#3E2723]">Consumer Goods</p>
                                <div className="mt-2 bg-gray-100 rounded-full h-1 overflow-hidden">
                                     <div className="bg-indigo-500 h-1 w-[60%]"></div>
                                </div>
                                <p className="text-[9px] text-[#8C7A70] mt-1 text-right">ETA: 2h 15m</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Map Nav UI Placeholder */}
            <div className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-[#F0EBE1] p-5 h-[400px] relative overflow-hidden flex flex-col group">
                <div className="absolute inset-0 bg-[#F5F0EB] opacity-40 z-0"></div>
                <div className="absolute inset-0 flex items-center justify-center z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#8D6E63 1.5px, transparent 1px)', backgroundSize: '30px 30px' }}>
                   <MdMap className="text-[12rem] text-[#5D4037] transform rotate-12 group-hover:scale-110 transition-transform duration-[3s] ease-linear"/>
                </div>
                
                <h3 className="text-[16px] font-bold text-[#3E2723] mb-2 z-10 flex items-center"><MdMap className="mr-2 text-[#8D6E63] text-xl"/> Live Map Tracker</h3>
                <p className="text-xs text-[#8C7A70] z-10 mb-4">Tracking 44 active routes</p>

                {/* Fake route cards floating on map */}
                <div className="relative z-10 flex-1">
                    <div className="absolute top-[20%] left-[10%] w-3 h-3 bg-indigo-500 rounded-full ring-4 ring-indigo-500/30 animate-pulse"></div>
                    <div className="absolute top-[50%] right-[30%] w-3 h-3 bg-green-500 rounded-full ring-4 ring-green-500/30 animate-pulse" style={{animationDelay: "1s"}}></div>
                    <div className="absolute bottom-[20%] left-[40%] w-3 h-3 bg-red-400 rounded-full ring-4 ring-red-400/30 animate-pulse" style={{animationDelay: "2s"}}></div>
                </div>

                <div className="relative z-10 mt-auto flex flex-wrap gap-2">
                    <button className="bg-white/90 backdrop-blur px-3 py-1.5 shadow-sm rounded-lg text-xs font-bold text-[#5D4037] border border-[#EAE3D9] hover:bg-[#F5F0EB]">📍 Routes</button>
                    <button className="bg-white/90 backdrop-blur px-3 py-1.5 shadow-sm rounded-lg text-xs font-bold text-[#D32F2F] border border-[#EAE3D9] hover:bg-[#FFF8F8]">⚠️ Delays</button>
                </div>
            </div>
        </div>
    </div>)
}