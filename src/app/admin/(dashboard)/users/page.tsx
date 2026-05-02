"use client";

import { Users, Search, Filter, UserPlus, Mail, ShieldCheck, MoreVertical, Loader2, X, KeyRound, Copy, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase';

type AdminUser = {
  id: string;
  full_name: string | null;
  user_code: string;
  role: string;
  school_id: string | null;
  created_at: string;
  schools?: { school_name: string | null } | null;
};

type AdminUserRow = Omit<AdminUser, 'schools'> & {
  schools?: { school_name: string | null } | { school_name: string | null }[] | null;
};

const normalizeAdminUser = (user: AdminUserRow): AdminUser => ({
  ...user,
  schools: Array.isArray(user.schools) ? user.schools[0] ?? null : user.schools ?? null,
});

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<AdminUser | null>(null);
  const [authorizationLoading, setAuthorizationLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [authorizationCode, setAuthorizationCode] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, user_code, role, school_id, created_at, schools(school_name)')
        .in('role', ['admin', 'auditor', 'principal', 'teacher', 'moderator'])
        .order('created_at', { ascending: false });

      if (error) console.error('Failed to fetch accounts:', error);
      else setUsers(((data || []) as AdminUserRow[]).map(normalizeAdminUser));
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) => {
      const haystack = [
        user.full_name,
        user.user_code,
        user.role,
        user.schools?.school_name
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [search, users]);

  const canResetPassword = (role: string) => ['principal', 'teacher', 'moderator'].includes(role);

  const openStaffReset = (user: AdminUser) => {
    setSelectedStaff(user);
    setAuthorizationCode('');
    setTemporaryPassword('');
    setResetError('');
  };

  const generateAuthorizationCode = async () => {
    setAuthorizationLoading(true);
    setResetError('');
    setTemporaryPassword('');

    try {
      const response = await fetch('/api/admin/authorization-code', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authorization code generation failed');
      setAuthorizationCode(data.authorizationCode);
    } catch (err: unknown) {
      setResetError(err instanceof Error ? err.message : 'Authorization code generation failed');
    } finally {
      setAuthorizationLoading(false);
    }
  };

  const resetStaffPassword = async () => {
    if (!selectedStaff || !authorizationCode) return;
    setResetLoading(true);
    setResetError('');
    setTemporaryPassword('');

    try {
      const response = await fetch('/api/admin/staff/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffCode: selectedStaff.user_code,
          adminAuthorizationCode: authorizationCode,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Password reset failed');
      setTemporaryPassword(data.temporaryPassword);
    } catch (err: unknown) {
      setResetError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setResetLoading(false);
    }
  };

  const copyLoginDetails = () => {
    if (!selectedStaff || !temporaryPassword) return;
    navigator.clipboard.writeText(`Staff Login\nStaff Code: ${selectedStaff.user_code}\nTemporary Password: ${temporaryPassword}`);
  };

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
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <button className="btn btn-outline gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* User Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && (
            <div className="col-span-full flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-secondary" />
            </div>
          )}

          {!loading && filteredUsers.map((user) => (
            <div key={user.id} className="bg-card border border-[var(--border)] rounded-2xl p-6 hover:border-secondary/50 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xl">
                    {(user.full_name || user.user_code).charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-[var(--bg-dark)] bg-success"></div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-white/5 text-muted`}>
                  {user.role.replace(/_/g, ' ')}
                </span>
              </div>
              
              <div className="mb-6">
                <h3 className="font-bold text-lg group-hover:text-secondary transition-colors">{user.full_name || 'Unnamed account'}</h3>
                <p className="text-sm text-muted flex items-center gap-2 mt-1">
                  <Mail className="w-3 h-3" /> {user.user_code}
                </p>
                <p className="text-xs text-muted mt-2">{user.schools?.school_name || 'Platform account'}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <span className="text-xs text-muted">Created: {new Date(user.created_at).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <button
                    className="p-2 hover:bg-white/5 rounded-lg text-muted hover:text-white transition-colors disabled:opacity-30"
                    title={canResetPassword(user.role) ? 'Generate staff temporary password' : 'Password reset available for staff accounts'}
                    disabled={!canResetPassword(user.role)}
                    onClick={() => openStaffReset(user)}
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-lg text-muted hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!loading && filteredUsers.length === 0 && (
            <div className="col-span-full text-center py-20 text-muted font-bold">
              No matching accounts found.
            </div>
          )}
        </div>
      </div>

      {selectedStaff && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-card border border-[var(--border)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-secondary/10 border border-secondary/20 p-2 rounded-xl">
                  <KeyRound className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Staff Access Reset</h2>
                  <p className="text-xs text-muted font-mono">{selectedStaff.user_code}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStaff(null)} className="p-2 hover:bg-white/5 rounded-lg text-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div>
                <p className="text-sm font-bold">{selectedStaff.full_name || 'Staff account'}</p>
                <p className="text-xs text-muted mt-1">{selectedStaff.schools?.school_name || 'Institution account'}</p>
              </div>

              <button
                type="button"
                onClick={generateAuthorizationCode}
                className="btn btn-secondary w-full justify-center"
                disabled={authorizationLoading}
              >
                {authorizationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Generate Authorization Code
              </button>

              {authorizationCode && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                  <p className="text-[10px] text-muted uppercase tracking-widest">Authorization Code</p>
                  <p className="text-primary font-mono text-3xl font-black tracking-[0.2em] mt-1">{authorizationCode}</p>
                  <p className="text-[10px] text-muted mt-2">Valid for 10 minutes and usable once.</p>
                </div>
              )}

              <button
                type="button"
                onClick={resetStaffPassword}
                className="btn btn-primary w-full justify-center"
                disabled={!authorizationCode || resetLoading}
              >
                {resetLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                Generate Temporary Password
              </button>

              {resetError && (
                <div className="bg-danger/10 border border-danger/30 text-danger text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {resetError}
                </div>
              )}

              {temporaryPassword && (
                <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-success text-xs font-bold uppercase tracking-widest mb-2">
                    <CheckCircle2 className="w-4 h-4" /> Temporary Password
                  </div>
                  <p className="text-secondary font-mono font-bold break-all">{temporaryPassword}</p>
                  <button type="button" onClick={copyLoginDetails} className="btn btn-outline w-full justify-center mt-4">
                    <Copy className="w-4 h-4" /> Copy Login Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
