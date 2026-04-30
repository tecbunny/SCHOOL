"use client";

import { 
  Award, 
  MessageSquare, 
  Users, 
  Globe, 
  BookOpen, 
  TrendingUp,
  History,
  ShieldCheck,
  Star
} from 'lucide-react';
import SchoolSidebar from '@/components/school/SchoolSidebar';

export default function AlumniLegacyHub() {
  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <SchoolSidebar role="alumni" />
      
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        {/* Header */}
        <header className="header-glass py-8 px-12 flex items-center justify-between border-b border-white/5">
           <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-3 rounded-2xl">
                 <Award className="w-8 h-8 text-primary" />
              </div>
              <div>
                 <h1 className="text-3xl font-black">Legacy Hub</h1>
                 <p className="text-muted text-sm font-bold uppercase tracking-widest">Lifelong Institutional Engagement • Alumni Portal</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0a0a0a] bg-white/10" />
                 ))}
              </div>
              <span className="text-xs font-bold text-muted">1,200+ Mentors Online</span>
           </div>
        </header>

        {/* Content */}
        <div className="p-12 grid grid-cols-12 gap-8">
           
           {/* Left: Mentorship Ops */}
           <div className="col-span-8 flex flex-col gap-8">
              <div className="bg-card border border-white/5 rounded-[3rem] p-10 flex flex-col gap-8 shadow-2xl relative overflow-hidden group">
                 <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black">Mentorship Opportunities</h2>
                    <span className="bg-success/20 text-success px-4 py-1 rounded-full text-xs font-bold">Active Sessions</span>
                 </div>
                 
                 <div className="flex flex-col gap-4">
                    {[
                      { title: 'Career Path: Software Engineering', date: 'Tomorrow, 4:00 PM', attendees: 45 },
                      { title: 'University Admissions: Overseas', date: 'Sat, 11:00 AM', attendees: 120 },
                      { title: 'Vocational Skill Workshop: Pottery', date: 'Sun, 2:00 PM', attendees: 12 }
                    ].map((session, i) => (
                      <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/[0.08] transition-all flex items-center justify-between group/item">
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                               <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                               <h4 className="font-bold text-lg">{session.title}</h4>
                               <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">{session.date}</p>
                            </div>
                         </div>
                         <button className="btn btn-primary btn-sm px-6">Join Session</button>
                      </div>
                    ))}
                 </div>

                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-150 transition-transform"></div>
              </div>

              {/* Legacy Projects */}
              <div className="grid grid-cols-2 gap-8">
                 <div className="bg-card border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-4">
                    <History className="w-8 h-8 text-secondary mb-2" />
                    <h3 className="font-bold text-xl">Archive Access</h3>
                    <p className="text-xs text-muted leading-relaxed">View your historical HPCs, project reports, and teacher commendations from the last 10 years.</p>
                    <button className="text-xs font-bold text-secondary uppercase tracking-widest mt-4 hover:underline">Access Vault</button>
                 </div>
                 <div className="bg-card border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-4">
                    <Star className="w-8 h-8 text-warning mb-2" />
                    <h3 className="font-bold text-xl">Give Back</h3>
                    <p className="text-xs text-muted leading-relaxed">Sponsor a vocational skill kit or mentor a Grade 8 student through the bagless module.</p>
                    <button className="text-xs font-bold text-warning uppercase tracking-widest mt-4 hover:underline">View Programs</button>
                 </div>
              </div>
           </div>

           {/* Right: Stats & Recognition */}
           <div className="col-span-4 flex flex-col gap-8">
              <div className="bg-primary/10 border border-primary/20 rounded-[2.5rem] p-8 flex flex-col items-center text-center gap-4">
                 <ShieldCheck className="w-12 h-12 text-primary" />
                 <h3 className="font-black text-xl">Golden Alumni Status</h3>
                 <p className="text-xs text-muted font-bold uppercase tracking-widest">Class of 2018 • Senior Mentor</p>
                 <div className="w-full h-1 bg-white/10 rounded-full mt-4">
                    <div className="w-3/4 h-full bg-primary rounded-full"></div>
                 </div>
                 <div className="text-[10px] text-muted font-bold uppercase tracking-widest">750 Impact Points Earned</div>
              </div>

              <div className="bg-card border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6">
                 <h4 className="font-bold text-sm uppercase tracking-widest border-b border-white/5 pb-4">Recent Mentee Progress</h4>
                 <div className="flex flex-col gap-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-white/10" />
                         <div className="flex-1">
                            <div className="text-xs font-bold">Rohan Sharma (Grade 8)</div>
                            <div className="text-[10px] text-muted uppercase">Skill: Woodworking • +2 Hrs</div>
                         </div>
                         <TrendingUp className="w-4 h-4 text-success" />
                      </div>
                    ))}
                 </div>
              </div>
           </div>

        </div>
      </main>
    </div>
  );
}
