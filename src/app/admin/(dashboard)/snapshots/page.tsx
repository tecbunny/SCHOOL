"use client";

import { FolderUp, Database, Clock, RotateCw, Trash2, Shield, Plus } from 'lucide-react';

const MOCK_SNAPSHOTS = [
  { id: 1, name: "Weekly_Backup_290426", size: "1.2 GB", date: "2026-04-29 02:00", type: "Full", status: "Healthy" },
  { id: 2, name: "Post_Update_Fix", size: "450 MB", date: "2026-04-28 15:30", type: "Incremental", status: "Healthy" },
  { id: 3, name: "Auto_Snapshot_270426", size: "1.2 GB", date: "2026-04-27 02:00", type: "Full", status: "Healthy" },
  { id: 4, name: "Migration_Test_Snap", size: "850 MB", date: "2026-04-25 10:15", type: "Full", status: "Archived" },
];

export default function SnapshotsPage() {
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
        {/* Storage Overview */}
        <div className="bg-card border border-[var(--border)] rounded-2xl p-6 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 w-full">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-sm text-muted font-medium">Vault Storage Usage</p>
                <h3 className="text-2xl font-bold">42.5 GB <span className="text-sm font-normal text-muted">/ 100 GB</span></h3>
              </div>
              <p className="text-sm font-bold text-primary">42.5%</p>
            </div>
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(14,165,233,0.5)]" style={{ width: '42.5%' }}></div>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="px-6 py-3 bg-white/5 rounded-xl border border-white/10 text-center flex-1 md:flex-none">
              <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1">Total Snaps</p>
              <p className="text-xl font-bold text-white">12</p>
            </div>
            <div className="px-6 py-3 bg-white/5 rounded-xl border border-white/10 text-center flex-1 md:flex-none">
              <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1">Retention</p>
              <p className="text-xl font-bold text-white">30 Days</p>
            </div>
          </div>
        </div>

        {/* Snapshot List */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold">Available Snapshots</h3>
          <div className="grid grid-cols-1 gap-3">
            {MOCK_SNAPSHOTS.map((snap) => (
              <div key={snap.id} className="bg-card border border-[var(--border)] rounded-xl p-4 flex items-center justify-between group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-muted group-hover:text-primary transition-colors">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{snap.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted flex items-center gap-1"><Clock className="w-3 h-3" /> {snap.date}</span>
                      <span className="text-xs text-muted font-mono bg-white/5 px-1.5 py-0.5 rounded">{snap.size}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{snap.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="btn btn-outline btn-sm gap-2">
                    <RotateCw className="w-3.5 h-3.5" /> Restore
                  </button>
                  <button className="p-2 hover:bg-danger/10 rounded-lg text-muted hover:text-danger transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex items-start gap-4">
          <Shield className="w-6 h-6 text-primary mt-1" />
          <div>
            <h4 className="font-bold text-primary mb-1">Encrypted & Redundant</h4>
            <p className="text-sm text-muted leading-relaxed">
              All snapshots are AES-256 encrypted at rest and replicated across three geographic availability zones.
              Manual snapshots are retained indefinitely, while automated daily backups are kept for 30 days.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}


