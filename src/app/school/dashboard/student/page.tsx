"use client";

import { useEffect, useState } from 'react';
import StudentDesk from '@/features/student-portal/StudentDesk';
import HPCViewer from '@/features/student-portal/HPCViewer';
import LiveTestEngine from '@/features/student-portal/LiveTestEngine';
import StudyHub from '@/features/student-portal/StudyHub';
import { isStudentHubDevice } from '@/lib/device.client';
import { createClient } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  BookOpen, 
  Zap, 
  BarChart, 
  Settings,
  Power,
  Bell
} from 'lucide-react';

type StudentTab = 'desk' | 'hub' | 'test' | 'hpc';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<StudentTab>('desk');
  const [isStudentHub] = useState(() => isStudentHubDevice());
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*, schools(school_name)')
        .eq('id', user.id)
        .single();
      
      if (data) setProfile(data);
    };
    fetchProfile();
  }, []);

  const navItems = [
    { id: 'desk', label: 'My Desk', icon: LayoutDashboard, color: 'text-primary' },
    { id: 'hub', label: 'Study Hub', icon: BookOpen, color: 'text-secondary' },
    { id: 'test', label: 'Live Test', icon: Zap, color: 'text-warning' },
    { id: 'hpc', label: 'My Progress', icon: BarChart, color: 'text-success' },
  ];

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden select-none">
      
      {/* Side Navigation (Optimized for Touch) */}
      <aside className="w-32 bg-black border-r border-white/5 flex flex-col items-center py-8 gap-10">
         <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-2xl font-black text-white">E</span>
         </div>

         <nav className="flex-1 flex flex-col gap-6">
            {navItems.map((item) => (
               <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id as StudentTab)}
                  className={`w-20 h-20 rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all active:scale-90 ${activeTab === item.id ? `bg-white/10 ${item.color} border border-white/10` : 'text-muted hover:bg-white/5'}`}
               >
                  <item.icon className="w-8 h-8" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label.split(' ')[1] || item.label}</span>
               </button>
            ))}
         </nav>

         <div className="flex flex-col gap-6">
            <button className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-muted hover:text-white transition-all">
               <Settings className="w-6 h-6" />
            </button>
            <button className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center text-danger hover:bg-danger/20 transition-all">
               <Power className="w-6 h-6" />
            </button>
         </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative">
         
         {/* Top Bar */}
         <header className="h-24 px-12 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md">
            <div>
               <h1 className="text-3xl font-black text-white">
                  {navItems.find(n => n.id === activeTab)?.label}
               </h1>
               <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">
                 {profile?.schools?.school_name || "St. Mary's Convent"} - {profile?.class_id || "Grade 10-A"}
               </p>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                  <Bell className="w-5 h-5 text-muted" />
                  <div className="w-2 h-2 bg-danger rounded-full animate-pulse"></div>
               </div>
                <div className="flex items-center gap-4">
                   <div className="text-right">
                      <div className="text-sm font-bold text-white">{profile?.full_name || "Arjun Sharma"}</div>
                      <div className="text-[10px] text-muted font-mono">ID: {profile?.user_code || "7878-2609"}</div>
                   </div>
                  <img 
                     src="https://i.pravatar.cc/150?u=a042581f4e29026704d" 
                     alt="Arjun" 
                     className="w-14 h-14 rounded-[1.2rem] border-2 border-primary/50 object-cover shadow-lg" 
                  />
               </div>
            </div>
         </header>

         {/* Content Viewport */}
         <main className="flex-1 overflow-hidden p-12">
            <div className="w-full h-full max-w-[1400px] mx-auto animate-in fade-in duration-500">
               {activeTab === 'desk' && <StudentDesk />}
               {activeTab === 'hub' && <StudyHub />}
               {activeTab === 'test' && (
                 isStudentHub ? <LiveTestEngine classId="grade_10_a" /> : (
                   <div className="h-full flex flex-col items-center justify-center text-center gap-5">
                     <div className="bg-warning/10 border border-warning/20 rounded-[2rem] p-6">
                       <Zap className="w-16 h-16 text-warning" />
                     </div>
                     <div>
                       <h2 className="text-3xl font-black text-white">Student Hub Required</h2>
                       <p className="text-muted max-w-md mt-3">
                         You can study and view progress on web, but exams, tests, and quizzes must be answered only on the assigned Student Hub device.
                       </p>
                     </div>
                   </div>
                 )
               )}
               {activeTab === 'hpc' && <HPCViewer />}
            </div>
         </main>

         {/* Global Edge Hardware Status (Floating) */}
         <div className="absolute bottom-8 right-8 bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-[2rem] flex items-center gap-4 shadow-2xl z-50 pointer-events-none">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-success rounded-full"></div>
               <span className="text-[10px] font-bold text-white uppercase tracking-widest">{isStudentHub ? 'Student Hub Online' : 'Web Study Mode'}</span>
            </div>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Sync: 12ms</span>
            </div>
         </div>
      </div>

    </div>
  );
}

