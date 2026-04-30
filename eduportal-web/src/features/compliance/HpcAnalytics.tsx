"use client";

import { useState } from 'react';
import { 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  BarChart3, 
  ShieldCheck,
  Zap,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function HpcAnalytics() {
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const supabase = createClient();

  const generateGlobalSnapshot = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', session?.user.id)
        .single();

      if (!profile?.school_id) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/hpc-aggregator`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({ 
            schoolId: profile.school_id, 
            academicYear: "2025-26" 
          })
        }
      );
      
      const snapshot = await response.json();
      setAnalyticsData(snapshot.data);
    } catch (err) {
      console.error("Aggregation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden group">
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-xl">
             <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-black text-lg">HPC Competency Map</h3>
            <p className="text-xs text-muted">Institutional rollover of mastery circles.</p>
          </div>
        </div>
        <button 
          onClick={generateGlobalSnapshot}
          disabled={loading}
          className="btn btn-outline btn-sm gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Re-Sync Global
        </button>
      </div>

      {!analyticsData ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/5 rounded-3xl opacity-50">
           <Zap className="w-12 h-12 text-muted mb-4" />
           <p className="text-sm font-bold">No global snapshot found.</p>
           <button onClick={generateGlobalSnapshot} className="text-[10px] text-primary uppercase font-black tracking-widest mt-2 hover:underline">Generate Now</button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
           {[
             { label: 'Academic', val: analyticsData.competency_averages.academic.toFixed(1), color: 'text-primary' },
             { label: 'Socio-Emotional', val: analyticsData.competency_averages.socio_emotional.toFixed(1), color: 'text-success' },
             { label: 'Physical', val: analyticsData.competency_averages.physical.toFixed(1), color: 'text-warning' },
           ].map((stat, i) => (
             <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col gap-1">
                <span className="text-[9px] text-muted font-bold uppercase tracking-widest">{stat.label}</span>
                <div className={`text-2xl font-black ${stat.color}`}>{stat.val}<span className="text-xs font-normal text-muted">/4</span></div>
             </div>
           ))}
        </div>
      )}

      <div className="bg-primary/5 p-4 rounded-2xl flex gap-3 relative z-10">
         <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
         <p className="text-[10px] text-muted leading-relaxed">
            <strong>NEP 2020 Protocol:</strong> This report aggregates data across {analyticsData?.total_students || 0} students to identify institutional learning gaps.
         </p>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
    </div>
  );
}
