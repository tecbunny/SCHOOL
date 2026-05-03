"use client";

import { Bot, Bell, Award, Edit3, Sparkles, X, Loader2, FileCheck, CheckSquare, PenTool, Maximize2, Zap, CheckCircle } from 'lucide-react';
import { ChatDrawer } from '@/components/school/ClassroomTools';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import LiveMonitorGrid from '@/components/school/LiveMonitorGrid';
import ClassAnalytics from '@/components/school/ClassAnalytics';
import { isClassStationDevice } from '@/lib/device.client';
import OfflineHealthDashboard from '@/features/support/OfflineHealthDashboard';
import HubDistributionMode from '@/features/hardware/HubDistributionMode';

type GeneratedQuestion = {
  question?: string;
};

import { analyticsService } from '@/services/analytics.service';
import { createClient } from '@/lib/supabase';

export default function TeacherDashboard() {
  const [stats, setStats] = useState<any>({ totalCpdHours: 0, connectedStudents: 0, pendingGrading: 0, schoolId: null });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedQuestion[] | null>(null);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isClassStation] = useState(() => isClassStationDevice());
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('school_id')
          .eq('id', user.id)
          .single();

        if (profile) {
          const data = await analyticsService.getTeacherStats(user.id, profile.school_id);
          setStats({ ...data, schoolId: profile.school_id });
        }
      } catch (err) {
        console.error("Fetch Teacher Stats Error:", err);
      }
    };
    fetchStats();
  }, [supabase]);

  const handleGenerateAI = async () => {
    if (!isClassStation) {
      setAssessmentError('Class Station device required for exam, test, and quiz creation.');
      return;
    }
    setIsGenerating(true);
    setGeneratedResult(null);
    setAssessmentError(null);
    
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-class-station': 'true'
        },
        body: JSON.stringify({
          type: 'quiz',
          topics: ['Quadratic Equations'],
          grade: 'Class 10',
          difficulty: 'Medium',
          totalMarks: 20
        })
      });
      
      const data = await response.json();
      setGeneratedResult(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to generate:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishAssignment = async () => {
    if (!stats.schoolId || !generatedResult) return;
    setIsPublishing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const questionText = generatedResult[0]?.question || "Generated AI Assignment";
      
      const { error } = await supabase.from('assignments').insert({
        school_id: stats.schoolId,
        teacher_id: user.id,
        class_id: "10-A",
        subject: "Math",
        title: "AI Generated Quadratic Equations Quiz",
        description: questionText,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });

      if (error) throw error;
      
      setGeneratedResult(null);
      alert("Assignment published successfully!");
    } catch (error: any) {
      console.error('Failed to publish:', error);
      alert("Failed to publish: " + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeployLiveTest = async () => {
    if (!stats.schoolId || !generatedResult) return;
    try {
      const { data: students } = await supabase.from('profiles').select('id').eq('school_id', stats.schoolId).eq('class_id', '10-A').eq('role', 'student');
      
      if (!students || students.length === 0) {
        alert("No students found in class 10-A");
        return;
      }

      const liveTestPayload = {
        title: "Live Quiz: Quadratic Equations",
        subject: "Math",
        durationMinutes: 15,
        questions: generatedResult.map((q, idx) => ({
          id: `q-${idx}`,
          question: q.question || "Unknown question",
          options: ["Option A", "Option B", "Option C", "Option D"]
        }))
      };

      for (const student of students) {
        const topic = `private:school:${stats.schoolId}:class:10-A:student:${student.id}`;
        await supabase.channel(topic).send({
          type: 'broadcast',
          event: 'DEPLOY_TEST',
          payload: liveTestPayload
        });
      }

      alert("Live test deployed to class 10-A!");
    } catch (error: any) {
      console.error('Failed to deploy live test:', error);
      alert("Failed to deploy: " + error.message);
    }
  };

  return (
    <>
      <header className="header-glass py-4 px-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Academic Engine (Phase 4)</h1>
        <div className="flex items-center gap-4">
          <button className="btn btn-primary"><Bot className="w-4 h-4" /> Generate AI Paper</button>
          <div className="border-l border-[var(--border)] h-8 mx-2"></div>
          <button className="text-muted hover:text-white">
            <Bell className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="p-8 flex flex-col gap-8 flex-1">
        
        {/* CPD Tracker Card */}
        <div className="bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg p-6 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-[rgba(16,185,129,0.1)] p-4 rounded-full text-success">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Continuous Professional Development (CPD)</h3>
              <p className="text-sm text-muted">NEP 2020 Mandate: 50 Hours / Year</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 w-1/3">
            <div className="flex justify-between w-full text-sm font-bold">
              <span>{stats.totalCpdHours} Hours Logged</span>
              <span className="text-success">{Math.min(100, Math.round((stats.totalCpdHours / 50) * 100))}%</span>
            </div>
            <div className="w-full bg-card rounded-full h-3 border border-[var(--border)] overflow-hidden">
              <div className="bg-success h-full" style={{ width: `${Math.min(100, (stats.totalCpdHours / 50) * 100)}%` }}></div>
            </div>
            <button className="text-xs text-primary hover:underline mt-1">Log New CPD Session</button>
          </div>
        </div>
        
        {/* Split-Screen Grading Workflow (Phase 4) */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-card border border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileCheck className="w-24 h-24 text-primary" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-lg text-primary">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Pending Grading</h3>
                    <p className="text-xs text-muted">Scanned worksheets from Class Station (HPC-Edge)</p>
                  </div>
                </div>
                <Link href="/school/dashboard/teacher/grading/current" className="btn btn-primary btn-sm gap-2">
                  Launch Grader <Maximize2 className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex gap-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-card bg-primary/20 flex items-center justify-center font-bold text-xs">S{i}</div>)}
                  <div className="w-10 h-10 rounded-full border-2 border-card bg-white/5 flex items-center justify-center font-bold text-xs text-muted">+12</div>
                </div>
                <div className="text-sm text-muted flex items-center">
                  {stats.pendingGrading} Worksheets awaiting AI-assisted grading
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-secondary/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-secondary/20 p-2 rounded-lg text-secondary">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold">Edge Sync Status</h3>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted">Class Station (Luckfox)</span>
                <span className="text-success flex items-center gap-1 font-bold"><CheckCircle className="w-3 h-3" /> Synchronized</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted">Student Hubs ({stats.connectedStudents} Connected)</span>
                <span className="text-success font-bold">100%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-secondary w-full" />
              </div>
            </div>
          </div>
        </div>
        
        {isClassStation && <OfflineHealthDashboard />}

        {isClassStation && stats.schoolId && (
          <HubDistributionMode schoolId={stats.schoolId} classId="10-A" />
        )}

        {/* Quick Actions Menu */}
        <div className="flex gap-4">
          <button className="glass-panel hover:bg-white/5 transition-colors border border-[var(--border)] rounded-lg p-4 flex items-center justify-center gap-3 flex-1 text-primary font-semibold">
            <CheckSquare className="w-5 h-5" /> Mark Today&apos;s Attendance
          </button>
          <button className="glass-panel hover:bg-white/5 transition-colors border border-[var(--border)] rounded-lg p-4 flex items-center justify-center gap-3 flex-1 text-secondary font-semibold">
            <PenTool className="w-5 h-5" /> Quick Grade Entry
          </button>
        </div>

        {/* Live Monitoring Section (SSPH-01 Hardware Management) */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8">
          {stats.schoolId && <LiveMonitorGrid schoolId={stats.schoolId} />}
        </div>

        {/* AI Performance Insights */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8">
          <ClassAnalytics />
        </div>

        <div className="grid grid-cols-2 gap-8">
          
          {/* Grade Entry System (HPC) - Dynamic NEP Scales */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <h3 className="font-bold text-lg">NEP HPC Grade Entry</h3>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Foundational Stage Mode</p>
              </div>
              <span className="badge badge-neutral">Class 10-A (Math)</span>
            </div>
            
            <div className="bg-card border rounded-lg p-6">
              <div className="flex gap-4 mb-6 border-b border-[var(--border)] pb-4">
                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                  <input type="radio" name="assessmentType" defaultChecked className="accent-primary" /> Competency Based
                </label>
                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                  <input type="radio" name="assessmentType" className="accent-primary" /> Skill Observation
                </label>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between bg-[var(--bg-dark)] border p-3 rounded-md italic text-muted text-xs">
                  Select a student from the Live Monitor to begin assessment...
                </div>
              </div>
              <button disabled className="btn btn-primary w-full mt-6 justify-center opacity-50">Sync to Student HPC Cloud</button>
            </div>
          </div>

          {/* Paper Creator */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Exam / Quiz Creator</h3>
              <span className="text-xs text-muted cursor-pointer hover:text-white">View Past Papers</span>
            </div>

            <div className="bg-card border rounded-lg p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-muted">Assessment Type</label>
                <select className="bg-[var(--bg-dark)] border rounded-md px-3 py-2 text-white outline-none w-full">
                  <option>Subjective Exam Paper</option>
                  <option>Multiple Choice Quiz</option>
                  <option>Rapid Test</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-muted">Target Topics (from Syllabus)</label>
                <div className="bg-[var(--bg-dark)] border rounded-md p-3 flex gap-2 flex-wrap">
                  <span className="bg-primary text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">Quadratic Equations <X className="w-3 h-3 cursor-pointer" /></span>
                  <span className="bg-card border text-muted text-xs px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer hover:text-white">+ Add Topic</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-muted">Total Marks</label>
                  <input type="number" defaultValue="50" className="bg-[var(--bg-dark)] border rounded-md px-3 py-2 text-white outline-none w-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-muted">Difficulty</label>
                  <select className="bg-[var(--bg-dark)] border rounded-md px-3 py-2 text-white outline-none w-full">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>

            <div className="flex gap-4 mt-4">
                <button className="btn btn-outline flex-1 justify-center"><Edit3 className="w-4 h-4" /> Create Manually</button>
                <button 
                  className="btn btn-secondary flex-1 justify-center bg-secondary text-white hover:bg-opacity-80 border-none disabled:opacity-50"
                  onClick={handleGenerateAI}
                  disabled={isGenerating || !isClassStation}
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> AI Auto-Draft</>}
                </button>
              </div>
              {!isClassStation && (
                <p className="text-[11px] text-warning font-bold uppercase tracking-widest">
                  Class Station required for exam, test, and quiz actions.
                </p>
              )}
            </div>

            {/* AI Result Preview */}
            {assessmentError && (
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-warning text-xs font-bold uppercase tracking-widest">
                {assessmentError}
              </div>
            )}
            {generatedResult && (
              <div className="bg-[rgba(139,92,246,0.1)] border border-secondary rounded-lg p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-secondary flex items-center gap-2"><FileCheck className="w-4 h-4" /> AI Draft Generated</h4>
                  <button onClick={() => setGeneratedResult(null)} className="text-muted hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="text-sm text-muted">
                  <p className="font-semibold text-white mb-2">Example Question:</p>
                  <p className="italic">&quot;{generatedResult[0]?.question || 'Generating content...'}&quot;</p>
                </div>
                <div className="flex gap-2 mt-2">
                  <button 
                    className="btn btn-primary text-xs py-1 flex-1 disabled:opacity-50"
                    onClick={handlePublishAssignment}
                    disabled={isPublishing}
                  >
                    {isPublishing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Approve & Publish As Assignment'}
                  </button>
                  <button 
                    className="btn btn-secondary text-xs py-1 flex-1"
                    onClick={handleDeployLiveTest}
                  >
                    Deploy Live Test Now
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      
      <ChatDrawer title="10-A Math Class" />
    </>
  );
}
