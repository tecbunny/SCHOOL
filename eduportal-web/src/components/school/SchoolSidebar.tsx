"use client";

import { GraduationCap, LayoutDashboard, FileText, Calendar, Book, BarChart, Users, BookOpen, PenTool, FilePlus, Award, ShieldCheck, FolderUp, Megaphone, LogOut } from 'lucide-react';
import Link from 'next/link';

interface SchoolSidebarProps {
  role: 'student' | 'teacher' | 'hod' | 'moderator';
}

export default function SchoolSidebar({ role }: SchoolSidebarProps) {
  
  const getNavItems = () => {
    switch (role) {
      case 'student':
        return (
          <>
            <Link href="/school/dashboard/student" className="nav-item active"><LayoutDashboard className="w-5 h-5" /> Dashboard</Link>
            <Link href="#" className="nav-item"><FileText className="w-5 h-5" /> Assignments <span className="badge badge-danger ml-auto">1</span></Link>
            <Link href="#" className="nav-item"><Calendar className="w-5 h-5" /> Timetable</Link>
            <Link href="#" className="nav-item"><Book className="w-5 h-5" /> Study Materials</Link>
            
            <div className="mt-6 mb-2 px-4 text-xs font-semibold text-muted tracking-wider">NEP 2020</div>
            <Link href="#" className="nav-item"><BarChart className="w-5 h-5" /> Holistic Progress Card</Link>
            <Link href="#" className="nav-item"><Users className="w-5 h-5" /> Peer Assessment</Link>
          </>
        );
      case 'teacher':
        return (
          <>
            <Link href="/school/dashboard/teacher" className="nav-item active"><LayoutDashboard className="w-5 h-5" /> Dashboard</Link>
            <Link href="#" className="nav-item"><Users className="w-5 h-5" /> My Classes</Link>
            <Link href="#" className="nav-item"><Calendar className="w-5 h-5" /> Mark Attendance</Link>
            
            <div className="mt-6 mb-2 px-4 text-xs font-semibold text-muted tracking-wider">NEP ACADEMICS</div>
            <Link href="#" className="nav-item"><PenTool className="w-5 h-5" /> Grade Entry (HPC)</Link>
            <Link href="#" className="nav-item"><FilePlus className="w-5 h-5" /> Paper/Quiz Creator</Link>
            
            <div className="mt-6 mb-2 px-4 text-xs font-semibold text-muted tracking-wider">PROFESSIONAL</div>
            <Link href="#" className="nav-item"><Award className="w-5 h-5" /> CPD Tracker</Link>
          </>
        );
      case 'hod':
        return (
          <>
            <Link href="/school/dashboard/hod" className="nav-item active"><LayoutDashboard className="w-5 h-5" /> Overview</Link>
            <Link href="#" className="nav-item"><Users className="w-5 h-5" /> Teacher Management</Link>
            
            <div className="mt-6 mb-2 px-4 text-xs font-semibold text-muted tracking-wider">NEP 2020</div>
            <Link href="#" className="nav-item"><BarChart className="w-5 h-5" /> Census Assessments</Link>
            <Link href="#" className="nav-item"><BookOpen className="w-5 h-5" /> SMC Tools</Link>
          </>
        );
      case 'moderator':
        return (
          <>
            <Link href="/school/dashboard/moderator" className="nav-item active"><LayoutDashboard className="w-5 h-5" /> Dashboard</Link>
            <Link href="#" className="nav-item"><BookOpen className="w-5 h-5" /> Syllabus Manager</Link>
            <Link href="#" className="nav-item"><FolderUp className="w-5 h-5" /> Study Materials <span className="badge badge-warning ml-auto">3</span></Link>
            
            <div className="mt-6 mb-2 px-4 text-xs font-semibold text-muted tracking-wider">COMMUNICATION</div>
            <Link href="#" className="nav-item"><Megaphone className="w-5 h-5" /> School Announcements</Link>
          </>
        );
    }
  };

  const getProfile = () => {
    switch (role) {
      case 'student': return { name: 'Arjun Sharma', code: '78782609341', initials: 'AS' };
      case 'teacher': return { name: 'Mrs. Priya Nair', code: 'T000001', initials: 'PN' };
      case 'hod': return { name: 'Dr. Anita Sharma', code: 'PR00001', initials: 'PR' };
      case 'moderator': return { name: 'David Costa', code: 'MD00001', initials: 'MD' };
    }
  };

  const profile = getProfile();

  return (
    <aside className="sidebar">
      <div className="flex items-center gap-3 mb-8 px-4">
        {role === 'moderator' ? <ShieldCheck className="text-primary w-8 h-8" /> : <GraduationCap className="text-primary w-8 h-8" />}
        <div>
          <h2 className="font-bold text-lg leading-tight">{role === 'student' ? 'Student Portal' : "St. Mary's"}</h2>
          <span className="text-xs text-muted font-semibold tracking-wider uppercase">{role}</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {getNavItems()}
      </nav>

      <div className="mt-auto border-t border-[var(--border)] pt-4 flex items-center gap-3 px-2">
        <div className="bg-[var(--bg-dark)] border rounded-full w-10 h-10 flex items-center justify-center font-bold text-muted">{profile.initials}</div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{profile.name}</p>
          <p className="text-xs text-muted">{profile.code}</p>
        </div>
        <Link href="/school" className="text-muted hover:text-danger" title="Logout">
          <LogOut className="w-5 h-5" />
        </Link>
      </div>
    </aside>
  );
}
