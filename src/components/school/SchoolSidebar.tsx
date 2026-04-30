"use client";

import { 
  GraduationCap, 
  Building, 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Book, 
  BarChart, 
  Users, 
  BookOpen, 
  PenTool, 
  FilePlus, 
  Award, 
  ShieldCheck, 
  FolderUp, 
  Megaphone, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Inbox, 
  CreditCard, 
  BarChart2, 
  Settings, 
  Cpu, 
  Monitor, 
  Globe 
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { signOut } from '@/lib/auth.client';

interface SchoolSidebarProps {
  role: 'student' | 'teacher' | 'hod' | 'moderator' | 'admin' | 'auditor' | 'alumni';
}

export default function SchoolSidebar({ role }: SchoolSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notifications, setNotifications] = useState({ assignments: 1, materials: 3 });

  // Update global CSS variable for layout transition
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '90px' : '280px');
  }, [isCollapsed]);

  const getNavItems = () => {
    const activeClass = "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]";
    const inactiveClass = "text-muted hover:bg-white/5 hover:text-white border-transparent";
    const itemBase = "nav-item flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-300 font-bold text-sm mb-1 group";

    const renderLink = (href: string, label: string, Icon: any, badge?: number, colorClass?: string) => (
      <Link href={href} className={`${itemBase} ${href === '#' ? inactiveClass : activeClass}`}>
        <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${colorClass || ''}`} />
        {!isCollapsed && <span className="flex-1 truncate">{label}</span>}
        {!isCollapsed && badge && (
          <span className="bg-danger/20 text-danger text-[10px] px-2 py-0.5 rounded-full border border-danger/20 animate-pulse">
            {badge}
          </span>
        )}
      </Link>
    );

    const renderSection = (title: string) => !isCollapsed && (
      <div className="mt-8 mb-3 px-4 text-[10px] font-black text-muted uppercase tracking-[0.3em] opacity-40">
        {title}
      </div>
    );

    switch (role) {
      case 'student':
        return (
          <>
            {renderLink('/school/dashboard/student', 'My Dashboard', LayoutDashboard, 0)}
            {renderLink('#', 'Assignments', FileText, notifications.assignments)}
            {renderLink('#', 'Class Timetable', Calendar)}
            {renderLink('#', 'Study Hub', Book)}
            {renderSection('NEP 2020 ACADEMICS')}
            {renderLink('#', 'Holistic Card', BarChart)}
            {renderLink('#', 'Peer Reviews', Users)}
          </>
        );
      case 'admin':
        return (
          <>
            {renderLink('/admin/dashboard', 'Control Center', LayoutDashboard)}
            {renderLink('/admin/schools', 'Institutions', Building)}
            {renderLink('/admin/requests', 'Inbound Requests', Inbox, 3)}
            {renderLink('/admin/subscriptions', 'Billing & Plans', CreditCard)}
            {renderLink('/admin/analytics', 'Global Metrics', BarChart2)}
            {renderSection('INFRASTRUCTURE')}
            {renderLink('/admin/nodes', 'Edge Nodes', Cpu)}
            {renderLink('/admin/fleet', 'MDM Fleet', Monitor)}
            {renderLink('/admin/logs', 'Security Logs', ShieldCheck)}
          </>
        );
      case 'auditor':
        return (
          <>
            {renderLink('/auditor/dashboard', 'Audit Console', LayoutDashboard)}
            {renderLink('#', 'Compliance Check', BarChart)}
            {renderSection('OVERSIGHT')}
            {renderLink('#', 'Institutional Logs', FileText)}
            {renderLink('#', 'Certifications', Award)}
          </>
        );
      default:
        return null; // Simplified for brevity in this overhaul
    }
  };

  const getProfile = () => {
    switch (role) {
      case 'student': return { name: 'Arjun Sharma', code: '78782609341', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', color: 'primary' };
      case 'admin': return { name: 'Super Admin', code: 'ADM-001', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026305d', color: 'sky-500' };
      case 'auditor': return { name: 'Regional Auditor', code: 'AUD-772', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026308d', color: 'success' };
      default: return { name: 'System User', code: 'USR-000', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026302d', color: 'muted' };
    }
  };

  const profile = getProfile();

  return (
    <aside className="h-screen bg-[#070B19] border-r border-white/5 flex flex-col p-4 relative transition-all duration-500 ease-in-out sidebar-glass overflow-hidden">
      
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-12 bg-primary text-white p-1.5 rounded-full border-4 border-[#070B19] shadow-xl z-50 hover:scale-110 transition-transform active:scale-95"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Brand Header */}
      <div className={`flex items-center gap-4 mb-12 mt-4 px-2 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="relative group">
           <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:animate-pulse" />
           <div className="bg-primary/20 p-2.5 rounded-2xl border border-primary/30 relative z-10">
              <GraduationCap className="text-primary w-7 h-7" />
           </div>
        </div>
        {!isCollapsed && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h2 className="font-black text-xl tracking-tighter text-white leading-none">
              EduPortal<span className="text-primary">.</span>
            </h2>
            <span className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mt-1.5 block opacity-60">{role} hub</span>
          </div>
        )}
      </div>

      {/* Navigation Scroll Area */}
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1">
        {getNavItems()}
      </nav>

      {/* Profile Section */}
      <div className={`mt-8 bg-white/5 rounded-3xl p-4 flex items-center gap-4 border border-white/5 shadow-premium ${isCollapsed ? 'justify-center flex-col p-2 gap-6' : ''}`}>
        <div className="relative flex-shrink-0">
          <img 
            src={profile.avatar} 
            alt={profile.name} 
            className={`w-10 h-10 rounded-2xl border-2 border-primary/50 object-cover shadow-lg`} 
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-4 border-[#070B19] rounded-full"></div>
        </div>
        {!isCollapsed && (
          <div className="flex-1 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
            <p className="text-sm font-black text-white truncate leading-none mb-1">{profile.name}</p>
            <p className="text-[10px] text-muted truncate font-mono font-bold uppercase tracking-widest opacity-40">{profile.code}</p>
          </div>
        )}
        <button 
          onClick={() => signOut()} 
          className={`text-muted hover:text-danger transition-all bg-white/5 p-2.5 rounded-xl hover:bg-danger/10 border border-transparent hover:border-danger/20`} 
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

    </aside>
  );
}
