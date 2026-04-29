"use client";

import { ShieldCheck, Search, Filter, Download, AlertCircle, Info, CheckCircle, Clock } from 'lucide-react';

const MOCK_LOGS = [
  { id: 1, type: 'Security', event: 'New Admin Login', user: 'admin@eduportal.com', ip: '192.168.1.1', time: '2 mins ago', severity: 'low' },
  { id: 2, type: 'System', event: 'Database Backup', user: 'System', ip: 'internal', time: '1 hour ago', severity: 'info' },
  { id: 3, type: 'Action', event: 'School Provisioned', user: 'admin@eduportal.com', ip: '192.168.1.1', time: '3 hours ago', severity: 'info' },
  { id: 4, type: 'Security', event: 'Failed Login Attempt', user: 'unknown@hacker.com', ip: '45.12.33.2', time: '5 hours ago', severity: 'high' },
  { id: 5, type: 'System', event: 'AI Model Re-indexed', user: 'System', ip: 'internal', time: '12 hours ago', severity: 'info' },
  { id: 6, type: 'Action', event: 'Plan Upgrade', user: 'SCH7878 Admin', ip: '10.0.0.5', time: '1 day ago', severity: 'medium' },
];

export default function LogsPage() {
  return (
    <>
      <header className="header-glass py-4 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-success/20 p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-success" />
          </div>
          <h1 className="text-2xl font-bold">Vault Logs</h1>
        </div>
        <button className="btn btn-outline gap-2">
          <Download className="w-4 h-4" /> Export Logs
        </button>
      </header>

      <div className="p-8 flex flex-col gap-6">
        {/* Status bar */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card border border-[var(--border)] p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success"><CheckCircle className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] text-muted font-bold uppercase tracking-wider">System Integrity</p>
              <p className="text-sm font-bold">COMPROMISE FREE</p>
            </div>
          </div>
          <div className="bg-card border border-[var(--border)] p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Clock className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Uptime</p>
              <p className="text-sm font-bold">99.98% (30d)</p>
            </div>
          </div>
          <div className="bg-card border border-[var(--border)] p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning"><AlertCircle className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Warnings</p>
              <p className="text-sm font-bold">12 Active</p>
            </div>
          </div>
          <div className="bg-card border border-[var(--border)] p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary"><Info className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Active Sessions</p>
              <p className="text-sm font-bold">452 Users</p>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search logs by keyword, user or IP..." 
              className="w-full bg-card border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-primary transition-colors"
            />
          </div>
          <select className="bg-card border border-[var(--border)] rounded-xl px-4 py-2.5 outline-none focus:border-primary text-sm text-muted">
            <option>All Severities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low / Info</option>
          </select>
        </div>

        {/* Log List */}
        <div className="bg-card border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Event</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">User / Source</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted uppercase tracking-wider">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {MOCK_LOGS.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm text-muted whitespace-nowrap">{log.time}</td>
                    <td className="px-6 py-4 text-sm font-medium">{log.type}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white font-semibold">{log.event}</div>
                      <div className="text-[10px] text-muted font-mono mt-0.5">{log.ip}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{log.user}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        log.severity === 'high' ? 'bg-danger/20 text-danger' : 
                        log.severity === 'medium' ? 'bg-warning/20 text-warning' : 
                        'bg-success/20 text-success'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-[var(--border)] text-center">
            <button className="text-sm text-primary hover:underline">Load More Logs</button>
          </div>
        </div>
      </div>
    </>
  );
}
