"use client";

import ComplianceHealthMap from '@/features/auditor/ComplianceHealthMap';
import { ClipboardCheck, Download, Filter } from 'lucide-react';

export default function ComplianceCheckPage() {
  return (
    <section className="min-h-screen bg-[#070B19] text-white p-10">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 text-success font-black uppercase tracking-widest text-xs mb-3">
              <ClipboardCheck className="w-5 h-5" />
              Compliance check
            </div>
            <h1 className="text-4xl font-black">NEP and operations review</h1>
            <p className="text-muted mt-2">Attendance, HPC, CPD, safety, and device health checks for audit review.</p>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-outline gap-2 rounded-2xl px-5 py-3">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="btn btn-primary gap-2 rounded-2xl px-5 py-3 bg-success border-success">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </header>

        <div className="glass-card rounded-[3rem] p-10">
          <ComplianceHealthMap />
        </div>
      </div>
    </section>
  );
}
