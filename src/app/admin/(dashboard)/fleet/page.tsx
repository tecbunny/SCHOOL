"use client";

import { useState, useEffect } from 'react';
import { 
  Monitor, 
  Activity, 
  Server, 
  RefreshCw, 
  Wifi, 
  Cpu, 
  HardDrive, 
  Thermometer,
  Search,
  ArrowUpRight
} from 'lucide-react';
import { analyticsService } from '@/services/analytics.service';

export default function FleetManagementPage() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFleet = async () => {
      try {
        const data = await analyticsService.getHardwareFleetStatus();
        setNodes(data);
      } catch (err) {
        console.error("Fleet fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFleet();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-success';
      case 'warning': return 'text-warning';
      default: return 'text-danger';
    }
  };

  const handlePushGlobalUpdate = async () => {
    try {
      const response = await fetch("/api/admin/fleet/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ releaseType: "pwa" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "OTA deployment failed.");
      alert(`Queued ${data.queued} node(s) for ${data.release.release_type} ${data.release.version_code}.`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "OTA deployment failed.");
    }
  };

  const activeNodes = nodes.filter((node) => node.status === "online").length;
  const avg = (field: string) => {
    const values = nodes.map((node) => Number(node[field])).filter((value) => Number.isFinite(value));
    if (values.length === 0) return 0;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header */}
      <header className="header-glass py-6 px-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Monitor className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Fleet Management</h1>
            <p className="text-sm text-muted">Global MDM & Node Health Monitoring for EduOS Kiosks.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="text" 
                placeholder="Search nodes..."
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-primary transition-all w-64"
              />
           </div>
           <button 
             onClick={handlePushGlobalUpdate}
             className="btn btn-primary gap-2"
           >
              <RefreshCw className="w-4 h-4" /> Push OTA Update
           </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="p-8 grid grid-cols-4 gap-6">
         {[
           { label: 'Active Nodes', val: `${activeNodes}/${nodes.length}`, icon: Activity, color: 'text-primary' },
           { label: 'Memory Used', val: `${avg('memory_usage')}%`, icon: Wifi, color: 'text-success' },
           { label: 'Avg CPU Temp', val: `${avg('temp')}°C`, icon: Cpu, color: 'text-warning' },
           { label: 'Storage Used', val: `${avg('disk_usage')}%`, icon: HardDrive, color: 'text-secondary' },
         ].map((stat, i) => (
           <div key={i} className="bg-card border border-white/5 p-6 rounded-3xl shadow-xl">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-4`} />
              <div className="text-2xl font-black text-white">{stat.val}</div>
              <div className="text-[10px] text-muted font-bold uppercase tracking-widest">{stat.label}</div>
           </div>
         ))}
      </div>

      {/* Main Table Area */}
      <div className="flex-1 px-8 pb-8 overflow-hidden">
         <div className="h-full bg-card border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
               <h3 className="font-bold text-lg text-white">Kiosk Inventory</h3>
               <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">Filter: School</button>
                  <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">Export JSON</button>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
               <table className="w-full text-left">
                  <thead className="bg-black/40 text-[10px] text-muted font-bold uppercase tracking-widest sticky top-0">
                     <tr>
                        <th className="px-6 py-4">Node ID / Location</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">CPU Temp</th>
                        <th className="px-6 py-4 text-center">App Version</th>
                        <th className="px-6 py-4 text-center">Last Heartbeat</th>
                        <th className="px-6 py-4"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {loading ? (
                        <tr>
                           <td colSpan={6} className="px-6 py-12 text-center text-xs font-bold uppercase tracking-widest text-muted">
                              Loading fleet inventory...
                           </td>
                        </tr>
                     ) : nodes.length === 0 ? (
                        <tr>
                           <td colSpan={6} className="px-6 py-12 text-center text-xs font-bold uppercase tracking-widest text-muted">
                              No registered EduOS nodes found.
                           </td>
                        </tr>
                     ) : nodes.map((node) => (
                        <tr key={node.id} className="hover:bg-white/[0.02] transition-colors group">
                           <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                 <div className="bg-primary/10 p-2 rounded-lg">
                                    <Server className="w-4 h-4 text-primary" />
                                 </div>
                                 <div>
                                    <div className="font-bold text-white text-sm">{node.node_name}</div>
                                    <div className="text-[10px] text-muted">{node.school_name}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-5 text-center">
                              <div className={`flex items-center justify-center gap-2 text-xs font-bold ${getStatusColor(node.status)}`}>
                                 <div className={`w-1.5 h-1.5 rounded-full animate-pulse bg-current`}></div>
                                 {node.status.toUpperCase()}
                              </div>
                           </td>
                           <td className="px-6 py-5 text-center">
                              <div className="flex items-center justify-center gap-1.5 text-sm text-white">
                                 <Thermometer className="w-3.5 h-3.5 text-muted" />
                                 {node.temp ?? 0}°C
                              </div>
                           </td>
                           <td className="px-6 py-5 text-center">
                              <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-muted">v{node.version}</span>
                           </td>
                           <td className="px-6 py-5 text-center text-xs text-muted">
                              {new Date(node.last_heartbeat).toLocaleTimeString()}
                           </td>
                           <td className="px-6 py-5 text-right">
                              <button className="p-2 hover:bg-white/10 rounded-lg text-muted opacity-0 group-hover:opacity-100 transition-all">
                                 <ArrowUpRight className="w-4 h-4" />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
}
