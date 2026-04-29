"use client";

import { Bot, Bell, Award, Edit3, Sparkles, X, Loader2, FileCheck, CheckSquare, PenTool } from 'lucide-react';
import ChatDrawer from '@/components/school/ChatDrawer';
import { useState } from 'react';
import LiveMonitorGrid from '@/components/school/LiveMonitorGrid';

export default function TeacherDashboard() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setGeneratedResult(null);
    
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'quiz',
          topics: ['Quadratic Equations'],
          grade: 'Class 10',
          difficulty: 'Medium',
          totalMarks: 20
        })
      });
      
      const data = await response.json();
      setGeneratedResult(data);
    } catch (error) {
      console.error('Failed to generate:', error);
    } finally {
      setIsGenerating(false);
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
              <span>42 Hours Logged</span>
              <span className="text-success">84%</span>
            </div>
            <div className="w-full bg-card rounded-full h-3 border border-[var(--border)] overflow-hidden">
              <div className="bg-success h-full" style={{ width: '84%' }}></div>
            </div>
            <button className="text-xs text-primary hover:underline mt-1">Log New CPD Session</button>
          </div>
        </div>
        
        {/* Quick Actions Menu */}
        <div className="flex gap-4">
          <button className="glass-panel hover:bg-white/5 transition-colors border border-[var(--border)] rounded-lg p-4 flex items-center justify-center gap-3 flex-1 text-primary font-semibold">
            <CheckSquare className="w-5 h-5" /> Mark Today's Attendance
          </button>
          <button className="glass-panel hover:bg-white/5 transition-colors border border-[var(--border)] rounded-lg p-4 flex items-center justify-center gap-3 flex-1 text-secondary font-semibold">
            <PenTool className="w-5 h-5" /> Quick Grade Entry
          </button>
        </div>

        {/* Live Monitoring Section (SSPH-01 Hardware Management) */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8">
          <LiveMonitorGrid schoolId="current-school" />
        </div>

        <div className="grid grid-cols-2 gap-8">
          
          {/* Grade Entry System (HPC) */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">HPC Grade Entry</h3>
              <span className="badge badge-neutral">Class 10-A (Mathematics)</span>
            </div>
            
            <div className="bg-card border rounded-lg p-6">
              <div className="flex gap-4 mb-6 border-b border-[var(--border)] pb-4">
                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                  <input type="radio" name="assessmentType" defaultChecked className="accent-primary" /> Formative (Ongoing)
                </label>
                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                  <input type="radio" name="assessmentType" className="accent-primary" /> Summative (Term End)
                </label>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between bg-[var(--bg-dark)] border p-3 rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-xs font-bold border">12</div>
                    <span className="font-semibold text-sm">Arjun Sharma</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="number" placeholder="Marks /20" className="bg-card border rounded px-2 py-1 text-white text-sm w-24 outline-none" defaultValue="18" />
                    <span className="badge badge-success w-10 text-center">A1</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-[var(--bg-dark)] border p-3 rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-xs font-bold border">15</div>
                    <span className="font-semibold text-sm">Neha Gupta</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="number" placeholder="Marks /20" className="bg-card border rounded px-2 py-1 text-white text-sm w-24 outline-none" defaultValue="14" />
                    <span className="badge badge-warning w-10 text-center">B2</span>
                  </div>
                </div>
              </div>
              <button className="btn btn-primary w-full mt-6 justify-center">Save Grades to DB</button>
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
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> AI Auto-Draft</>}
                </button>
              </div>
            </div>

            {/* AI Result Preview */}
            {generatedResult && (
              <div className="bg-[rgba(139,92,246,0.1)] border border-secondary rounded-lg p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-secondary flex items-center gap-2"><FileCheck className="w-4 h-4" /> AI Draft Generated</h4>
                  <button onClick={() => setGeneratedResult(null)} className="text-muted hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="text-sm text-muted">
                  <p className="font-semibold text-white mb-2">Example Question:</p>
                  <p className="italic">"{generatedResult[0]?.question || 'Generating content...'}"</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-primary text-xs py-1 flex-1">Approve & Publish</button>
                  <button className="btn btn-outline text-xs py-1 flex-1">Edit Draft</button>
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
