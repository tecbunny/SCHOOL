"use client";

import { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  Terminal, 
  AlertCircle, 
  Info,
  Clock,
  Cpu,
  Zap,
  RefreshCw,
  ArrowUpRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (!error) setLogs(data);
      setLoading(false);
    };

    fetchLogs();

    // Real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_logs' }, (payload: any) => {
        setLogs(prev => [payload.new, ...prev].slice(0, 50));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="w-4 h-4 text-danger" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-danger" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-warning" />;
      default: return <Info className="w-4 h-4 text-primary" />;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'HARDWARE': return <Cpu className="w-4 h-4" />;
      case 'AI_GRADING': return <Zap className="w-4 h-4" />;
      case 'AUTH': return <Shield className="w-4 h-4" />;
      default: return <Terminal className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header */}
      <header className="header-glass py-6 px-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Terminal className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">System Vault Logs</h1>
            <p className="text-sm text-muted">Real-time institutional audit trail & telemetry stream.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="text" 
                placeholder="Search events..."
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-primary transition-all w-64"
              />
           </div>
           <button className="btn btn-outline gap-2 border-white/10 hover:bg-white/5 text-xs">
              <Filter className="w-4 h-4" /> Filter Logs
           </button>
        </div>
      </header>

      {/* Main Stream Area */}
      <div className="flex-1 p-8 overflow-hidden">
         <div className="h-full bg-card border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                  <span className="text-xs font-bold text-success uppercase tracking-widest">Live Stream Active</span>
               </div>
               <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Last 50 Institutional Events</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
               <div className="flex flex-col">
                  {logs.map((log) => (
                    <div key={log.id} className="p-6 border-b border-white/5 hover:bg-white/[0.02] transition-colors flex items-center gap-8 group">
                       <div className="w-32 flex flex-col gap-1">
                          <div className="text-[10px] font-bold text-muted flex items-center gap-1.5 uppercase">
                             <Clock className="w-3 h-3" />
                             {new Date(log.created_at).toLocaleTimeString()}
                          </div>
                          <div className="text-[10px] font-mono text-muted/50">{new Date(log.created_at).toLocaleDateString()}</div>
                       </div>

                       <div className="w-40">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-2 w-fit bg-white/5 border border-white/10`}>
                             {getEventIcon(log.event_type)}
                             {log.event_type}
                          </span>
                       </div>

                       <div className="flex-1">
                          <div className="flex items-center gap-3">
                             {getSeverityIcon(log.severity)}
                             <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">{log.message}</span>
                          </div>
                          {log.metadata && (
                            <div className="mt-2 text-[10px] font-mono text-muted bg-black/40 p-2 rounded-lg border border-white/5 overflow-hidden text-ellipsis whitespace-nowrap opacity-60 group-hover:opacity-100 transition-opacity max-w-2xl">
                               {JSON.stringify(log.metadata)}
                            </div>
                          )}
                       </div>

                       <div className="w-32 text-right">
                          <button className="p-2 hover:bg-white/10 rounded-lg text-muted opacity-0 group-hover:opacity-100 transition-all">
                             <ArrowUpRight className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  ))}

                  {logs.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center p-20 opacity-20">
                       <RefreshCw className="w-12 h-12 mb-4" />
                       <p className="font-bold">Waiting for system events...</p>
                    </div>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
