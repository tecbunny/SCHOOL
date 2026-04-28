import { Shield, LayoutDashboard, Building, Inbox, CreditCard, BarChart2, Users, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AdminSidebar() {
  return (
    <aside className="sidebar">
      <div className="flex items-center gap-3 mb-8 px-4">
        <Shield className="text-primary w-8 h-8" />
        <div>
          <h2 className="font-bold text-lg leading-tight">EduPortal</h2>
          <span className="text-xs text-muted font-semibold tracking-wider">SUPER ADMIN</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        <Link href="/admin/dashboard" className="nav-item active"><LayoutDashboard className="w-5 h-5" /> Platform Overview</Link>
        <Link href="#" className="nav-item"><Building className="w-5 h-5" /> Manage Schools</Link>
        <Link href="#" className="nav-item">
          <Inbox className="w-5 h-5" /> Registration Requests <span className="badge badge-warning ml-auto">3</span>
        </Link>
        <Link href="#" className="nav-item"><CreditCard className="w-5 h-5" /> Subscriptions</Link>
        <Link href="#" className="nav-item"><BarChart2 className="w-5 h-5" /> Global Analytics</Link>
        
        <div className="mt-6 mb-2 px-4 text-xs font-semibold text-muted tracking-wider">SYSTEM</div>
        <Link href="#" className="nav-item"><Users className="w-5 h-5" /> Admin Users</Link>
        <Link href="#" className="nav-item"><Settings className="w-5 h-5" /> Platform Settings</Link>
      </nav>

      <div className="mt-auto border-t border-[var(--border)] pt-4 flex items-center gap-3 px-2">
        <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center font-bold text-white">RV</div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Rahul Verma</p>
          <p className="text-xs text-muted">AD00001</p>
        </div>
        <Link href="/admin" className="text-muted hover:text-danger" title="Logout">
          <LogOut className="w-5 h-5" />
        </Link>
      </div>
    </aside>
  );
}
