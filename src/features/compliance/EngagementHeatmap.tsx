"use client";

import { useEffect, useState } from 'react';
import { Activity, Info, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = ['8am', '10am', '12pm', '2pm', '4pm', '6pm'];

export default function EngagementHeatmap() {
  const [data, setData] = useState<number[][]>(() => Array.from({ length: 6 }, () => Array.from({ length: 7 }, () => 0)));
  const [peak, setPeak] = useState("No activity yet");
  const supabase = createClient();

  useEffect(() => {
    const loadActivity = async () => {
      const since = new Date();
      since.setDate(since.getDate() - 7);

      const [cpd, materials] = await Promise.all([
        supabase.from('cpd_logs').select('created_at').gte('created_at', since.toISOString()),
        supabase.from('materials').select('created_at').gte('created_at', since.toISOString()),
      ]);

      const counts = Array.from({ length: 6 }, () => Array.from({ length: 7 }, () => 0));
      const rows = [...(cpd.data || []), ...(materials.data || [])];
      rows.forEach((row: any) => {
        const date = new Date(row.created_at);
        const dayIndex = (date.getDay() + 6) % 7;
        const hourIndex = Math.min(Math.max(Math.floor((date.getHours() - 8) / 2), 0), 5);
        counts[hourIndex][dayIndex] += 1;
      });

      const max = Math.max(1, ...counts.flat());
      const normalized = counts.map((row) => row.map((value) => value / max));
      setData(normalized);

      let peakLabel = "No activity yet";
      counts.forEach((row, hourIndex) => {
        row.forEach((value, dayIndex) => {
          if (value === max && value > 0) peakLabel = `${days[dayIndex]}, ${hours[hourIndex]}`;
        });
      });
      setPeak(peakLabel);
    };

    void loadActivity();
  }, [supabase]);

  const getIntensityColor = (value: number) => {
    if (value > 0.8) return 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.4)]';
    if (value > 0.6) return 'bg-primary/70';
    if (value > 0.4) return 'bg-primary/40';
    if (value > 0.2) return 'bg-primary/20';
    return 'bg-white/5';
  };

  return (
    <div className="bg-card border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl overflow-hidden relative group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-xl">
             <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-black text-lg">Staff Engagement Heatmap</h3>
            <p className="text-xs text-muted">Real-time teacher activity & material usage index.</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="p-2 hover:bg-white/5 rounded-lg text-muted transition-colors">
              <Calendar className="w-4 h-4" />
           </button>
           <button className="p-2 hover:bg-white/5 rounded-lg text-muted transition-colors">
              <Info className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
         {/* The Heatmap Grid */}
         <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
               <div className="w-12"></div>
               {days.map(day => (
                 <div key={day} className="flex-1 text-center text-[10px] font-bold text-muted uppercase tracking-tighter">
                   {day}
                 </div>
               ))}
            </div>
            
            {hours.map((hour, hIdx) => (
              <div key={hour} className="flex items-center gap-2">
                <div className="w-12 text-[10px] font-bold text-muted text-right pr-2">{hour}</div>
                {data[hIdx].map((val, dIdx) => (
                  <div 
                    key={`${hIdx}-${dIdx}`}
                    className={`flex-1 aspect-square rounded-lg transition-all duration-500 hover:scale-110 cursor-pointer ${getIntensityColor(val)}`}
                    title={`Activity Index: ${(val * 100).toFixed(1)}%`}
                  ></div>
                ))}
              </div>
            ))}
         </div>

         {/* Legend */}
         <div className="flex items-center justify-end gap-3 mt-2">
            <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Activity:</span>
            <div className="flex gap-1.5 items-center">
               <div className="w-2 h-2 rounded-sm bg-white/5"></div>
               <div className="w-2 h-2 rounded-sm bg-primary/20"></div>
               <div className="w-2 h-2 rounded-sm bg-primary/40"></div>
               <div className="w-2 h-2 rounded-sm bg-primary/70"></div>
               <div className="w-2 h-2 rounded-sm bg-primary"></div>
            </div>
         </div>
      </div>

      <div className="bg-white/[0.02] -mx-8 -mb-8 p-6 border-t border-white/5 mt-2">
         <div className="flex justify-between items-center">
             <div className="flex flex-col">
                <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Peak Usage</span>
                <span className="text-sm font-black text-white">{peak}</span>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Engagement Index</span>
                <span className="text-sm font-black text-success">Active</span>
             </div>
         </div>
      </div>

    </div>
  );
}
