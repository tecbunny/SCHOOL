import { Eye, LayoutDashboard, Building, FileCheck, BarChart3, CalendarCheck, Users, GitCompare, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AuditorSidebar() {
  return (
    <aside className="sidebar">
      <div className="flex items-center gap-3 mb-8 px-4">
        <Eye className="text-primary w-8 h-8" />
        <div>
          <h2 className="font-bold text-lg leading-tight">EduPortal</h2>
          <span className="text-xs text-muted font-semibold tracking-wider">AUDITOR</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        <Link href="/auditor/dashboard" className="nav-item active"><LayoutDashboard className="w-5 h-5" /> Dashboard</Link>
        <Link href="#" className="nav-item"><Building className="w-5 h-5" /> Assigned Schools</Link>
        <Link href="#" className="nav-item"><FileCheck className="w-5 h-5" /> Generated Reports</Link>
        
        <div className="mt-6 mb-2 px-4 text-xs font-semibold text-muted tracking-wider">ANALYTICS (READ-ONLY)</div>
        <Link href="#" className="nav-item"><BarChart3 className="w-5 h-5" /> Academic Performance</Link>
        <Link href="#" className="nav-item"><CalendarCheck className="w-5 h-5" /> Attendance Audit</Link>
        <Link href="#" className="nav-item"><Users className="w-5 h-5" /> Teacher Activity</Link>
        <Link href="#" className="nav-item"><GitCompare className="w-5 h-5" /> Compare Schools</Link>
      </nav>

      <div className="mt-auto border-t border-[var(--border)] pt-4 flex items-center gap-3 px-2">
        <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center font-bold text-white">MP</div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Dr. Meena Pillai</p>
          <p className="text-xs text-muted">AU00001</p>
        </div>
        <Link href="/auditor" className="text-muted hover:text-danger" title="Logout">
          <LogOut className="w-5 h-5" />
        </Link>
      </div>
    </aside>
  );
}
