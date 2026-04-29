"use client";

import { useState, useEffect } from 'react';
import { 
  Cpu, 
  Thermometer, 
  HardDrive, 
  Activity, 
  Server, 
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function EdgeNodesPage() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchNodes = async () => {
      const { data, error } = await supabase
        .from('hardware_nodes')
        .select('*')
        .order('last_heartbeat', { ascending: false });
      
      if (!error) setNodes(data);
      setLoading(false);
    };

    fetchNodes();
    
    // Real-time updates for telemetry
    const channel = supabase
      .channel('nodes-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'hardware_nodes' }, payload => {
        setNodes(prev => prev.map(n => n.id === payload.new.id ? payload.new : n));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const getThermalStatus = (temp: number) => {
    if (temp > 75) return { color: 'text-danger', icon: <AlertTriangle className="w-4 h-4" />, label: 'CRITICAL' };
    if (temp > 60) return { color: 'text-warning', icon: <Activity className="w-4 h-4" />, label: 'THROTTLING' };
    return { color: 'text-success', icon: <CheckCircle2 className="w-4 h-4" />, label: 'OPTIMAL' };
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header */}
      <header className="header-glass py-6 px-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Cpu className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Edge Orchestration</h1>
            <p className="text-sm text-muted">Real-time telemetry & orchestration for EduOS Kiosks.</p>
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
           <button onClick={() => window.location.reload()} className="p-2 hover:bg-white/5 rounded-lg text-muted transition-colors">
              <RefreshCw className="w-4 h-4" />
           </button>
        </div>
      </header>

      {/* Pulse Grid */}
      <div className="p-8 grid grid-cols-12 gap-8 overflow-y-auto custom-scrollbar">
         {nodes.map((node) => {
           const thermal = getThermalStatus(node.temp || 0);
           return (
             <div key={node.id} className="col-span-4 bg-card border border-white/5 rounded-[2.5rem] p-8 hover:border-primary/20 transition-all group relative overflow-hidden">
                <div className="flex justify-between items-start mb-8 relative z-10">
                   <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-2xl">
                         <Server className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                         <h3 className="font-black text-lg text-white">{node.node_name}</h3>
                         <div className="text-[10px] text-muted font-bold uppercase tracking-widest">{node.mac_address}</div>
                      </div>
                   </div>
                   <div className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-2 border ${thermal.color === 'text-success' ? 'bg-success/10 border-success/20' : thermal.color === 'text-warning' ? 'bg-warning/10 border-warning/20' : 'bg-danger/10 border-danger/20'} ${thermal.color}`}>
                      {thermal.icon}
                      {thermal.label}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6 relative z-10">
                   <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                      <div className="flex items-center gap-2 text-muted text-[10px] font-bold uppercase tracking-widest mb-2">
                         <Thermometer className="w-3.5 h-3.5" /> Thermal
                      </div>
                      <div className={`text-2xl font-black ${thermal.color}`}>{node.temp}°C</div>
                   </div>
                   <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                      <div className="flex items-center gap-2 text-muted text-[10px] font-bold uppercase tracking-widest mb-2">
                         <Activity className="w-3.5 h-3.5" /> Heartbeat
                      </div>
                      <div className="text-xl font-black text-white flex items-center gap-1.5">
                         <Clock className="w-4 h-4 text-primary" />
                         {new Date(node.last_heartbeat).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                   </div>
                </div>

                {/* Progress Indicators (Mock data based on status) */}
                <div className="mt-8 flex flex-col gap-4 relative z-10">
                   <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-[10px] font-bold text-muted uppercase">
                         <span>Disk Usage</span>
                         <span>42%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                         <div className="w-[42%] h-full bg-primary rounded-full"></div>
                      </div>
                   </div>
                </div>

                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
             </div>
           );
         })}
      </div>
    </div>
  );
}
