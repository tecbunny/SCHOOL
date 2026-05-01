"use client";

import { 
  GraduationCap, 
  Heart, 
  Activity, 
  ShieldCheck,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { analyticsService } from '@/services/analytics.service';
import { skillService } from '@/services/skill.service';

export default function HPCViewer() {
  const [stats, setStats] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const [statsData, profileData, skillMetrics] = await Promise.all([
          analyticsService.getStudentStats(user.id),
          supabase.from('profiles').select('*, schools(school_name)').eq('id', user.id).single(),
          skillService.getSkillMetrics(user.id)
        ]);
        
        setStats(statsData);
        setProfile(profileData.data);
        setSkills(skillMetrics);
      } catch (err) {
        console.error("Fetch HPC Data Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const metrics = stats ? [
    { 
      title: 'Academic Achievement', 
      icon: GraduationCap, 
      color: 'text-primary', 
      bg: 'bg-primary/10',
      value: stats.mastery.academic, 
      desc: 'Competency-based performance across subjects.' 
    },
    { 
      title: 'Socio-Emotional Pulse', 
      icon: Heart, 
      color: 'text-secondary', 
      bg: 'bg-secondary/10',
      value: stats.mastery.socio_emotional, 
      desc: 'Collaboration, empathy, and peer interaction.' 
    },
    { 
      title: 'Physical & Vocational', 
      icon: Activity, 
      color: 'text-success', 
      bg: 'bg-success/10',
      value: stats.mastery.physical, 
      desc: 'Health, sports participation, and skill acquisition.' 
    },
  ] : [];

  return (
    <div className="flex flex-col gap-8 h-full">
      
      {/* 360-Degree Header */}
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-3xl font-black text-white">Holistic Progress Card</h2>
            <p className="text-muted">NEP 2020 Compliant • 360-Degree Evaluation</p>
         </div>
         <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
            <ShieldCheck className="w-6 h-6 text-success" />
            <div className="text-right">
               <div className="text-[10px] font-bold text-muted uppercase">Verified By</div>
               <div className="text-sm font-bold text-white">{profile?.schools?.school_name || "Institution"}</div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-3 gap-8 flex-1">
         {metrics.map((m, i) => (
            <div key={i} className="bg-card border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 relative overflow-hidden group">
               <div className="flex items-center gap-4">
                  <div className={`${m.bg} ${m.color} p-4 rounded-3xl`}>
                     <m.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-xl leading-tight">{m.title}</h3>
               </div>
               
               {/* Large Visual Progress */}
               <div className="flex-1 flex flex-col items-center justify-center relative py-8">
                  <div className="w-48 h-48 rounded-full border-[12px] border-white/5 flex items-center justify-center relative">
                     {/* CSS-based Circular Progress (Mock) */}
                     <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle 
                           cx="96" cy="96" r="84" 
                           fill="transparent" 
                           stroke="currentColor" 
                           strokeWidth="12" 
                           strokeDasharray={527}
                           strokeDashoffset={527 * (1 - m.value / 100)}
                           className={m.color}
                        />
                     </svg>
                     <div className="text-center">
                        <div className="text-5xl font-black text-white">{m.value}%</div>
                        <div className="text-[10px] font-bold text-muted uppercase tracking-widest">Mastery</div>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-3">
                  <p className="text-sm text-muted text-center leading-relaxed">
                     {m.desc}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-success">
                     <TrendingUp className="w-3 h-3" /> +4% from last assessment
                  </div>
               </div>

               {/* Background Decorative */}
               <div className="absolute -bottom-12 -right-12 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700">
                  <m.icon className="w-48 h-48" />
               </div>
            </div>
         ))}
      </div>

      {/* Vocational Skill Map (NEP 2020 Compliance) */}
      <div className="bg-card border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="bg-warning/20 p-2 rounded-xl">
                  <Zap className="w-5 h-5 text-warning" />
               </div>
               <div>
                  <h3 className="font-bold text-lg">Vocational Skill Map</h3>
                  <p className="text-xs text-muted">NEP 2020 "Bagless Days" Internship Progress.</p>
               </div>
            </div>
            <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">10-Day Module</span>
         </div>

         <div className="grid grid-cols-4 gap-6">
            {['Carpentry', 'Gardening', 'Coding', 'Pottery'].map(skill => {
              const hours = skills.filter((s: any) => s.metadata?.skill === skill).reduce((acc: number, curr: any) => acc + (curr.metadata?.hours || 0), 0);
              return (
                <div key={skill} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
                   <div className="flex justify-between items-center text-[10px] font-bold text-muted uppercase">
                      <span>{skill}</span>
                      <span className={hours >= 10 ? 'text-success' : 'text-warning'}>{hours}/10 Hrs</span>
                   </div>
                   <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${hours >= 10 ? 'bg-success' : 'bg-warning'}`}
                        style={{ width: `${Math.min((hours / 10) * 100, 100)}%` }}
                      ></div>
                   </div>
                </div>
              );
            })}
         </div>
      </div>

      {/* Recognition Footer */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-white/10 rounded-[2rem] p-6 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="bg-warning/20 text-warning p-3 rounded-full">
               <Award className="w-6 h-6" />
            </div>
            <div>
               <div className="text-sm font-bold text-white">Top Performer: Critical Thinking</div>
               <div className="text-xs text-muted">Awarded by Peer Review Council • {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
            </div>
         </div>
         <button className="text-xs font-bold text-primary hover:underline">Download Certified HPC (PDF)</button>
      </div>

    </div>
  );
}
