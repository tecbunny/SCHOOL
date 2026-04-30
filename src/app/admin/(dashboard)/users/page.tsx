"use client";

import { Users, Search, Filter, Shield, UserPlus, Mail, ShieldCheck } from 'lucide-react';

const MOCK_USERS = [
  { id: 1, name: "Super Admin", role: "Platform Admin", email: "admin@eduportal.com", status: "Online", lastActive: "Just now" },
  { id: 2, name: "Dr. Anita Sharma", role: "School Admin", email: "anita.s@stmarys.edu", status: "Offline", lastActive: "2h ago" },
  { id: 3, name: "Mr. Rajesh Kumar", role: "School Admin", email: "rajesh.k@dps.edu", status: "Online", lastActive: "10m ago" },
  { id: 4, name: "Sarah Jenkins", role: "Auditor", email: "sarah.j@audit.ext", status: "Offline", lastActive: "1d ago" },
  { id: 5, name: "John Doe", role: "Platform Admin", email: "john.d@eduportal.com", status: "Online", lastActive: "Just now" },
];

export default function UsersPage() {
  return (
    <>
      <header className="header-glass py-4 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-secondary/20 p-2 rounded-lg">
            <Users className="w-6 h-6 text-secondary" />
          </div>
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        <button className="btn btn-secondary">
          <UserPlus className="w-4 h-4" /> Invite Admin
        </button>
      </header>

      <div className="p-8 flex flex-col gap-6">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search users by name, email or role..." 
              className="w-full bg-card border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-primary transition-colors"
            />
          </div>
          <button className="btn btn-outline gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* User Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_USERS.map((user) => (
            <div key={user.id} className="bg-card border border-[var(--border)] rounded-2xl p-6 hover:border-secondary/50 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xl">
                    {user.name.charAt(0)}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-[var(--bg-dark)] ${
                    user.status === 'Online' ? 'bg-success' : 'bg-muted'
                  }`}></div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-white/5 text-muted`}>
                  {user.role}
                </span>
              </div>
              
              <div className="mb-6">
                <h3 className="font-bold text-lg group-hover:text-secondary transition-colors">{user.name}</h3>
                <p className="text-sm text-muted flex items-center gap-2 mt-1">
                  <Mail className="w-3 h-3" /> {user.email}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <span className="text-xs text-muted">Last active: {user.lastActive}</span>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-white/5 rounded-lg text-muted hover:text-white transition-colors">
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-lg text-muted hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const MoreVertical = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
);
