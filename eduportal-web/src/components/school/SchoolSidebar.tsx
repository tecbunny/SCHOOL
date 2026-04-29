"use client";

import { GraduationCap, Building, LayoutDashboard, FileText, Calendar, Book, BarChart, Users, BookOpen, PenTool, FilePlus, Award, ShieldCheck, FolderUp, Megaphone, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { signOut } from '@/lib/auth.client';

interface SchoolSidebarProps {
  role: 'student' | 'teacher' | 'hod' | 'moderator' | 'admin' | 'auditor';
}

export default function SchoolSidebar({ role }: SchoolSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notifications, setNotifications] = useState({ assignments: 1, materials: 3 });

  // Update global CSS variable for layout transition
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '80px' : '260px');
  }, [isCollapsed]);

  const clearNotification = (key: 'assignments' | 'materials') => {
    setNotifications(prev => ({ ...prev, [key]: 0 }));
  };
  
  const getNavItems = () => {
    switch (role) {
      case 'student':
        return (
          <>
            <Link href="/school/dashboard/student" className="nav-item active"><LayoutDashboard className="w-5 h-5" /> {!isCollapsed && <span>Dashboard</span>}</Link>
            <Link href="#" className="nav-item" onClick={() => clearNotification('assignments')}><FileText className="w-5 h-5" /> {!isCollapsed && <span>Assignments</span>} {!isCollapsed && notifications.assignments > 0 && <span className="badge badge-danger ml-auto">{notifications.assignments}</span>}</Link>
            <Link href="#" className="nav-item"><Calendar className="w-5 h-5" /> {!isCollapsed && <span>Timetable</span>}</Link>
            <Link href="#" className="nav-item"><Book className="w-5 h-5" /> {!isCollapsed && <span>Study Materials</span>}</Link>
            
            {!isCollapsed && <div className="mt-8 mb-2 px-4 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">NEP 2020</div>}
            <Link href="#" className="nav-item"><BarChart className="w-5 h-5" /> {!isCollapsed && <span>Progress Card</span>}</Link>
            <Link href="#" className="nav-item"><Users className="w-5 h-5" /> {!isCollapsed && <span>Peer Review</span>}</Link>
          </>
        );
      case 'teacher':
        return (
          <>
            <Link href="/school/dashboard/teacher" className="nav-item active"><LayoutDashboard className="w-5 h-5" /> {!isCollapsed && <span>Dashboard</span>}</Link>
            <Link href="#" className="nav-item"><Users className="w-5 h-5" /> {!isCollapsed && <span>My Classes</span>}</Link>
            <Link href="#" className="nav-item"><Calendar className="w-5 h-5" /> {!isCollapsed && <span>Attendance</span>}</Link>
            
            {!isCollapsed && <div className="mt-8 mb-2 px-4 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">NEP Academics</div>}
            <Link href="#" className="nav-item"><PenTool className="w-5 h-5" /> {!isCollapsed && <span>HPC Grading</span>}</Link>
            <Link href="#" className="nav-item"><FilePlus className="w-5 h-5" /> {!isCollapsed && <span>Quiz Creator</span>}</Link>
            
            {!isCollapsed && <div className="mt-8 mb-2 px-4 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Professional</div>}
            <Link href="#" className="nav-item"><Award className="w-5 h-5" /> {!isCollapsed && <span>CPD Tracker</span>}</Link>
          </>
        );
      case 'hod':
        return (
          <>
            <Link href="/school/dashboard/hod" className="nav-item active"><LayoutDashboard className="w-5 h-5" /> {!isCollapsed && <span>Overview</span>}</Link>
            <Link href="#" className="nav-item"><Users className="w-5 h-5" /> {!isCollapsed && <span>Staffing</span>}</Link>
            
            {!isCollapsed && <div className="mt-8 mb-2 px-4 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Compliance</div>}
            <Link href="#" className="nav-item"><BarChart className="w-5 h-5" /> {!isCollapsed && <span>Census Logs</span>}</Link>
            <Link href="#" className="nav-item"><BookOpen className="w-5 h-5" /> {!isCollapsed && <span>SMC Minutes</span>}</Link>
          </>
        );
      case 'moderator':
        return (
          <>
            <Link href="/school/dashboard/moderator" className="nav-item active"><LayoutDashboard className="w-5 h-5" /> {!isCollapsed && <span>Dashboard</span>}</Link>
            <Link href="#" className="nav-item"><BookOpen className="w-5 h-5" /> {!isCollapsed && <span>Syllabus Hub</span>}</Link>
            <Link href="#" className="nav-item" onClick={() => clearNotification('materials')}><FolderUp className="w-5 h-5" /> {!isCollapsed && <span>Uploads</span>} {!isCollapsed && notifications.materials > 0 && <span className="badge badge-warning ml-auto">{notifications.materials}</span>}</Link>
            
            {!isCollapsed && <div className="mt-8 mb-2 px-4 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Channels</div>}
            <Link href="#" className="nav-item"><Megaphone className="w-5 h-5" /> {!isCollapsed && <span>Broadcasts</span>}</Link>
          </>
        );
      case 'admin':
        return (
          <>
            <Link href="/admin/dashboard" className="nav-item active"><LayoutDashboard className="w-5 h-5" /> {!isCollapsed && <span>Platform</span>}</Link>
            <Link href="#" className="nav-item"><Building className="w-5 h-5" /> {!isCollapsed && <span>Schools</span>}</Link>
            <Link href="#" className="nav-item"><Users className="w-5 h-5" /> {!isCollapsed && <span>Users</span>}</Link>
            
            {!isCollapsed && <div className="mt-8 mb-2 px-4 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Security</div>}
            <Link href="#" className="nav-item"><ShieldCheck className="w-5 h-5" /> {!isCollapsed && <span>Vault Logs</span>}</Link>
            <Link href="#" className="nav-item"><FolderUp className="w-5 h-5" /> {!isCollapsed && <span>Snapshots</span>}</Link>
          </>
        );
      case 'auditor':
        return (
          <>
            <Link href="/auditor/dashboard" className="nav-item active"><LayoutDashboard className="w-5 h-5" /> {!isCollapsed && <span>Audit Portal</span>}</Link>
            <Link href="#" className="nav-item"><BarChart className="w-5 h-5" /> {!isCollapsed && <span>Compliance</span>}</Link>
            
            {!isCollapsed && <div className="mt-8 mb-2 px-4 text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Reporting</div>}
            <Link href="#" className="nav-item"><FileText className="w-5 h-5" /> {!isCollapsed && <span>Annuals</span>}</Link>
            <Link href="#" className="nav-item"><Award className="w-5 h-5" /> {!isCollapsed && <span>Certifications</span>}</Link>
          </>
        );
    }
  };

  const getProfile = () => {
    switch (role) {
      case 'student': return { name: 'Arjun Sharma', code: '78782609341', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' };
      case 'teacher': return { name: 'Mrs. Priya Nair', code: 'T000001', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d' };
      case 'hod': return { name: 'Dr. Anita Sharma', code: 'PR00001', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026703d' };
      case 'moderator': return { name: 'David Costa', code: 'MD00001', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026302d' };
      case 'admin': return { name: 'Super Admin', code: 'ADM-001', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026305d' };
      case 'auditor': return { name: 'External Auditor', code: 'AUD-772', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026308d' };
    }
  };

  const profile = getProfile();

  return (
    <aside className="sidebar glass-panel relative p-3">
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 bg-primary text-white p-1 rounded-full border-4 border-[var(--bg-dark)] shadow-lg z-10 hover:scale-110 transition-transform"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div className={`flex items-center gap-3 mb-10 mt-2 px-3 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="bg-primary/20 p-2 rounded-lg border border-primary/30">
          {role === 'moderator' || role === 'admin' ? <ShieldCheck className="text-primary w-6 h-6" /> : <GraduationCap className="text-primary w-6 h-6" />}
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h2 className="font-bold text-md tracking-tight leading-none">
              {role === 'student' ? 'EduPortal' : role === 'admin' ? 'EduAdmin' : role === 'auditor' ? 'EduAudit' : "St. Mary's"}
            </h2>
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1 block opacity-70">{role} Hub</span>
          </div>
        )}
      </div>

      <nav className="flex flex-col gap-1.5 flex-1 overflow-x-hidden">
        {getNavItems()}
      </nav>

      <div className={`mt-auto bg-black/20 rounded-xl p-3 flex items-center gap-3 border border-white/5 ${isCollapsed ? 'justify-center flex-col p-2' : ''}`}>
        <div className="relative">
          <img src={profile.avatar} alt={profile.name} className="w-9 h-9 rounded-full border-2 border-primary/50 object-cover" />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-[#000] rounded-full"></div>
        </div>
        {!isCollapsed && (
          <div className="flex-1 overflow-hidden">
            <p className="text-[13px] font-bold truncate leading-none mb-1">{profile.name}</p>
            <p className="text-[10px] text-muted truncate font-mono uppercase opacity-60">{profile.code}</p>
          </div>
        )}
        <button 
          onClick={() => signOut()} 
          className="text-muted hover:text-danger transition-colors bg-transparent border-none p-1.5 rounded-lg hover:bg-danger/10" 
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}

