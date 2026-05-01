"use client";

import { 
  Building, 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Book, 
  BarChart, 
  Users, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Inbox, 
  BarChart2, 
  ShieldCheck, 
  Cpu, 
  Monitor,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signOut } from '@/lib/auth.client';
import BrandIcon from '@/components/BrandIcon';
import ThemeToggle from '@/components/ThemeToggle';

interface SchoolSidebarProps {
  role: 'student' | 'teacher' | 'hod' | 'moderator' | 'admin' | 'auditor' | 'alumni';
}

export default function SchoolSidebar({ role }: SchoolSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notifications] = useState({ assignments: 1, materials: 3 });
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '90px' : '280px');
  }, [isCollapsed]);

  const getNavItems = () => {
    const activeClass = "bg-primary/10 text-primary border-primary/20";
    const inactiveClass = "text-muted hover:bg-primary/5 hover:text-primary border-transparent";
    const itemBase = "nav-item flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 font-bold text-sm mb-1 group";

    const renderLink = (href: string, label: string, Icon: any, badge?: number) => (
      <Link href={href} className={`${itemBase} ${href !== '#' && pathname.startsWith(href) ? activeClass : inactiveClass}`}>
        <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
        {!isCollapsed && <span className="flex-1 truncate">{label}</span>}
        {!isCollapsed && badge ? (
          <span className="bg-danger/20 text-danger text-[10px] px-2 py-0.5 rounded-full border border-danger/20 animate-pulse">
            {badge}
          </span>
        ) : null}
      </Link>
    );

    const renderSection = (title: string) => !isCollapsed && (
      <div className="mt-8 mb-3 px-4 text-[10px] font-black text-muted uppercase tracking-widest opacity-60">
        {title}
      </div>
    );

    switch (role) {
      case 'student':
        return (
          <>
            {renderLink('/school/dashboard/student', 'My Dashboard', LayoutDashboard)}
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
        return null;
    }
  };

  const getProfile = () => {
    switch (role) {
      case 'student': return { name: 'Arjun Sharma', code: '78782609341', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' };
      case 'admin': return { name: 'Super Admin', code: 'ADM-001', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026305d' };
      case 'auditor': return { name: 'Regional Auditor', code: 'AUD-772', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026308d' };
      default: return { name: 'System User', code: 'USR-000', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026302d' };
    }
  };

  const profile = getProfile();

  return (
    <aside className="h-screen border-r flex flex-col p-4 relative transition-all duration-500 ease-in-out sidebar-glass overflow-hidden">
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-12 bg-primary text-white p-2 rounded-full border shadow-xl z-50 hover:scale-110 transition-transform active:scale-95"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div className={`flex items-center gap-4 mb-12 mt-4 px-2 ${isCollapsed ? 'justify-center' : ''}`}>
        <BrandIcon className={isCollapsed ? "w-8 h-8" : "w-10 h-10"} />
        {!isCollapsed && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h2 className="font-black text-xl tracking-tighter leading-none">
              EduPortal<span className="text-primary">.</span>
            </h2>
            <span className="text-[10px] text-primary font-black uppercase tracking-widest mt-1 block opacity-80">{role} hub</span>
          </div>
        )}
      </div>

      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1">
        {getNavItems()}
      </nav>

      <div className={`mt-8 bg-primary/5 rounded-2xl p-4 flex items-center gap-4 border border-primary/20 ${isCollapsed ? 'justify-center flex-col p-2 gap-6' : ''}`}>
        <div className="relative flex-shrink-0">
          <img src={profile.avatar} alt={profile.name} className="w-10 h-10 rounded-2xl border-2 border-primary/50 object-cover shadow-lg" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-4 rounded-full"></div>
        </div>
        {!isCollapsed && (
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-black truncate leading-none mb-1">{profile.name}</p>
            <p className="text-[10px] text-muted truncate font-mono font-bold uppercase tracking-widest">{profile.code}</p>
          </div>
        )}
        <div className={`flex items-center gap-2 ${isCollapsed ? 'flex-col' : ''}`}>
          <ThemeToggle />
          <button onClick={() => signOut()} className="text-muted hover:text-danger transition-all bg-white/5 p-2.5 rounded-xl hover:bg-danger/10 border border-transparent hover:border-danger/20">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
