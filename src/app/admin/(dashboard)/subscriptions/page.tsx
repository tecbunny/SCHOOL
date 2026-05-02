"use client";

import { CreditCard, TrendingUp, Building2, Calendar, Search, Filter, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase';

type SchoolPlan = {
  id: string;
  school_name: string;
  school_code: string;
  plan_type: string | null;
  status: string;
  created_at: string;
};

export default function SubscriptionsPage() {
  const [schools, setSchools] = useState<SchoolPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('schools')
        .select('id, school_name, school_code, plan_type, status, created_at')
        .order('created_at', { ascending: false });

      if (error) console.error('Failed to fetch subscription plans:', error);
      else setSchools((data || []) as SchoolPlan[]);
      setLoading(false);
    };

    fetchPlans();
  }, []);

  const filteredSchools = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return schools;
    return schools.filter((school) =>
      [school.school_name, school.school_code, school.plan_type, school.status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [schools, search]);

  const activePlans = schools.filter((school) => school.status === 'active').length;
  const premiumPlans = schools.filter((school) => school.plan_type === 'premium').length;
  const reviewQueue = schools.filter((school) => school.status !== 'active').length;

  return (
    <>
      <header className="header-glass py-4 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Plans & Tenant Accounts</h1>
        </div>
        <button className="btn btn-primary">Manage Plans</button>
      </header>

      <div className="p-8 flex flex-col gap-8">
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-card border border-[var(--border)] p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Active Tenants</p>
            <h3 className="text-3xl font-bold">{activePlans}</h3>
          </div>
          <div className="bg-card border border-[var(--border)] p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Premium Plans</p>
            <h3 className="text-3xl font-bold">{premiumPlans}</h3>
          </div>
          <div className="bg-card border border-[var(--border)] p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Review Queue</p>
            <h3 className="text-3xl font-bold">{reviewQueue}</h3>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by school or plan type..."
              className="w-full bg-card border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-primary transition-colors"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <button className="btn btn-outline gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        <div className="table-wrapper">
          <table className="w-full">
            <thead>
              <tr>
                <th>School</th>
                <th>Plan Tier</th>
                <th>School Code</th>
                <th>Tenant Status</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6}>
                    <div className="flex justify-center py-16">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  </td>
                </tr>
              )}

              {!loading && filteredSchools.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="font-semibold text-white">{item.school_name}</td>
                  <td>
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                      item.plan_type === 'premium' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                    }`}>
                      {(item.plan_type || 'standard').toUpperCase()}
                    </span>
                  </td>
                  <td className="font-mono">{item.school_code}</td>
                  <td>
                    <span className={`badge ${item.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="text-muted text-sm">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="text-right">
                    <a className="text-sm text-primary hover:underline" href={`/admin/schools/${item.id}`}>Open Tenant</a>
                  </td>
                </tr>
              ))}

              {!loading && filteredSchools.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted font-bold">
                    No matching plans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
