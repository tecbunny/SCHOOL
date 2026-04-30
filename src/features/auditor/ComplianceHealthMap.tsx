"use client";

import { 
  ShieldCheck, 
  Activity, 
  Users, 
  GraduationCap, 
  TrendingUp, 
  AlertCircle,
  Clock,
  Heart
} from 'lucide-react';

export default function ComplianceHealthMap() {
  return (
    <div className="flex flex-col gap-8">
      {/* High-Level Pulse */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Attendance %', value: '94.2%', trend: '+0.5%', status: 'success', icon: Users, color: 'text-success' },
          { label: 'HPC Average', value: '7.8', trend: '+1.2', status: 'success', icon: GraduationCap, color: 'text-primary' },
          { label: 'Staff CPD Avg', value: '38h', trend: '-2h', status: 'warning', icon: Clock, color: 'text-warning' },
          { label: 'System Health', value: 'Nominal', trend: 'Stable', status: 'success', icon: Activity, color: 'text-secondary' },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="flex justify-between items-center text-muted text-[10px] font-bold uppercase tracking-widest mb-1">
              {stat.label} <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className={`text-[10px] flex items-center gap-1 mt-1 ${stat.status === 'success' ? 'text-success' : 'text-warning'}`}>
              <TrendingUp className="w-3 h-3" /> {stat.trend} from last month
            </div>
          </div>
        ))}
      </div>

      {/* Compliance Detailed Map */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* NEP 2020 Compliance Matrix */}
        <div className="col-span-7 bg-card border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3">
               <ShieldCheck className="w-5 h-5 text-primary" />
               <h3 className="font-bold">NEP 2020 Compliance Matrix</h3>
            </div>
            <span className="badge badge-success">88% Compliant</span>
          </div>
          
          <div className="p-6 flex flex-col gap-6">
            {[
              { stage: 'Foundational', status: 'Active', compliance: 100, details: 'Competency-based UI enabled.' },
              { stage: 'Preparatory', status: 'Active', compliance: 95, details: 'Subject-wise tracking integrated.' },
              { stage: 'Middle', status: 'Partial', compliance: 72, details: 'Vocational integration pending.' },
              { stage: 'Secondary', status: 'Review', compliance: 45, details: 'CBSE grading mapping required.' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-6">
                <div className="w-32 text-sm font-bold">{item.stage}</div>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                   <div 
                    className={`h-full transition-all duration-1000 ${item.compliance > 80 ? 'bg-success' : item.compliance > 50 ? 'bg-warning' : 'bg-danger'}`}
                    style={{ width: `${item.compliance}%` }}
                   />
                </div>
                <div className="w-48 text-[10px] text-muted">{item.details}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Alerts / Intervention Required */}
        <div className="col-span-5 flex flex-col gap-6">
           <div className="bg-danger/5 border border-danger/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                 <AlertCircle className="w-5 h-5 text-danger" />
                 <h3 className="font-bold text-sm uppercase">Priority Alerts</h3>
              </div>
              <div className="flex flex-col gap-4">
                 <div className="flex gap-3 text-xs bg-black/20 p-3 rounded-xl border border-danger/10">
                    <span className="text-danger font-bold">L1</span>
                    <p className="text-muted leading-relaxed">Attendance in <span className="text-white">Class 8-B</span> has dropped below 75% for 3 consecutive weeks.</p>
                 </div>
                 <div className="flex gap-3 text-xs bg-black/20 p-3 rounded-xl border border-danger/10">
                    <span className="text-danger font-bold">L2</span>
                    <p className="text-muted leading-relaxed">Staff CPD compliance in <span className="text-white">Arts Dept</span> is at 12% against a target of 60%.</p>
                 </div>
              </div>
           </div>

           <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                 <Heart className="w-5 h-5 text-secondary" />
                 <h3 className="font-bold text-sm uppercase">Wellbeing Pulse</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed mb-4">Sentiment analysis from student feedback indicates high satisfaction in Science modules (+14% vs avg).</p>
              <div className="h-24 w-full bg-black/20 rounded-xl border border-secondary/10 flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 flex items-center justify-center gap-1">
                    {[1,2,3,4,5,6,7,8,9,10].map(i => (
                      <div 
                        key={i} 
                        className="w-1.5 bg-secondary/30 rounded-full animate-pulse" 
                        style={{ height: `${20 + Math.random() * 60}%`, animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                 </div>
                 <div className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] relative z-10 bg-black/40 px-3 py-1 rounded-full border border-secondary/20">Live Pulse: 92bpm</div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
