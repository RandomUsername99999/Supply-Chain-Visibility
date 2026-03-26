import { useState, useEffect } from "react";
import { BiServer, BiShieldQuarter, BiHistory, BiSearch } from "react-icons/bi";

export default function LogAudit() {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        // Mock data for audit logs
        const mockLogs = [
            { id: 1, timestamp: "2026-10-12 10:45:22", user: "admin@company.com", action: "USER_LOGIN", details: "Successful login via Enterprise Gateway", ip: "192.168.1.104", status: "success" },
            { id: 2, timestamp: "2026-10-12 11:02:15", user: "manager@company.com", action: "DATA_EXPORT", details: "Exported weekly fleet report", ip: "10.0.0.52", status: "success" },
            { id: 3, timestamp: "2026-10-12 11:30:05", user: "dispatcher@company.com", action: "ROUTE_ASSIGNED", details: "Assigned Vehicle #V-402 to Route A1", ip: "192.168.1.200", status: "success" },
            { id: 4, timestamp: "2026-10-12 12:15:40", user: "unknown", action: "UNAUTHORIZED_ACCESS", details: "Failed login attempt (3x)", ip: "203.0.113.42", status: "failed" },
            { id: 5, timestamp: "2026-10-12 14:22:10", user: "admin@company.com", action: "ROLE_UPDATE", details: "Changed john.doe to Driver", ip: "192.168.1.104", status: "success" },
        ];
        setLogs(mockLogs);
    }, []);

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-[#F0EBE1]">
                <div>
                    <p className="text-2xl font-extrabold text-[#3E2723] tracking-tight">System Audit Logs</p>
                    <p className="text-sm text-[#8C7A70] mt-1">Review system activities, security events, and data access.</p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    <div className="relative">
                        <BiSearch className="absolute left-3 top-2.5 text-[#BCAAA4] text-lg"/>
                        <input type="text" placeholder="Search logs..." className="bg-[#FCF9F6] border border-[#EAE3D9] rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[#8D6E63]/20 focus:border-[#8D6E63] transition-all w-64 text-[#3E2723] placeholder-[#BCAAA4]" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#F0EBE1] flex flex-col mt-6 overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-[#F0EBE1] flex justify-between items-center bg-[#FCF9F6]/50">
                    <h3 className="text-lg font-bold text-[#3E2723] flex items-center"><BiHistory className="mr-2 text-[#8D6E63] text-2xl"/> Event stream</h3>
                    <div className="flex items-center space-x-2 text-[12px] font-bold text-[#8C7A70]">
                        <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span> Success</span>
                        <span className="flex items-center ml-3"><span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span> Failed</span>
                    </div>
                </div>
                
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-[#F0EBE1] text-[#8C7A70] text-[11px] uppercase tracking-wider">
                                <th className="py-4 px-6 font-bold">Timestamp</th>
                                <th className="py-4 px-6 font-bold">User</th>
                                <th className="py-4 px-6 font-bold">Event Action</th>
                                <th className="py-4 px-6 font-bold">Details</th>
                                <th className="py-4 px-6 font-bold">IP Source</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F5F0EB]">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-[#FCF9F6] transition-colors group">
                                    <td className="py-4 px-6">
                                        <p className="text-[12px] font-bold text-[#5D4037]">{log.timestamp}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="text-[13px] font-bold text-[#3E2723]">{log.user}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="bg-[#F5F0EB] text-[#5D4037] text-[10px] font-bold px-2 py-1 rounded-md border border-[#D7CCC8] uppercase tracking-wider">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center">
                                            {log.status === 'success' ? <BiServer className="text-green-500 mr-2 text-lg shrink-0" /> : <BiShieldQuarter className="text-red-500 mr-2 text-lg shrink-0" />}
                                            <p className="text-[12px] text-[#5D4037] font-semibold">{log.details}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-[12px] text-[#8C7A70] font-mono">
                                        {log.ip}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
