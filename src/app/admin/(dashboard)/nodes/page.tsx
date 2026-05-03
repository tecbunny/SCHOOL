"use client";

import { useState, useEffect } from 'react';
import { 
  Cpu, 
  Thermometer, 
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
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [provisioning, setProvisioning] = useState<any>(null);
  const [form, setForm] = useState({
    schoolId: "",
    nodeName: "",
    nodeType: "student-hub",
    stationCode: "",
    macAddress: "",
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchNodes = async () => {
      const [{ data, error }, schoolsResult] = await Promise.all([
        supabase
        .from('hardware_nodes')
        .select('*')
        .order('last_heartbeat', { ascending: false }),
        supabase.from('schools').select('id, school_name, school_code').order('school_name')
      ]);
      
      if (!error) setNodes(data);
      if (!schoolsResult.error) {
        setSchools(schoolsResult.data || []);
        if (schoolsResult.data?.[0]?.id) {
          setForm((current) => current.schoolId ? current : { ...current, schoolId: schoolsResult.data[0].id });
        }
      }
      setLoading(false);
    };

    fetchNodes();
    
    // Real-time updates for telemetry
    const channel = supabase
      .channel('nodes-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'hardware_nodes' }, (payload: any) => {
        setNodes(prev => prev.map(n => n.id === payload.new.id ? payload.new : n));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const getThermalStatus = (temp: number) => {
    if (temp > 75) return { color: 'text-danger', icon: <AlertTriangle className="w-4 h-4" />, label: 'CRITICAL' };
    if (temp > 60) return { color: 'text-warning', icon: <Activity className="w-4 h-4" />, label: 'THROTTLING' };
    return { color: 'text-success', icon: <CheckCircle2 className="w-4 h-4" />, label: 'OPTIMAL' };
  };

  const updateForm = (key: string, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const enrollNode = async (event: React.FormEvent) => {
    event.preventDefault();
    setEnrolling(true);
    setProvisioning(null);
    try {
      const response = await fetch("/api/admin/hardware/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Enrollment failed.");
      setNodes((current) => [data.node, ...current]);
      setProvisioning(data.provisioning);
      setForm((current) => ({
        ...current,
        nodeName: "",
        stationCode: "",
        macAddress: "",
      }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Enrollment failed.");
    } finally {
      setEnrolling(false);
    }
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
         <form onSubmit={enrollNode} className="col-span-12 bg-card border border-white/5 rounded-[2rem] p-6 grid grid-cols-12 gap-4 items-end">
           <div className="col-span-12 flex items-center justify-between">
             <div>
               <h2 className="font-black text-xl text-white">Enroll EduOS Station</h2>
               <p className="text-xs text-muted mt-1">Create a hardware node and copy the generated one-time device secret into the EduOS installer.</p>
             </div>
             {provisioning && (
               <div className="text-right">
                 <div className="text-[10px] text-muted uppercase font-black tracking-widest">Provisioning Secret</div>
                 <div className="font-mono text-xs text-success break-all max-w-xl">{provisioning.nodeSecret}</div>
               </div>
             )}
           </div>
           <label className="col-span-3 flex flex-col gap-2">
             <span className="text-[10px] font-black uppercase tracking-widest text-muted">School</span>
             <select value={form.schoolId} onChange={(event) => updateForm("schoolId", event.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 outline-none">
               {schools.map((school) => (
                 <option key={school.id} value={school.id}>{school.school_name} ({school.school_code})</option>
               ))}
             </select>
           </label>
           <label className="col-span-2 flex flex-col gap-2">
             <span className="text-[10px] font-black uppercase tracking-widest text-muted">Type</span>
             <select value={form.nodeType} onChange={(event) => updateForm("nodeType", event.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 outline-none">
               <option value="student-hub">Student Hub</option>
               <option value="class-station">Class Station</option>
               <option value="admin-kiosk">Admin Kiosk</option>
             </select>
           </label>
           <label className="col-span-2 flex flex-col gap-2">
             <span className="text-[10px] font-black uppercase tracking-widest text-muted">Name</span>
             <input value={form.nodeName} onChange={(event) => updateForm("nodeName", event.target.value)} placeholder="Lab 1 Hub" className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 outline-none" required />
           </label>
           <label className="col-span-2 flex flex-col gap-2">
             <span className="text-[10px] font-black uppercase tracking-widest text-muted">Station Code</span>
             <input value={form.stationCode} onChange={(event) => updateForm("stationCode", event.target.value.toUpperCase().replace(/\s+/g, "-"))} placeholder="SCH001-HUB-01" className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 outline-none font-mono" required />
           </label>
           <label className="col-span-2 flex flex-col gap-2">
             <span className="text-[10px] font-black uppercase tracking-widest text-muted">MAC optional</span>
             <input value={form.macAddress} onChange={(event) => updateForm("macAddress", event.target.value)} placeholder="AA:BB:CC:DD" className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 outline-none font-mono" />
           </label>
           <button type="submit" disabled={enrolling || schools.length === 0} className="col-span-1 btn btn-primary h-[46px] justify-center">
             {enrolling ? "..." : "Enroll"}
           </button>
         </form>
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

                {/* Progress indicators from latest device telemetry */}
                <div className="mt-8 flex flex-col gap-4 relative z-10">
                   <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-[10px] font-bold text-muted uppercase">
                         <span>Disk Usage</span>
                         <span>{node.disk_usage ?? 0}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(Number(node.disk_usage ?? 0), 100)}%` }}></div>
                      </div>
                   </div>
                   <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-[10px] font-bold text-muted uppercase">
                         <span>Memory Usage</span>
                         <span>{node.memory_usage ?? 0}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-secondary rounded-full" style={{ width: `${Math.min(Number(node.memory_usage ?? 0), 100)}%` }}></div>
                      </div>
                   </div>
                </div>

                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
             </div>
           );
         })}
         {loading && (
           <div className="col-span-12 p-10 text-center text-xs font-bold uppercase tracking-widest text-muted">
             Loading edge node telemetry...
           </div>
         )}
         {!loading && nodes.length === 0 && (
           <div className="col-span-12 p-10 text-center text-xs font-bold uppercase tracking-widest text-muted">
             No edge nodes are currently registered.
           </div>
         )}
      </div>
    </div>
  );
}
