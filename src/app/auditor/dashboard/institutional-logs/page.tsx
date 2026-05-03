"use client";

import { Activity, CalendarClock, FileText, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

const fallbackLogs = [
  { id: 'AUD-2026-0412', date: '2026-04-12', type: 'Surprise Audit', school: 'Demo Public School', result: 'Pass', severity: 'low' },
  { id: 'AUD-2026-0302', date: '2026-03-02', type: 'Annual Review', school: 'Demo Public School', result: 'Pass', severity: 'low' },
  { id: 'AUD-2026-0215', date: '2026-02-15', type: 'Health & Safety', school: 'Demo Public School', result: 'Caution', severity: 'medium' },
  { id: 'AUD-2026-0129', date: '2026-01-29', type: 'Device Sync Review', school: 'Demo Public School', result: 'Pass', severity: 'low' },
];

export default function InstitutionalLogsPage() {
  const [logs, setLogs] = useState<any[]>(fallbackLogs);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await supabase
          .from('audit_logs')
          .select(`
            id, action, resource_type, created_at, metadata,
            schools ( name )
          `)
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (data && data.length > 0) {
          setLogs(data.map(log => ({
            id: log.id,
            date: new Date(log.created_at).toISOString().slice(0, 10),
            type: log.action,
            school: (log.schools as any)?.name || 'Unknown School',
            result: log.metadata?.result || 'Pass',
            severity: log.metadata?.severity || 'low'
          })));
        }
      } catch (err) {
        console.error('Failed to fetch audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <section className="min-h-screen bg-[#070B19] text-white p-10">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
        <header>
          <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs mb-3">
            <FileText className="w-5 h-5" />
            Institutional logs
          </div>
          <h1 className="text-4xl font-black">Audit trail and inspection ledger</h1>
          <p className="text-muted mt-2">Chronological record of reviews, alerts, and institutional compliance events.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: 'Reviews', value: '12', icon: CalendarClock, color: 'text-primary' },
            { label: 'Alerts', value: '02', icon: ShieldAlert, color: 'text-warning' },
            { label: 'Signed Logs', value: '08', icon: ShieldCheck, color: 'text-success' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-3xl p-6">
              <stat.icon className={`w-7 h-7 ${stat.color} mb-5`} />
              <div className="text-3xl font-black">{stat.value}</div>
              <div className="text-xs text-muted font-black uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-[3rem] p-6">
          <div className="flex flex-col gap-4">
            {logs.map((log) => (
              <article key={log.id} className="bg-white/5 border border-white/10 rounded-3xl p-5 flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  log.severity === 'medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                }`}>
                  <Activity className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="font-black">{log.type}</h2>
                  <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">
                    {log.id} / {log.school} / {log.date}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                  log.result === 'Pass' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                }`}>
                  {log.result}
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
