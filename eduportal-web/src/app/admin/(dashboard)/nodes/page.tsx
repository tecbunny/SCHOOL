"use client";

import { Cpu, Wifi, Activity, Battery, MapPin, Search, Filter, RefreshCw, MoreVertical } from 'lucide-react';

const MOCK_NODES = [
  { id: 1, name: "Gate-01 (Main Entry)", model: "Luckfox Pico Ultra", ip: "192.168.1.101", status: "Online", cpu: "12%", ram: "450MB/1GB", temp: "42°C", uptime: "12d 4h" },
  { id: 2, name: "Hallway-A (Kiosk)", model: "Luckfox Pico Ultra", ip: "192.168.1.105", status: "Online", cpu: "8%", ram: "380MB/1GB", temp: "39°C", uptime: "4d 2h" },
  { id: 3, name: "Lab-3 (Auth Node)", model: "Luckfox Pico Ultra", ip: "192.168.1.110", status: "Offline", cpu: "0%", ram: "0MB/1GB", temp: "N/A", uptime: "0d 0h" },
  { id: 4, name: "Staff-Room (Display)", model: "Luckfox Pico Ultra", ip: "192.168.1.112", status: "Online", cpu: "15%", ram: "510MB/1GB", temp: "45°C", uptime: "22h 15m" },
];

export default function NodesPage() {
  return (
    <>
      <header className="header-glass py-4 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-warning/20 p-2 rounded-lg">
            <Cpu className="w-6 h-6 text-warning" />
          </div>
          <h1 className="text-2xl font-bold">Edge Orchestration</h1>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-outline gap-2">
            <RefreshCw className="w-4 h-4" /> Scan Network
          </button>
          <button className="btn btn-primary">
            + Provision Node
          </button>
        </div>
      </header>

      <div className="p-8 flex flex-col gap-6">
        {/* Global Stats */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-card border border-[var(--border)] p-5 rounded-2xl">
            <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Total Nodes</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold">24</h3>
              <div className="bg-success/10 text-success text-[10px] font-bold px-2 py-1 rounded">22 ACTIVE</div>
            </div>
          </div>
          <div className="bg-card border border-[var(--border)] p-5 rounded-2xl">
            <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Avg Latency</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold">14ms</h3>
              <div className="text-muted text-[10px] font-bold">EDGE-TO-CLOUD</div>
            </div>
          </div>
          <div className="bg-card border border-[var(--border)] p-5 rounded-2xl">
            <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Bandwidth</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold">1.2 GB</h3>
              <div className="text-muted text-[10px] font-bold">DAILY THROUGHPUT</div>
            </div>
          </div>
          <div className="bg-card border border-[var(--border)] p-5 rounded-2xl">
            <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Node Temp</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold">41°C</h3>
              <div className="bg-warning/10 text-warning text-[10px] font-bold px-2 py-1 rounded">NOMINAL</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search nodes by name, ID or IP..." 
              className="w-full bg-card border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-primary transition-colors"
            />
          </div>
          <button className="btn btn-outline gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Node Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {MOCK_NODES.map((node) => (
            <div key={node.id} className="bg-card border border-[var(--border)] rounded-2xl p-6 hover:border-warning/50 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                 <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                   node.status === 'Online' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                 }`}>
                   <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'Online' ? 'bg-success animate-pulse' : 'bg-danger'}`}></div>
                   {node.status}
                 </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center text-warning">
                  <Cpu className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-warning transition-colors">{node.name}</h3>
                  <p className="text-xs text-muted font-mono mt-1 flex items-center gap-2">
                    <Wifi className="w-3 h-3" /> {node.ip} • {node.model}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 pt-6 border-t border-[var(--border)]">
                <div>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-tight mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> CPU</p>
                  <p className="text-sm font-semibold">{node.cpu}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-tight mb-1 flex items-center gap-1"><Battery className="w-3 h-3" /> RAM</p>
                  <p className="text-sm font-semibold">{node.ram}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-tight mb-1 flex items-center gap-1">TEMP</p>
                  <p className="text-sm font-semibold">{node.temp}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-tight mb-1">UPTIME</p>
                  <p className="text-sm font-semibold">{node.uptime}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button className="btn btn-outline btn-sm flex-1">Configure</button>
                <button className="btn btn-outline btn-sm flex-1 text-danger border-danger/20 hover:bg-danger/10">Reboot</button>
                <button className="p-2 hover:bg-white/5 rounded-lg text-muted">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
