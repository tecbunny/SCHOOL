"use client";

import { BellRing, Award, CalendarCheck, ClipboardList, Building, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { ChatDrawer } from '@/components/school/ClassroomTools';
import { useState, useEffect } from 'react';
import { createClient, useDeviceMonitoring } from '@/lib/auth.client';
import DigitalIDCard from '@/components/school/DigitalIDCard';

export default function StudentDashboard() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string>('');
  const [showID, setShowID] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setStudentId(user.id);
    };
    fetchUser();
  }, []);

  // Activate Cloud Monitoring & Remote Control
  useDeviceMonitoring(studentId, 'Browsing Student Dashboard');

  const toggleRow = (subject: string) => {
    setExpandedRow(expandedRow === subject ? null : subject);
  };
  return (
    <>
      <header className="header-glass py-4 px-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome back, Arjun! 👋</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setZenMode(!zenMode)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              zenMode ? 'bg-secondary text-white' : 'bg-white/5 text-muted hover:bg-white/10'
            }`}
          >
            {zenMode ? 'Exit Zen Mode' : 'Enter Zen Mode'}
          </button>
          <button 
            onClick={() => setShowID(true)}
            className="bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-bold hover:bg-primary/20 transition-all flex items-center gap-2"
          >
            View Secure ID
          </button>
          <div className="bg-[var(--bg-dark)] px-3 py-1 rounded-full border text-sm text-muted flex items-center gap-2">
            <Building className="w-4 h-4" /> St. Mary's Convent
          </div>
        </div>
      </header>

      <div className="p-8 flex flex-col gap-8 flex-1">
        
        {!zenMode && (
          <>
            <div className="glass-panel border border-primary rounded-lg p-5 flex items-center gap-4 animate-gradient" style={{ backgroundImage: 'linear-gradient(270deg, rgba(139,92,246,0.15), rgba(244,114,182,0.15))' }}>
              <div className="bg-primary/20 p-3 rounded-full">
                <BellRing className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-primary tracking-tight">New AI Quiz Available!</h3>
                <p className="text-sm text-muted mt-1">Your Math teacher has generated an AI Rapid Test for "Quadratic Equations".</p>
              </div>
              <button className="btn btn-primary ml-auto animate-pulse-glow shadow-lg">Take Quiz Now</button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="stat-card">
                <div className="flex justify-between items-center text-muted text-sm font-semibold">
                  CURRENT CGPA <Award className="w-4 h-4 text-primary" />
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="3" />
                      <path strokeDasharray="82, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" strokeWidth="3" className="animate-[pulse_2s_ease-in-out_infinite]" />
                    </svg>
                    <div className="absolute font-bold text-lg">8.2</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-primary font-semibold tracking-wider uppercase mb-1">Excellent</div>
                    <div className="text-xs text-muted flex items-center gap-1">Top 15% of class</div>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex justify-between items-center text-muted text-sm font-semibold">
                  ATTENDANCE <CalendarCheck className="w-4 h-4 text-success" />
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(52, 211, 153, 0.2)" strokeWidth="3" />
                      <path strokeDasharray="94, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--success)" strokeWidth="3" />
                    </svg>
                    <div className="absolute font-bold text-lg text-success">94%</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-success font-semibold tracking-wider uppercase mb-1">On Track</div>
                    <div className="text-xs text-muted">Safe from 75% rule</div>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex justify-between items-center text-muted text-sm font-semibold">
                  PENDING TASKS <ClipboardList className="w-4 h-4 text-danger" />
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(251, 113, 133, 0.2)" strokeWidth="3" />
                      <path strokeDasharray="10, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--danger)" strokeWidth="3" />
                    </svg>
                    <div className="absolute font-bold text-lg text-danger">1</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-danger font-semibold tracking-wider uppercase mb-1">Action Needed</div>
                    <div className="text-xs text-muted">Science lab due tomorrow</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="bg-card border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Holistic Progress Card (Snapshot)</h3>
            <button className="btn btn-outline text-xs"><Download className="w-4 h-4" /> Download Full HPC</button>
          </div>
          
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left pb-2 text-muted text-sm">Domain</th>
                <th className="text-left pb-2 text-muted text-sm">Subject / Skill</th>
                <th className="text-left pb-2 text-muted text-sm">Formative</th>
                <th className="text-left pb-2 text-muted text-sm">Summative</th>
                <th className="text-left pb-2 text-muted text-sm">CBSE Grade</th>
              </tr>
            </thead>
            <tbody className="border-t border-[var(--border)]">
              {/* Math Row */}
              <tr className="cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors" onClick={() => toggleRow('Math')}>
                <td className="py-4 font-semibold text-primary">Academic</td>
                <td className="py-4 text-white font-medium flex items-center gap-2">
                  Mathematics 
                  {expandedRow === 'Math' ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                </td>
                <td className="py-4 text-muted">18/20</td>
                <td className="py-4 text-muted">74/80</td>
                <td className="py-4"><span className="badge badge-success">A1</span></td>
              </tr>
              {expandedRow === 'Math' && (
                <tr className="bg-[rgba(0,0,0,0.2)]">
                  <td colSpan={5} className="py-4 px-8 text-sm">
                    <div className="grid grid-cols-3 gap-4 text-muted">
                      <div><strong className="text-white block mb-1">Formative Breakdown</strong> Quiz 1: 9/10<br/> Homework: 9/10</div>
                      <div><strong className="text-white block mb-1">Summative Breakdown</strong> Midterm: 36/40<br/> Finals: 38/40</div>
                      <div><strong className="text-white block mb-1">Teacher Notes</strong> "Excellent problem-solving skills shown in calculus."</div>
                    </div>
                  </td>
                </tr>
              )}

              {/* Science Row */}
              <tr className="border-t border-[var(--border)] cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors" onClick={() => toggleRow('Science')}>
                <td className="py-4 font-semibold text-primary">Academic</td>
                <td className="py-4 text-white font-medium flex items-center gap-2">
                  Science
                  {expandedRow === 'Science' ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                </td>
                <td className="py-4 text-muted">15/20</td>
                <td className="py-4 text-muted">65/80</td>
                <td className="py-4"><span className="badge badge-warning">B1</span></td>
              </tr>
              {expandedRow === 'Science' && (
                <tr className="bg-[rgba(0,0,0,0.2)]">
                  <td colSpan={5} className="py-4 px-8 text-sm">
                    <div className="grid grid-cols-3 gap-4 text-muted">
                      <div><strong className="text-white block mb-1">Formative Breakdown</strong> Lab Work: 7/10<br/> Project: 8/10</div>
                      <div><strong className="text-white block mb-1">Summative Breakdown</strong> Midterm: 30/40<br/> Finals: 35/40</div>
                      <div><strong className="text-white block mb-1">Teacher Notes</strong> "Needs more focus on Physics numericals."</div>
                    </div>
                  </td>
                </tr>
              )}

              {/* PE Row */}
              <tr className="border-t border-[var(--border)] cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors" onClick={() => toggleRow('PE')}>
                <td className="py-4 font-semibold text-secondary">Co-Scholastic</td>
                <td className="py-4 text-white font-medium flex items-center gap-2">
                  Physical Education
                  {expandedRow === 'PE' ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                </td>
                <td className="py-4 text-muted">--</td>
                <td className="py-4 text-muted">--</td>
                <td className="py-4"><span className="badge badge-success">A2</span></td>
              </tr>
              {expandedRow === 'PE' && (
                <tr className="bg-[rgba(0,0,0,0.2)]">
                  <td colSpan={5} className="py-4 px-8 text-sm text-muted">
                    <strong className="text-white block mb-1">Assessment Criteria</strong> Participates actively in team sports. Demonstrates good leadership during football matches.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <ChatDrawer title="10-A Math Class" />

      {/* Profile / ID Modal */}
      {showID && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowID(false)}>
          <div onClick={e => e.stopPropagation()}>
            <DigitalIDCard user={{ full_name: 'Arjun Sharma', user_code: '78782609341', role: 'STUDENT' }} />
          </div>
        </div>
      )}
    </>
  );
}
