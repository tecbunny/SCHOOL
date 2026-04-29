"use client";

import { GraduationCap, Building, LayoutDashboard, FileText, Calendar, Book, BarChart, Users, BookOpen, PenTool, FilePlus, Award, ShieldCheck, FolderUp, Megaphone, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { signOut } from '@/lib/auth-utils';

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
            <Link href="/school/dashboard/student" className="nav-item active"><LayoutDashboard className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Dashboard'}</Link>
            <Link href="#" className="nav-item" onClick={() => clearNotification('assignments')}><FileText className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Assignments'} {!isCollapsed && notifications.assignments > 0 && <span className="badge badge-danger ml-auto animate-pulse">{notifications.assignments}</span>}</Link>
            <Link href="#" className="nav-item"><Calendar className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Timetable'}</Link>
            <Link href="#" className="nav-item"><Book className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Study Materials'}</Link>
            
            {!isCollapsed && <div className="mt-6 mb-2 px-4 text-xs font-semibold text-muted tracking-wider">NEP 2020</div>}
            <Link href="#" className="nav-item"><BarChart className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Holistic Progress Card'}</Link>
            <Link href="#" className="nav-item"><Users className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Peer Assessment'}</Link>
          </>
        );
      case 'teacher':
        return (
          <>
            <Link href="/school/dashboard/teacher" className="nav-item active"><LayoutDashboard className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Dashboard'}</Link>
            <Link href="#" className="nav-item"><Users className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'My Classes'}</Link>
            <Link href="#" className="nav-item"><Calendar className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Mark Attendance'}</Link>
            
            {!isCollapsed && <div className="mt-6 mb-2 px-4 text-xs font-semibold text-muted tracking-wider">NEP ACADEMICS</div>}
            <Link href="#" className="nav-item"><PenTool className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Grade Entry (HPC)'}</Link>
            <Link href="#" className="nav-item"><FilePlus className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Paper/Quiz Creator'}</Link>
            
            {!isCollapsed && <div className="mt-6 mb-2 px-4 text-xs font-semibold text-muted tracking-wider">PROFESSIONAL</div>}
            <Link href="#" className="nav-item"><Award className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'CPD Tracker'}</Link>
          </>
        );
      case 'hod':
        return (
          <>
            <Link href="/school/dashboard/hod" className="nav-item active"><LayoutDashboard className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Overview'}</Link>
            <Link href="#" className="nav-item"><Users className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Teacher Management'}</Link>
            
            {!isCollapsed && <div className="mt-6 mb-2 px-4 text-xs font-semibold text-muted tracking-wider">NEP 2020</div>}
            <Link href="#" className="nav-item"><BarChart className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Census Assessments'}</Link>
            <Link href="#" className="nav-item"><BookOpen className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'SMC Tools'}</Link>
          </>
        );
      case 'moderator':
        return (
          <>
            <Link href="/school/dashboard/moderator" className="nav-item active"><LayoutDashboard className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Dashboard'}</Link>
            <Link href="#" className="nav-item"><BookOpen className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Syllabus Manager'}</Link>
            <Link href="#" className="nav-item" onClick={() => clearNotification('materials')}><FolderUp className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Study Materials'} {!isCollapsed && notifications.materials > 0 && <span className="badge badge-warning ml-auto animate-pulse">{notifications.materials}</span>}</Link>
            
            {!isCollapsed && <div className="mt-6 mb-2 px-4 text-xs font-semibold text-muted tracking-wider">COMMUNICATION</div>}
            <Link href="#" className="nav-item"><Megaphone className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'School Announcements'}</Link>
          </>
        );
      case 'admin':
        return (
          <>
            <Link href="/admin/dashboard" className="nav-item active"><LayoutDashboard className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Platform Overview'}</Link>
            <Link href="#" className="nav-item"><Building className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'School Management'}</Link>
            <Link href="#" className="nav-item"><Users className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'System Users'}</Link>
            
            {!isCollapsed && <div className="mt-6 mb-2 px-4 text-xs font-semibold text-muted tracking-wider">SYSTEM</div>}
            <Link href="#" className="nav-item"><ShieldCheck className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Security Logs'}</Link>
            <Link href="#" className="nav-item"><FolderUp className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Backups'}</Link>
          </>
        );
      case 'auditor':
        return (
          <>
            <Link href="/auditor/dashboard" className="nav-item active"><LayoutDashboard className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Auditor Home'}</Link>
            <Link href="#" className="nav-item"><BarChart className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Compliance Maps'}</Link>
            
            {!isCollapsed && <div className="mt-6 mb-2 px-4 text-xs font-semibold text-muted tracking-wider">REPORTS</div>}
            <Link href="#" className="nav-item"><FileText className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'Annual Audits'}</Link>
            <Link href="#" className="nav-item"><Award className="w-5 h-5 min-w-[20px]" /> {!isCollapsed && 'NEP Certification'}</Link>
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
    <aside className="sidebar glass-panel relative">
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-primary text-white p-1 rounded-full border-4 border-card shadow-lg z-10"
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      <div className={`flex items-center gap-3 mb-8 px-4 ${isCollapsed ? 'justify-center' : ''}`}>
        {role === 'moderator' || role === 'admin' ? <ShieldCheck className="text-primary w-8 h-8 flex-shrink-0" /> : <GraduationCap className="text-primary w-8 h-8 flex-shrink-0" />}
        {!isCollapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <h2 className="font-bold text-lg leading-tight">
              {role === 'student' ? 'Student Portal' : role === 'admin' ? 'EduAdmin' : role === 'auditor' ? 'EduAudit' : "St. Mary's"}
            </h2>
            <span className="text-xs text-muted font-semibold tracking-wider uppercase">{role}</span>
          </div>
        )}
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {getNavItems()}
      </nav>

      <div className={`mt-auto border-t border-[var(--border)] pt-4 flex items-center gap-3 px-2 ${isCollapsed ? 'justify-center flex-col' : ''}`}>
        <img src={profile.avatar} alt={profile.name} className="w-10 h-10 rounded-full border-2 border-primary object-cover" />
        {!isCollapsed && (
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">{profile.name}</p>
            <p className="text-xs text-muted truncate">{profile.code}</p>
          </div>
        )}
        <button 
          onClick={() => signOut()} 
          className="text-muted hover:text-danger mt-1 bg-transparent border-none p-0" 
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
