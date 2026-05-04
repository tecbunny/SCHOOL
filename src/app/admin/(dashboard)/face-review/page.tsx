"use client";

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ScanFace,
  User,
  CheckCircle2,
  XCircle,
  Activity,
  History
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import FaceEnrollment from '@/features/hardware/FaceEnrollment';

export default function FaceReviewPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch templates
      const { data: templatesData } = await supabase
        .from('student_face_templates')
        .select('*, profiles!student_id(full_name, user_code)')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (templatesData) setTemplates(templatesData);

      // Fetch recent attempts
      const { data: attemptsData } = await supabase
        .from('face_verification_attempts')
        .select('*, profiles!student_id(full_name, user_code)')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (attemptsData) setAttempts(attemptsData);
      
      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header */}
      <header className="header-glass py-6 px-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <ScanFace className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Face Verification Tuning</h1>
            <p className="text-sm text-muted">Review enrollment templates and authentication telemetry.</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-8">
          
          {/* Left Column: Enrolled Templates */}
          <div className="col-span-6 flex flex-col gap-6">
            <FaceEnrollment />
            
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-4">
              <ShieldCheck className="w-5 h-5 text-success" /> Active Templates
            </h2>
            <div className="flex flex-col gap-4">
              {templates.map(t => (
                <div key={t.id} className="bg-card border border-white/5 rounded-3xl p-6 flex justify-between items-center hover:border-primary/20 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                        <User className="w-6 h-6 text-muted" />
                      </div>
                      <div>
                         <h3 className="font-bold text-white">{t.profiles?.full_name || 'Unknown Student'}</h3>
                         <div className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">
                           Code: {t.profiles?.user_code} • Model: {t.embedding_model}
                         </div>
                      </div>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${t.active ? 'bg-success/10 border-success/20 text-success' : 'bg-warning/10 border-warning/20 text-warning'}`}>
                         {t.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                      <span className="text-[10px] text-muted mt-2">
                         {new Date(t.created_at).toLocaleDateString()}
                      </span>
                   </div>
                </div>
              ))}
              {templates.length === 0 && !loading && (
                <div className="text-muted p-8 text-center bg-white/5 rounded-3xl border border-white/5">
                  No active templates found.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Verification Attempts */}
          <div className="col-span-6 flex flex-col gap-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Verification Telemetry
            </h2>
            <div className="flex flex-col gap-4">
              {attempts.map(a => (
                <div key={a.id} className="bg-card border border-white/5 rounded-3xl p-6 flex justify-between items-center hover:border-primary/20 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${a.verified ? 'bg-success/10 border-success/20' : 'bg-danger/10 border-danger/20'}`}>
                        {a.verified ? <CheckCircle2 className="w-6 h-6 text-success" /> : <XCircle className="w-6 h-6 text-danger" />}
                      </div>
                      <div>
                         <h3 className="font-bold text-white">{a.profiles?.full_name || 'Unknown Student'}</h3>
                         <div className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                           <Activity className="w-3 h-3" /> Similarity: {(a.similarity * 100).toFixed(1)}%
                         </div>
                      </div>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-[10px] text-muted font-bold uppercase tracking-widest">
                         Threshold: {(a.threshold * 100).toFixed(0)}%
                      </span>
                      <span className="text-[10px] text-muted mt-2">
                         {new Date(a.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                   </div>
                </div>
              ))}
              {attempts.length === 0 && !loading && (
                <div className="text-muted p-8 text-center bg-white/5 rounded-3xl border border-white/5">
                  No verification attempts recorded.
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
