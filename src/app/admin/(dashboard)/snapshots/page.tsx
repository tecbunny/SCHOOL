"use client";

import { FolderUp, Database, Clock, Shield, Plus, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

type SnapshotEvent = {
  id: string;
  event_type: string;
  severity: string;
  message: string;
  created_at: string;
  metadata: Record<string, any> | null;
};

export default function SnapshotsPage() {
  const [events, setEvents] = useState<SnapshotEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSnapshotEvents = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('system_logs')
        .select('id, event_type, severity, message, created_at, metadata')
        .in('event_type', ['BACKUP', 'SNAPSHOT', 'SYSTEM'])
        .order('created_at', { ascending: false })
        .limit(25);

      if (error) console.error('Failed to fetch snapshot history:', error);
      else setEvents((data || []) as SnapshotEvent[]);
      setLoading(false);
    };

    fetchSnapshotEvents();
  }, []);

  const healthyEvents = events.filter((event) => !['error', 'critical'].includes(event.severity)).length;

  return (
    <>
      <header className="header-glass py-4 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <FolderUp className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">System Snapshots</h1>
        </div>
        <button className="btn btn-primary gap-2">
          <Plus className="w-4 h-4" /> Create Snapshot
        </button>
      </header>

      <div className="p-8 flex flex-col gap-8">
        <div className="bg-card border border-[var(--border)] rounded-2xl p-6 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 w-full">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-sm text-muted font-medium">Vault Snapshot Health</p>
                <h3 className="text-2xl font-bold">{healthyEvents} <span className="text-sm font-normal text-muted">healthy events recorded</span></h3>
              </div>
              <p className="text-sm font-bold text-primary">{events.length} total</p>
            </div>
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(14,165,233,0.5)]"
                style={{ width: `${events.length ? Math.round((healthyEvents / events.length) * 100) : 0}%` }}
              />
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="px-6 py-3 bg-white/5 rounded-xl border border-white/10 text-center flex-1 md:flex-none">
              <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1">Logged Events</p>
              <p className="text-xl font-bold text-white">{events.length}</p>
            </div>
            <div className="px-6 py-3 bg-white/5 rounded-xl border border-white/10 text-center flex-1 md:flex-none">
              <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1">Source</p>
              <p className="text-xl font-bold text-white">Logs</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold">Snapshot History</h3>
          <div className="grid grid-cols-1 gap-3">
            {loading && (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {!loading && events.map((event) => (
              <div key={event.id} className="bg-card border border-[var(--border)] rounded-xl p-4 flex items-center justify-between group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-muted group-hover:text-primary transition-colors">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{event.message}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(event.created_at).toLocaleString()}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{event.event_type}</span>
                    </div>
                  </div>
                </div>
                <span className={`badge ${['error', 'critical'].includes(event.severity) ? 'badge-danger' : 'badge-success'}`}>
                  {event.severity}
                </span>
              </div>
            ))}

            {!loading && events.length === 0 && (
              <div className="bg-card border border-[var(--border)] rounded-xl p-12 text-center text-muted font-bold">
                No snapshot or backup events have been logged yet.
              </div>
            )}
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex items-start gap-4">
          <Shield className="w-6 h-6 text-primary mt-1" />
          <div>
            <h4 className="font-bold text-primary mb-1">Audit-backed View</h4>
            <p className="text-sm text-muted leading-relaxed">
              Snapshot status is now derived from the system log stream instead of fixed storage and retention numbers.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
