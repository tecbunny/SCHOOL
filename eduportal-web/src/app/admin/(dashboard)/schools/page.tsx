"use client";

import { Building, Search, Filter, Plus, MoreVertical, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface School {
  id: string;
  name: string;
  code: string;
  city: string;
  plan: string;
  status: string;
  students: number;
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedSchools.length === schools.length) setSelectedSchools([]);
    else setSelectedSchools(schools.map(s => s.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedSchools(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const fetchSchools = async () => {
    try {
      const res = await fetch('/api/admin/schools');
      const data = await res.json();
      if (res.ok) setSchools(data);
    } catch (err) {
      console.error("Failed to fetch schools:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/schools', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) fetchSchools();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <header className="header-glass py-4 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Building className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">School Management</h1>
        </div>
        <Link href="/admin/provision" className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add New School
        </Link>
      </header>

      <div className="p-8 flex flex-col gap-6">
        {/* Bulk Actions Bar */}
        {selectedSchools.length > 0 && (
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center justify-between animate-in slide-in-from-top-4">
            <span className="text-sm font-bold text-primary">{selectedSchools.length} schools selected</span>
            <div className="flex gap-2">
              <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(selectedSchools[0], 'active')}>Activate All</button>
              <button className="btn btn-outline btn-sm text-danger border-danger/20 hover:bg-danger/10" onClick={() => handleUpdateStatus(selectedSchools[0], 'suspended')}>Suspend All</button>
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedSchools([])}>Cancel</button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search schools by name or code..." 
              className="w-full bg-card border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-primary transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-outline gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="w-10">
                    <input 
                      type="checkbox" 
                      className="accent-primary"
                      checked={selectedSchools.length === schools.length && schools.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>School Details</th>
                  <th>Location</th>
                  <th>Plan</th>
                  <th>Students</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchools.map((school) => (
                  <tr key={school.id} className={`hover:bg-white/[0.02] transition-colors ${selectedSchools.includes(school.id) ? 'bg-primary/5' : ''}`}>
                    <td>
                      <input 
                        type="checkbox" 
                        className="accent-primary"
                        checked={selectedSchools.includes(school.id)}
                        onChange={() => toggleSelect(school.id)}
                      />
                    </td>
                    <td>
                      <div className="font-semibold text-white">{school.name}</div>
                      <div className="text-xs text-muted font-mono mt-1">{school.code}</div>
                    </td>
                    <td>{school.city || 'N/A'}</td>
                    <td>
                      <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                        school.plan === 'premium' ? 'bg-primary/10 text-primary' : 
                        school.plan === 'standard' ? 'bg-secondary/10 text-secondary' : 'bg-muted/10 text-muted'
                      }`}>
                        {school.plan}
                      </span>
                    </td>
                    <td>{school.students}</td>
                    <td>
                      <span className={`badge ${
                        school.status === 'active' ? 'badge-success' : 
                        school.status === 'trial' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {school.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted hover:text-white" 
                          title={school.status === 'active' ? 'Suspend' : 'Activate'}
                          onClick={() => handleUpdateStatus(school.id, school.status === 'active' ? 'suspended' : 'active')}
                        >
                          {school.status === 'active' ? <XCircle className="w-4 h-4 text-danger" /> : <CheckCircle className="w-4 h-4 text-success" />}
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

const XCircle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
);

const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

